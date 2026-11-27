import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import PrintIcon from '@mui/icons-material/Print';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Alert, Box, Button, Checkbox, Chip, Divider, FormControlLabel, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Framed, Loader, PageHeader, Section, StatusChip } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { dateTime, money, ORDER_STATUS, ORDER_STATUS_KEYS, PAYMENT_METHOD, whatsapp } from '../lib/format.js';
import { useData, useUi } from '../lib/hooks.jsx';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Opens a printable packing slip (no prices) or order sheet (with prices) in a new window. */
function printSheet(order, withPrices) {
  const c = order.customer ?? {};
  const rows = order.items
    .map(
      (i) => `<tr><td>${esc(i.quantity)} ×</td><td><b>${esc(i.name)}</b><br><span>${esc(i.label)} · ${esc(i.orientation)} · ${i.mat === 'white' ? 'white mat' : 'no mat'} · ${esc(i.finish ?? 'black')} frame${i.photoId ? ` · photo ${esc(i.photoId)}` : ''}</span></td>${withPrices ? `<td class="r">${esc(money(i.lineTotal))}</td>` : ''}</tr>`,
    )
    .join('');
  const totals = withPrices
    ? `<tr><td></td><td class="r">Subtotal</td><td class="r">${esc(money(order.subtotal))}</td></tr><tr><td></td><td class="r">Delivery</td><td class="r">${esc(money(order.deliveryFee))}</td></tr><tr class="t"><td></td><td class="r">Total</td><td class="r">${esc(money(order.total))}</td></tr>`
    : '';
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(order.id)}</title><style>
    body{font-family:Arial,Helvetica,sans-serif;color:#1c1f17;margin:32px;font-size:14px}
    .logo{font-weight:800;letter-spacing:.18em;font-size:24px}.sub{font-size:9px;letter-spacing:.4em;font-weight:700}
    h1{font-size:20px;margin:24px 0 4px} .muted{color:#5b5f51}
    .box{border:2px solid #1c1f17;border-radius:10px;padding:14px 16px;margin:18px 0;font-size:16px;line-height:1.5}
    table{width:100%;border-collapse:collapse;margin-top:12px} td{padding:8px 6px;border-bottom:1px solid #ddd;vertical-align:top} td span{color:#5b5f51;font-size:12px}
    .r{text-align:right} .t td{font-weight:800;font-size:16px;border-bottom:0}
    .foot{margin-top:28px;font-size:12px;color:#5b5f51}
    @media print{body{margin:12mm}}
  </style></head><body>
    <div class="logo">ZAUQ</div><div class="sub">PREMIUM FRAMES</div>
    <h1>${withPrices ? 'Order sheet' : 'Packing slip'} · ${esc(order.id)}</h1>
    <div class="muted">Placed ${esc(dateTime(order.createdAt))} · ${esc(PAYMENT_METHOD[order.paymentMethod] ?? order.paymentMethod)}${order.paymentMethod === 'cod' && order.paymentStatus !== 'paid' ? ` · <b>collect ${esc(money(order.total))}</b>` : ''}</div>
    <div class="box"><b>${esc(c.name)}</b><br>${esc(c.address)}<br>${esc(c.city)}<br>${esc(c.phone)}${c.email ? `<br>${esc(c.email)}` : ''}</div>
    ${c.notes ? `<p><b>Customer note:</b> ${esc(c.notes)}</p>` : ''}
    <table>${rows}${totals}</table>
    <div class="foot">Zauq Frames · Rawalpindi, Pakistan · WhatsApp 0323 5992853 · zauqframes.com</div>
    <script>window.onload=()=>{window.print()}</script>
  </body></html>`;
  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  return true;
}

function StatusForm({ order, couriers, onSaved }) {
  const { notify } = useUi();
  const hasEmail = Boolean(order.customer?.email);
  const [form, setForm] = useState({
    status: order.status,
    courier: order.shipping?.courier ?? '',
    trackingNumber: order.shipping?.trackingNumber ?? '',
    trackingUrl: order.shipping?.trackingUrl ?? '',
    note: '',
    notifyCustomer: hasEmail,
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const showCourier = ['shipped', 'delivered'].includes(form.status);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const save = async () => {
    setBusy(true);
    setErrors({});
    try {
      const body = { status: form.status, note: form.note, notifyCustomer: hasEmail && form.notifyCustomer, trackingNumber: form.trackingNumber, trackingUrl: form.trackingUrl };
      if (showCourier && form.courier) body.courier = form.courier;
      const data = await api(`/orders/${order.id}/status`, { method: 'PATCH', body });
      notify(`Saved: ${ORDER_STATUS[form.status].label}${body.notifyCustomer ? ', and the customer was emailed' : ''}.`);
      setForm((f) => ({ ...f, note: '' }));
      onSaved(data.order);
    } catch (error) {
      setErrors(error.fields ?? {});
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={1.5}>
      <TextField select label="Status" value={form.status} onChange={set('status')}>
        {ORDER_STATUS_KEYS.map((s) => (
          <MenuItem key={s} value={s}>
            {ORDER_STATUS[s].label}
          </MenuItem>
        ))}
      </TextField>
      {showCourier && (
        <>
          <TextField select label="Courier" value={form.courier} onChange={set('courier')} error={Boolean(errors.courier)} helperText={errors.courier}>
            <MenuItem value="">Not set</MenuItem>
            {couriers.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Tracking number" value={form.trackingNumber} onChange={set('trackingNumber')} error={Boolean(errors.trackingNumber)} helperText={errors.trackingNumber} />
          <TextField label="Tracking link (optional)" placeholder="https://…" value={form.trackingUrl} onChange={set('trackingUrl')} error={Boolean(errors.trackingUrl)} helperText={errors.trackingUrl ?? 'Paste the link from the courier’s website.'} />
        </>
      )}
      <TextField label="Note in the history (optional)" value={form.note} onChange={set('note')} multiline minRows={2} error={Boolean(errors.note)} helperText={errors.note} />
      <FormControlLabel
        control={<Checkbox checked={hasEmail && form.notifyCustomer} onChange={set('notifyCustomer')} disabled={!hasEmail} />}
        label={hasEmail ? `Email ${order.customer.email} about this update` : 'No email address on this order — let them know on WhatsApp'}
      />
      <Button variant="contained" onClick={save} disabled={busy}>
        {busy ? 'Saving…' : 'Save status'}
      </Button>
    </Stack>
  );
}

function Notes({ order, onSaved }) {
  const { notify } = useUi();
  const [text, setText] = useState('');
  const add = async () => {
    try {
      const data = await api(`/orders/${order.id}/notes`, { method: 'POST', body: { text } });
      setText('');
      onSaved(data.order);
    } catch (error) {
      notify(error.message, 'error');
    }
  };
  return (
    <Stack spacing={1.5}>
      {(order.adminNotes ?? []).length === 0 && <Typography color="text.secondary">No notes yet. Only admins see these.</Typography>}
      {(order.adminNotes ?? []).map((n, i) => (
        <Box key={i} sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,.5)', border: '1px solid rgba(38,44,20,.08)', borderRadius: 2 }}>
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{n.text}</Typography>
          <Typography variant="caption" color="text.secondary">
            {n.by} · {dateTime(n.at)}
          </Typography>
        </Box>
      ))}
      <TextField placeholder="Add a private note…" value={text} onChange={(e) => setText(e.target.value)} multiline minRows={2} />
      <Button variant="outlined" onClick={add} disabled={!text.trim()}>
        Add note
      </Button>
    </Stack>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify, confirm } = useUi();
  const query = useData(`/orders/${id}`);

  const replace = (order) => query.setData((d) => ({ ...d, order }));
  const togglePaid = async (order) => {
    const paymentStatus = order.paymentStatus === 'paid' ? 'unpaid' : 'paid';
    const data = await api(`/orders/${order.id}/payment`, { method: 'PATCH', body: { paymentStatus } });
    replace(data.order);
    notify(paymentStatus === 'paid' ? 'Marked as paid.' : 'Marked as not paid.');
  };
  const binIt = async (order) => {
    if (!(await confirm({ title: `Move ${order.id} to the recycle bin?`, text: 'You can restore it from the recycle bin later.', danger: true, confirmLabel: 'Move to bin' }))) return;
    await api(`/orders/${order.id}`, { method: 'DELETE' });
    notify('Moved to the recycle bin.');
    navigate('/orders');
  };

  return (
    <Loader query={query}>
      {({ order, couriers }) => {
        const c = order.customer ?? {};
        const first = c.name?.split(' ')[0] ?? '';
        const saved = order.items.reduce((s, i) => s + Math.max(0, (i.listPrice ?? i.unitPrice) - i.unitPrice) * i.quantity, 0);
        return (
          <>
            <Button component={Link} to="/orders" startIcon={<ArrowBackIcon />} sx={{ mb: 1, ml: -1 }}>
              Orders
            </Button>
            <PageHeader
              title={order.id}
              subtitle={`Placed ${dateTime(order.createdAt)} · ${order.items.reduce((n, i) => n + i.quantity, 0)} frame(s) · ${money(order.total)}`}
              actions={
                <>
                  <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => printSheet(order, false) || notify('Allow pop-ups to print.', 'error')}>
                    Packing slip
                  </Button>
                  <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => printSheet(order, true) || notify('Allow pop-ups to print.', 'error')}>
                    Order sheet
                  </Button>
                  <Button color="error" startIcon={<DeleteOutlineIcon />} onClick={() => binIt(order)}>
                    Recycle bin
                  </Button>
                </>
              }
            />
            {order.deletedAt && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                This order is in the recycle bin (moved by {order.deletedBy} on {dateTime(order.deletedAt)}).
              </Alert>
            )}
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '1.5fr 1fr' }, alignItems: 'start' }}>
              <Stack spacing={3}>
                <Section title="Frames" action={<StatusChip status={order.status} size="medium" />}>
                  <Stack divider={<Divider />} spacing={2}>
                    {order.items.map((item, i) => (
                      <Stack key={i} direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                        <Framed src={item.art ?? item.photoUrl ?? item.image} size={64} mat={item.mat === 'white'} landscape={item.orientation === 'landscape'} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 800 }}>{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.label} · {item.orientation} · {item.mat === 'white' ? 'white mat' : 'no mat'} · {item.finish ?? 'black'} frame
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.quantity} × {money(item.unitPrice)}
                          </Typography>
                          {item.photoUrl && (
                            <Button size="small" startIcon={<DownloadIcon />} href={item.photoUrl} download sx={{ mt: 0.5, ml: -1 }}>
                              Customer’s photo (print file)
                            </Button>
                          )}
                        </Box>
                        <Typography sx={{ fontWeight: 800 }}>{money(item.lineTotal)}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={0.5} sx={{ ml: 'auto', maxWidth: 320 }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Subtotal</Typography>
                      <Typography>{money(order.subtotal)}</Typography>
                    </Stack>
                    {saved > 0 && (
                      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                        <Typography color="text.secondary">{order.promotion?.label ?? 'Promotion'} (already applied)</Typography>
                        <Typography color="success.main">−{money(saved)}</Typography>
                      </Stack>
                    )}
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Delivery</Typography>
                      <Typography>{money(order.deliveryFee)}</Typography>
                    </Stack>
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 800 }}>Total</Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: 18 }}>{money(order.total)}</Typography>
                    </Stack>
                  </Stack>
                </Section>

                <Section title="Payment">
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>{PAYMENT_METHOD[order.paymentMethod ?? 'cod']}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.paymentStatus === 'paid' ? `Paid${order.paidAt ? ` · marked ${dateTime(order.paidAt)}` : ''}` : order.paymentMethod === 'bank' ? 'Waiting for the transfer — details are sent on WhatsApp.' : `Collect ${money(order.total)} on delivery.`}
                      </Typography>
                    </Box>
                    <FormControlLabel control={<Switch checked={order.paymentStatus === 'paid'} onChange={() => togglePaid(order).catch((e) => notify(e.message, 'error'))} />} label="Paid" />
                  </Stack>
                </Section>

                <Section title="Private notes">
                  <Notes order={order} onSaved={replace} />
                </Section>
              </Stack>

              <Stack spacing={3}>
                <Section title="Update status">
                  <StatusForm key={order.updatedAt} order={order} couriers={couriers} onSaved={replace} />
                </Section>

                <Section title="Customer">
                  <Typography sx={{ fontWeight: 800 }}>{c.name}</Typography>
                  <Typography sx={{ whiteSpace: 'pre-line', mt: 0.5 }}>
                    {c.address}
                    {'\n'}
                    {c.city}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>{c.phone}</Typography>
                  {c.email && <Typography color="text.secondary">{c.email}</Typography>}
                  {c.notes && (
                    <Alert severity="info" sx={{ mt: 1.5 }}>
                      <b>Their note:</b> {c.notes}
                    </Alert>
                  )}
                  <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', rowGap: 1 }}>
                    <Button variant="contained" color="success" startIcon={<WhatsAppIcon />} href={whatsapp(c.phone, `Hi ${first}, this is Zauq Frames about your order ${order.id}.`)} target="_blank" rel="noopener">
                      WhatsApp
                    </Button>
                    <Button variant="outlined" startIcon={<LocalPhoneIcon />} href={`tel:${c.phone}`}>
                      Call
                    </Button>
                  </Stack>
                  {order.customerId && <Chip size="small" label="Has an account" sx={{ mt: 1.5 }} />}
                </Section>

                {order.shipping?.courier && (
                  <Section title="Delivery">
                    <Typography>
                      <b>{order.shipping.courier}</b> {order.shipping.trackingNumber}
                    </Typography>
                    {order.shipping.trackingUrl && (
                      <Button size="small" href={order.shipping.trackingUrl} target="_blank" rel="noopener" sx={{ ml: -1 }}>
                        Open tracking
                      </Button>
                    )}
                    {order.shipping.shippedAt && <Typography variant="body2" color="text.secondary">Shipped {dateTime(order.shipping.shippedAt)}</Typography>}
                    {order.shipping.deliveredAt && <Typography variant="body2" color="text.secondary">Delivered {dateTime(order.shipping.deliveredAt)}</Typography>}
                  </Section>
                )}

                <Section title="History">
                  <Stack spacing={1.5}>
                    {[...(order.history ?? [])].reverse().map((h, i) => (
                      <Stack key={i} direction="row" spacing={1.5}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: i === 0 ? 'primary.main' : 'divider', mt: 0.8, flex: 'none' }} />
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{ORDER_STATUS[h.status]?.label ?? h.status}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dateTime(h.at)}
                            {h.by ? ` · ${h.by}` : ' · by the customer'}
                            {h.notified ? ' · customer emailed' : ''}
                          </Typography>
                          {h.note && <Typography variant="body2">{h.note}</Typography>}
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                </Section>
              </Stack>
            </Box>
          </>
        );
      }}
    </Loader>
  );
}
