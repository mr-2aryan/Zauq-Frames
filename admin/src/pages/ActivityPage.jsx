import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import GppGoodIcon from '@mui/icons-material/GppGood';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  Chip,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { EmptyState, Loader, PageHeader } from '../components/ui.jsx';
import { api, download } from '../lib/api.js';
import { dateTime } from '../lib/format.js';
import { useData, useDebounced, useUi } from '../lib/hooks.jsx';

/** Friendly names for the parts of the admin (anything else is shown as it is). */
const AREAS = {
  activity: 'Activity log',
  admins: 'Admins',
  auth: 'Sign-ins',
  collections: 'Collections',
  'collections-order': 'Collection order',
  dashboard: 'Dashboard',
  media: 'Media library',
  messages: 'Messages',
  orders: 'Orders',
  products: 'Products',
  'products-order': 'Product order',
  reviews: 'Reviews',
  settings: 'Settings',
  subscribers: 'Subscribers',
};
const areaLabel = (area) => AREAS[area] ?? (area ? area.charAt(0).toUpperCase() + area.slice(1) : '—');

const NO_FILTERS = { admin: '', area: '', from: '', to: '', result: '' };

/** The filters as a query string (empty values left out). */
function toQuery(values) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value) params.set(key, String(value));
  return params.toString();
}

function VerifyResult({ result, onClose }) {
  if (result.ok) {
    return (
      <Alert severity="success" onClose={onClose} sx={{ mb: 2 }}>
        <AlertTitle sx={{ fontWeight: 800 }}>The log is intact</AlertTitle>
        All {result.checked.toLocaleString('en-PK')} entries were checked. None has been changed or removed since it was written.
      </Alert>
    );
  }
  return (
    <Alert severity="error" onClose={onClose} sx={{ mb: 2 }}>
      <AlertTitle sx={{ fontWeight: 800 }}>The log has been tampered with</AlertTitle>
      {result.brokenAt ? (
        <>
          The entry from {dateTime(result.brokenAt.at)} (&quot;{result.brokenAt.action}&quot;) doesn&apos;t match what was recorded, or an entry just before it is missing.{' '}
        </>
      ) : null}
      Someone may have edited or deleted log entries directly in the database. Export the log as it is now, and ask your developer to look into it. ({result.checked.toLocaleString('en-PK')} entries checked.)
    </Alert>
  );
}

export default function ActivityPage() {
  const { notify } = useUi();
  const [filters, setFilters] = useState(NO_FILTERS);
  const [search, setSearch] = useState('');
  const q = useDebounced(search.trim(), 300);
  const filterQuery = toQuery({ ...filters, q });
  // The page number belongs to one set of filters: changing a filter goes back to page 1.
  const [paging, setPaging] = useState({ key: '', page: 1 });
  const page = paging.key === filterQuery ? paging.page : 1;

  const listQuery = toQuery({ ...filters, q, page: page > 1 ? page : '' });
  const query = useData(`/activity${listQuery ? `?${listQuery}` : ''}`);
  const filterOptions = useData('/activity/filters');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(null);

  const set = (field) => (e) => setFilters((f) => ({ ...f, [field]: e.target.value }));
  const filtered = Boolean(filterQuery);

  const verify = async () => {
    setVerifying(true);
    setVerified(null);
    try {
      setVerified(await api('/activity/verify'));
      // Checking is itself recorded, so show the new entry.
      query.reload();
      filterOptions.reload();
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setVerifying(false);
    }
  };

  const admins = filterOptions.data?.admins ?? [];
  const areas = filterOptions.data?.areas ?? [];

  return (
    <>
      <PageHeader
        title="Activity log"
        subtitle="Every change made in the admin, and every sign-in, is recorded here automatically. Entries can't be edited or deleted."
        actions={
          <>
            <Button variant="outlined" startIcon={<GppGoodIcon />} onClick={verify} disabled={verifying}>
              {verifying ? 'Checking…' : 'Check the log is intact'}
            </Button>
            <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={() => download(`/activity/export.csv${filterQuery ? `?${filterQuery}` : ''}`)}>
              Export CSV
            </Button>
          </>
        }
      />

      {verified && <VerifyResult result={verified} onClose={() => setVerified(null)} />}

      <Card>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(6, minmax(0, 1fr))' }, gap: 2 }}>
            <TextField
              type="search"
              label="Search"
              placeholder="Action, item, email or IP"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ gridColumn: { xs: '1 / -1', md: 'span 3', lg: 'span 2' } }}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { maxLength: 80 },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField select label="Admin" value={filters.admin} onChange={set('admin')} slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}>
              <MenuItem value="">All admins</MenuItem>
              {admins.map((email) => (
                <MenuItem key={email} value={email}>
                  {email}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Area" value={filters.area} onChange={set('area')} slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}>
              <MenuItem value="">All areas</MenuItem>
              {areas.map((area) => (
                <MenuItem key={area} value={area}>
                  {areaLabel(area)}
                </MenuItem>
              ))}
            </TextField>
            <TextField type="date" label="From" value={filters.from} onChange={set('from')} slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: filters.to || undefined } }} />
            <TextField type="date" label="To" value={filters.to} onChange={set('to')} slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: filters.from || undefined } }} />
            <TextField select label="Result" value={filters.result} onChange={set('result')} slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="ok">OK</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </TextField>
            {filtered && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  onClick={() => {
                    setFilters(NO_FILTERS);
                    setSearch('');
                  }}
                >
                  Clear filters
                </Button>
              </Box>
            )}
          </Box>
        </Box>
        {query.loading && query.data ? <LinearProgress sx={{ height: 2 }} /> : <Box sx={{ height: 2 }} />}
        <Box sx={{ px: { xs: 1, sm: 2 }, pb: 2 }}>
          <Loader query={query} label="Loading the log…">
            {(data) =>
              data.items.length === 0 ? (
                <EmptyState title={filtered ? 'Nothing matches these filters' : 'Nothing recorded yet'} text={filtered ? 'Try a wider date range or clear the filters.' : undefined} />
              ) : (
                <>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small" sx={{ minWidth: 900 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>When</TableCell>
                          <TableCell>Admin</TableCell>
                          <TableCell>Area</TableCell>
                          <TableCell>Action</TableCell>
                          <TableCell>Item</TableCell>
                          <TableCell>Result</TableCell>
                          <TableCell>IP</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.items.map((entry) => {
                          const ok = entry.result < 400;
                          return (
                            <TableRow key={entry.id ?? `${entry.at}-${entry.hash}`} hover>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>{dateTime(entry.at)}</TableCell>
                              <TableCell sx={{ wordBreak: 'break-all' }}>{entry.adminEmail || '—'}</TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>{areaLabel(entry.area)}</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>{entry.action}</TableCell>
                              <TableCell sx={{ wordBreak: 'break-word', maxWidth: 280 }}>{entry.item || '—'}</TableCell>
                              <TableCell>
                                <Chip size="small" color={ok ? 'success' : 'error'} variant={ok ? 'outlined' : 'filled'} label={ok ? 'OK' : `Failed (${entry.result})`} />
                              </TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 13 }}>{entry.ip || '—'}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2, px: 1, alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      {data.total.toLocaleString('en-PK')} {data.total === 1 ? 'entry' : 'entries'}
                      {data.pages > 1 ? ` · page ${data.page} of ${data.pages}` : ''}
                    </Typography>
                    {data.pages > 1 && (
                      <Pagination
                        count={data.pages}
                        page={Math.min(page, data.pages)}
                        onChange={(_e, value) => setPaging({ key: filterQuery, page: value })}
                        color="primary"
                        siblingCount={0}
                        boundaryCount={1}
                      />
                    )}
                  </Stack>
                </>
              )
            }
          </Loader>
        </Box>
      </Card>
    </>
  );
}
