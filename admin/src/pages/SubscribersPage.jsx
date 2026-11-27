import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { EmptyState, Loader, PageHeader } from '../components/ui.jsx';
import { api, download } from '../lib/api.js';
import { date } from '../lib/format.js';
import { useData, useDebounced, useUi } from '../lib/hooks.jsx';

const TABS = [
  { key: 'subscribed', label: 'Subscribed' },
  { key: 'unsubscribed', label: 'Unsubscribed' },
  { key: 'all', label: 'All' },
];

const SOURCES = { footer: 'Shop footer', checkout: 'Checkout', account: 'Account' };

function TabLabel({ label, count }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <span>{label}</span>
      {count != null && <Chip size="small" label={count} sx={{ height: 20, fontSize: 12 }} />}
    </Stack>
  );
}

/** Copies text, with a fallback for browsers that block the clipboard API. */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}

export default function SubscribersPage() {
  const { notify, confirm } = useUi();
  const [status, setStatus] = useState('subscribed');
  const [search, setSearch] = useState('');
  const q = useDebounced(search.trim().toLowerCase(), 300);
  const query = useData(`/subscribers?status=${status}${q ? `&q=${encodeURIComponent(q)}` : ''}`);
  const [busyId, setBusyId] = useState(null);
  const [copying, setCopying] = useState(false);

  const change = async (sub, next) => {
    setBusyId(sub.id);
    try {
      await api(`/subscribers/${encodeURIComponent(sub.id)}`, { method: 'PATCH', body: { status: next } });
      notify(next === 'subscribed' ? `${sub.email} is subscribed again.` : `${sub.email} is unsubscribed.`);
      query.reload();
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (sub) => {
    const ok = await confirm({
      title: 'Delete this subscriber?',
      text: `${sub.email} will be removed from the list for good. To stop emailing them but keep a record, unsubscribe them instead.`,
      danger: true,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    setBusyId(sub.id);
    try {
      await api(`/subscribers/${encodeURIComponent(sub.id)}`, { method: 'DELETE' });
      notify('Subscriber deleted.');
      query.reload();
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  // Always copies every subscribed email, whatever tab or search is showing.
  const copyAll = async () => {
    setCopying(true);
    try {
      const { items } = await api('/subscribers?status=subscribed');
      if (!items.length) {
        notify('There are no subscribers to copy yet.', 'info');
        return;
      }
      const ok = await copyText(items.map((s) => s.email).join(', '));
      if (ok) notify(`Copied ${items.length} email${items.length === 1 ? '' : 's'}. Paste them into the Bcc box of your email so subscribers don't see each other.`);
      else notify('Your browser did not allow copying. Use "Export CSV" instead.', 'error');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setCopying(false);
    }
  };

  const counts = query.data?.counts;

  return (
    <>
      <PageHeader
        title="Subscribers"
        subtitle="People who signed up for news and offers in the shop."
        actions={
          <>
            <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={copyAll} disabled={copying}>
              {copying ? 'Copying…' : 'Copy all emails'}
            </Button>
            <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={() => download('/subscribers/export.csv')}>
              Export CSV
            </Button>
          </>
        }
      />

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 1, sm: 2 } }}>
          <Tabs value={status} onChange={(_e, value) => setStatus(value)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
            {TABS.map((t) => (
              <Tab key={t.key} value={t.key} label={<TabLabel label={t.label} count={counts?.[t.key]} />} />
            ))}
          </Tabs>
        </Box>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              &quot;Copy all emails&quot; and &quot;Export CSV&quot; include only people who are still subscribed. Unsubscribed people stay on the list so you know not to email them.
            </Typography>
            <TextField
              type="search"
              placeholder="Search by email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ maxWidth: { sm: 420 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
                htmlInput: { 'aria-label': 'Search subscribers' },
              }}
            />
          </Stack>
        </Box>
        {query.loading && query.data ? <LinearProgress sx={{ height: 2 }} /> : <Box sx={{ height: 2 }} />}
        <Box sx={{ px: { xs: 1, sm: 2 }, pb: 2 }}>
          <Loader query={query} label="Loading subscribers…">
            {({ items }) =>
              items.length === 0 ? (
                <EmptyState
                  title={q ? 'No emails match your search' : status === 'unsubscribed' ? 'Nobody has unsubscribed' : 'No subscribers yet'}
                  text={q ? 'Try part of the email address.' : status === 'subscribed' ? 'People who sign up in the shop footer will appear here.' : undefined}
                />
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 640 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Email</TableCell>
                        <TableCell>Since</TableCell>
                        <TableCell>Signed up from</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((sub) => {
                        const subscribed = sub.status === 'subscribed';
                        const busy = busyId === sub.id;
                        return (
                          <TableRow key={sub.id} hover>
                            <TableCell sx={{ fontWeight: 700, wordBreak: 'break-all' }}>{sub.email}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{date(sub.createdAt)}</TableCell>
                            <TableCell>{SOURCES[sub.source] ?? sub.source ?? '—'}</TableCell>
                            <TableCell>
                              <Chip size="small" label={subscribed ? 'Subscribed' : 'Unsubscribed'} color={subscribed ? 'success' : 'default'} variant={subscribed ? 'filled' : 'outlined'} />
                            </TableCell>
                            <TableCell sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <Button size="small" disabled={busy} onClick={() => change(sub, subscribed ? 'unsubscribed' : 'subscribed')}>
                                {subscribed ? 'Unsubscribe' : 'Resubscribe'}
                              </Button>
                              <Tooltip title="Delete">
                                <span>
                                  <IconButton size="small" color="error" aria-label={`Delete ${sub.email}`} disabled={busy} onClick={() => remove(sub)}>
                                    <DeleteOutlinedIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              )
            }
          </Loader>
        </Box>
      </Card>
    </>
  );
}
