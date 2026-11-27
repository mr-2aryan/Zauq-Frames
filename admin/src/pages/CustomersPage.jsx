import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import SearchIcon from '@mui/icons-material/Search';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  LinearProgress,
  Link as MuiLink,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { EmptyState, Loader, PageHeader, StatusChip } from '../components/ui.jsx';
import { download } from '../lib/api.js';
import { date, money, whatsapp } from '../lib/format.js';
import { useData, useDebounced } from '../lib/hooks.jsx';

function TabLabel({ label, count }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <span>{label}</span>
      {count != null && <Chip size="small" label={count} sx={{ height: 20, fontSize: 12 }} />}
    </Stack>
  );
}

/** A phone number that opens a WhatsApp chat. */
function PhoneLink({ phone }) {
  if (!phone) return '—';
  return (
    <MuiLink href={whatsapp(phone)} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap', fontWeight: 600 }}>
      <WhatsAppIcon sx={{ fontSize: 16, color: '#25a244' }} />
      {phone}
    </MuiLink>
  );
}

const num = { textAlign: 'right', whiteSpace: 'nowrap' };

function BuyersTable({ buyers, searching }) {
  if (!buyers.length) {
    return <EmptyState title={searching ? 'No buyers match your search' : 'No buyers yet'} text={searching ? 'Try a different name, phone number or city.' : 'People who place an order will appear here.'} />;
  }
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 860 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>City</TableCell>
            <TableCell sx={num}>Orders</TableCell>
            <TableCell sx={num}>Spent</TableCell>
            <TableCell>Last order</TableCell>
            <TableCell>Account</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {buyers.map((b) => (
            <TableRow key={b.phone} hover>
              <TableCell sx={{ fontWeight: 700 }}>{b.name}</TableCell>
              <TableCell>
                <PhoneLink phone={b.phone} />
              </TableCell>
              <TableCell sx={{ wordBreak: 'break-all' }}>
                {b.email ? (
                  <MuiLink href={`mailto:${b.email}`} underline="hover" color="inherit">
                    {b.email}
                  </MuiLink>
                ) : (
                  '—'
                )}
              </TableCell>
              <TableCell>{b.city || '—'}</TableCell>
              <TableCell sx={num}>{b.orders}</TableCell>
              <TableCell sx={{ ...num, fontWeight: 700 }}>{money(b.spent)}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{date(b.lastOrderAt)}</TableCell>
              <TableCell>
                {b.hasAccount ? (
                  <Chip size="small" color="success" variant="outlined" label="Has account" />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Guest
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

function AccountsTable({ accounts, searching, onOpen }) {
  if (!accounts.length) {
    return <EmptyState title={searching ? 'No accounts match your search' : 'No accounts yet'} text={searching ? 'Try a different name, email or city.' : 'People who sign up in the shop will appear here.'} />;
  }
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 820 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>City</TableCell>
            <TableCell sx={num}>Orders</TableCell>
            <TableCell sx={num}>Spent</TableCell>
            <TableCell>Joined</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accounts.map((a) => (
            <TableRow key={a.id} hover onClick={() => onOpen(a.id)} sx={{ cursor: 'pointer' }}>
              <TableCell>
                <MuiLink
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen(a.id);
                  }}
                  sx={{ fontWeight: 700, textAlign: 'left' }}
                >
                  {a.name}
                </MuiLink>
              </TableCell>
              <TableCell sx={{ wordBreak: 'break-all' }}>{a.email}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <PhoneLink phone={a.phone} />
              </TableCell>
              <TableCell>{a.city || '—'}</TableCell>
              <TableCell sx={num}>{a.orders}</TableCell>
              <TableCell sx={{ ...num, fontWeight: 700 }}>{money(a.spent)}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{date(a.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

function Detail({ label, children }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </Typography>
      <Typography component="div" sx={{ wordBreak: 'break-word' }}>
        {children || '—'}
      </Typography>
    </Box>
  );
}

/** One account's details and orders (loaded when the dialog opens). */
function CustomerDetails({ id }) {
  const query = useData(`/customers/${encodeURIComponent(id)}`);
  return (
    <Loader query={query} label="Loading the customer…">
      {({ customer, orders }) => (
        <Stack spacing={3}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Detail label="Name">{customer.name}</Detail>
            <Detail label="Email">{customer.email}</Detail>
            <Detail label="Phone">{customer.phone ? <PhoneLink phone={customer.phone} /> : null}</Detail>
            <Detail label="City">{customer.city}</Detail>
            <Detail label="Address">{customer.address}</Detail>
            <Detail label="Joined">{date(customer.createdAt)}</Detail>
          </Box>
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              Orders ({orders.length})
            </Typography>
            {orders.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No orders placed with this account yet.
              </Typography>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 420 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell sx={num}>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((o) => (
                      <TableRow key={o.id} hover>
                        <TableCell>
                          <MuiLink component={RouterLink} to={`/orders/${encodeURIComponent(o.id)}`} underline="hover" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                            {o.id}
                          </MuiLink>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{date(o.createdAt)}</TableCell>
                        <TableCell>
                          <StatusChip status={o.status} />
                        </TableCell>
                        <TableCell sx={{ ...num, fontWeight: 700 }}>{money(o.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>
        </Stack>
      )}
    </Loader>
  );
}

export default function CustomersPage() {
  const phone = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const [tab, setTab] = useState('buyers');
  const [search, setSearch] = useState('');
  const q = useDebounced(search.trim(), 300);
  const query = useData(`/customers${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  // `n` changes on every opening, so the details always load fresh.
  const [dialog, setDialog] = useState({ open: false, id: null, n: 0 });

  const openAccount = (id) => setDialog((d) => ({ open: true, id, n: d.n + 1 }));
  const closeAccount = () => setDialog((d) => ({ ...d, open: false }));

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Everyone who has bought from Zauq Frames, and everyone with an account in the shop."
        actions={
          <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={() => download('/customers/buyers.csv')}>
            Export buyers (CSV)
          </Button>
        }
      />

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 1, sm: 2 } }}>
          <Tabs value={tab} onChange={(_e, value) => setTab(value)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
            <Tab value="buyers" label={<TabLabel label="Buyers" count={query.data?.buyers.length} />} />
            <Tab value="accounts" label={<TabLabel label="Accounts" count={query.data?.accounts.length} />} />
          </Tabs>
        </Box>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {tab === 'buyers'
                ? 'Everyone who has placed an order, with or without an account. Orders with the same phone number are counted as one buyer. Cancelled orders are not counted.'
                : 'People who signed up for an account in the shop. Click a name to see their details and orders.'}
            </Typography>
            <TextField
              type="search"
              placeholder="Search by name, email, phone or city"
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
                htmlInput: { 'aria-label': 'Search customers' },
              }}
            />
          </Stack>
        </Box>
        {query.loading && query.data ? <LinearProgress sx={{ height: 2 }} /> : <Box sx={{ height: 2 }} />}
        <Box sx={{ px: { xs: 1, sm: 2 }, pb: 2 }}>
          <Loader query={query} label="Loading customers…">
            {(data) =>
              tab === 'buyers' ? <BuyersTable buyers={data.buyers} searching={Boolean(q)} /> : <AccountsTable accounts={data.accounts} searching={Boolean(q)} onOpen={openAccount} />
            }
          </Loader>
        </Box>
      </Card>

      <Dialog open={dialog.open} onClose={closeAccount} fullWidth maxWidth="sm" fullScreen={phone}>
        <DialogTitle sx={{ fontWeight: 800 }}>Customer account</DialogTitle>
        <DialogContent dividers>{dialog.id && <CustomerDetails key={dialog.n} id={dialog.id} />}</DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={closeAccount}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
