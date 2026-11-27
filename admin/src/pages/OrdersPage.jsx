import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DownloadIcon from '@mui/icons-material/Download';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  MenuItem,
  Pagination,
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
import { Link, useNavigate, useSearchParams } from 'react-router';
import { EmptyState, ErrorState, Framed, Loading, PageHeader, StatusChip } from '../components/ui.jsx';
import { api, download } from '../lib/api.js';
import { ago, dateTime, money, ORDER_STATUS, ORDER_STATUS_KEYS, PAYMENT_METHOD, whatsapp } from '../lib/format.js';
import { useData, useDebounced, useUi } from '../lib/hooks.jsx';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { notify, confirm } = useUi();
  const [params, setParams] = useSearchParams();
  const tab = params.get('deleted') === 'true' ? 'bin' : params.get('status') ?? 'all';
  const [q, setQ] = useState(params.get('q') ?? '');
  const search = useDebounced(q);
  const page = Number(params.get('page') ?? 1);

  const query = new URLSearchParams();
  if (tab === 'bin') query.set('deleted', 'true');
  else if (tab !== 'all') query.set('status', tab);
  if (search) query.set('q', search);
  for (const key of ['from', 'to', 'payment']) if (params.get(key)) query.set(key, params.get(key));
  query.set('page', String(page));
  const { data, error, loading, reload } = useData(`/orders?${query}`);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value === '' || value == null) next.delete(key);
      else next.set(key, value);
    }
    if (!('page' in changes)) next.delete('page');
    setParams(next, { replace: true });
  };
  const setTab = (value) => {
    if (value === 'bin') update({ deleted: 'true', status: '' });
    else update({ deleted: '', status: value === 'all' ? '' : value });
  };

  const restore = async (id) => {
    await api(`/orders/${id}/restore`, { method: 'POST' });
    notify(`Order ${id} restored.`);
    reload();
  };
  const destroy = async (id) => {
    if (!(await confirm({ title: `Delete ${id} for good?`, text: 'This can’t be undone.', danger: true, confirmLabel: 'Delete for good' }))) return;
    await api(`/orders/${id}/permanent`, { method: 'DELETE' }).catch((e) => notify(e.message, 'error'));
    reload();
  };

  const counts = data?.counts ?? {};
  const active = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={tab === 'bin' ? 'Orders moved to the recycle bin. Restore them, or delete them for good.' : 'Every order, newest first. Open one to update its status and email the customer.'}
        actions={
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => download(`/orders/export.csv?${query}`)}>
            Export CSV
          </Button>
        }
      />
      <Card>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 1 }}>
          <Tab value="all" label={`All (${active})`} />
          {ORDER_STATUS_KEYS.map((s) => (
            <Tab key={s} value={s} label={`${ORDER_STATUS[s].label} (${counts[s] ?? 0})`} />
          ))}
          <Tab value="bin" label="Recycle bin" />
        </Tabs>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ p: 2 }}>
          <TextField placeholder="Search order no., name, phone, city…" value={q} onChange={(e) => setQ(e.target.value)} sx={{ flex: 2 }} />
          <TextField type="date" label="From" value={params.get('from') ?? ''} onChange={(e) => update({ from: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} sx={{ flex: 1 }} />
          <TextField type="date" label="To" value={params.get('to') ?? ''} onChange={(e) => update({ to: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} sx={{ flex: 1 }} />
          <TextField select label="Payment" value={params.get('payment') ?? ''} onChange={(e) => update({ payment: e.target.value })} sx={{ flex: 1 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="unpaid">Not paid yet</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
          </TextField>
        </Stack>
        {error && !data && (
          <Box sx={{ p: 2 }}>
            <ErrorState error={error} onRetry={reload} />
          </Box>
        )}
        {!data && loading && <Loading />}
        {data && data.items.length === 0 && <EmptyState title={tab === 'bin' ? 'The recycle bin is empty' : 'No orders here'} text={search ? 'Try a different search.' : undefined} />}
        {data && data.items.length > 0 && (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 860 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Order</TableCell>
                  <TableCell />
                  <TableCell>Customer</TableCell>
                  <TableCell align="center">Frames</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Status</TableCell>
                  {tab === 'bin' && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((o) => (
                  <TableRow key={o.id} hover sx={{ cursor: tab === 'bin' ? 'default' : 'pointer' }} onClick={() => tab !== 'bin' && navigate(`/orders/${o.id}`)}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 800 }} component={tab === 'bin' ? 'span' : Link} to={`/orders/${o.id}`} onClick={(e) => e.stopPropagation()} color="inherit" style={{ textDecoration: 'none' }}>
                        {o.id}
                      </Typography>
                      <Tooltip title={dateTime(o.createdAt)}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {ago(o.createdAt)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Framed src={o.image} size={34} />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>{o.customer.name}</Typography>
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {o.customer.city} · {o.customer.phone}
                        </Typography>
                        <Tooltip title="WhatsApp">
                          <IconButton size="small" component="a" href={whatsapp(o.customer.phone, `Hi ${o.customer.name.split(' ')[0]}, this is Zauq Frames about your order ${o.id}.`)} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()} aria-label="WhatsApp the customer">
                            <WhatsAppIcon sx={{ fontSize: 16, color: '#1f9d55' }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">{o.pieces}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800 }}>
                      {money(o.total)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ display: 'block' }}>
                        {PAYMENT_METHOD[o.paymentMethod] ?? o.paymentMethod}
                      </Typography>
                      <Chip size="small" label={o.paymentStatus === 'paid' ? 'Paid' : 'Not paid'} color={o.paymentStatus === 'paid' ? 'success' : 'default'} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <StatusChip status={o.status} />
                    </TableCell>
                    {tab === 'bin' && (
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Restore">
                          <IconButton onClick={() => restore(o.id)} aria-label="Restore">
                            <RestoreFromTrashIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete for good">
                          <IconButton color="error" onClick={() => destroy(o.id)} aria-label="Delete for good">
                            <DeleteForeverIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
        {data && data.pages > 1 && (
          <Stack sx={{ p: 2, alignItems: 'center' }}>
            <Pagination count={data.pages} page={data.page} onChange={(_e, p) => update({ page: String(p) })} color="primary" />
          </Stack>
        )}
      </Card>
    </>
  );
}
