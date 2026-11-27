import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FilterFramesOutlinedIcon from '@mui/icons-material/FilterFramesOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { alpha, Box, Button, ButtonBase, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../auth.jsx';
import { EmptyState, Framed, Loader, PageHeader, Section, Stat, StatusChip } from '../components/ui.jsx';
import { color, font, motion, radius } from '../design/tokens.js';
import { ago, money } from '../lib/format.js';
import { useData } from '../lib/hooks.jsx';

const RANGES = [
  ['today', 'Today'],
  ['7d', '7 days'],
  ['30d', '30 days'],
  ['90d', '90 days'],
  ['all', 'All time'],
];

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
}

/** One line of the to-do list: a count, what it means, and a link to deal with it. */
function ToDo({ label, count, to, urgent = false }) {
  const tone = urgent ? color.terracotta : color.olive700;
  return (
    <ButtonBase
      component={Link}
      to={to}
      sx={{
        width: '100%',
        justifyContent: 'flex-start',
        gap: 1.5,
        p: 1.25,
        pr: 1.5,
        borderRadius: `${radius.md}px`,
        textAlign: 'left',
        transition: `background-color ${motion.base} ${motion.ease}, transform ${motion.base} ${motion.ease}`,
        bgcolor: count ? 'rgba(255,255,255,.62)' : 'transparent',
        border: `1px solid ${count ? 'rgba(255,255,255,.8)' : color.line}`,
        '&:hover': { bgcolor: 'rgba(255,255,255,.85)', transform: 'translateX(2px)', '& .todo-arrow': { opacity: 1, transform: 'none' } },
      }}
    >
      <Box className="tabular" sx={{ minWidth: 40, height: 40, borderRadius: `${radius.sm}px`, display: 'grid', placeItems: 'center', fontFamily: font.display, fontWeight: 800, fontSize: 18, bgcolor: count ? alpha(tone, 0.13) : 'rgba(38,44,20,.05)', color: count ? tone : 'text.disabled' }}>
        {count}
      </Box>
      <Typography sx={{ flex: 1, fontWeight: 700, fontSize: 14.5, color: count ? 'text.primary' : 'text.secondary' }}>{label}</Typography>
      <ChevronRightIcon className="todo-arrow" sx={{ fontSize: 20, color: 'text.secondary', opacity: 0.4, transform: 'translateX(-3px)', transition: `all ${motion.base} ${motion.ease}` }} />
    </ButtonBase>
  );
}

/** Revenue per day as bars; hover a bar for the day's figures. */
function Chart({ series }) {
  const max = Math.max(1, ...series.map((p) => p.revenue));
  const labelEvery = Math.ceil(series.length / 8);
  const gap = series.length > 60 ? '2px' : series.length > 20 ? '4px' : '8px';
  return (
    <Box>
      <Box sx={{ position: 'relative', height: 200 }}>
        {[1, 0.5, 0].map((f) => (
          <Box key={f} sx={{ position: 'absolute', left: 0, right: 0, bottom: `${f * 100}%`, borderTop: `1px ${f ? 'dashed' : 'solid'} ${color.line}` }}>
            {f > 0 && (
              <Typography className="tabular" variant="caption" sx={{ position: 'absolute', right: 0, top: -18, color: 'text.secondary', fontSize: 11 }}>
                {money(max * f)}
              </Typography>
            )}
          </Box>
        ))}
        <Stack direction="row" sx={{ position: 'absolute', inset: 0, alignItems: 'flex-end', gap }}>
          {series.map((p) => (
            <Tooltip key={p.day} title={`${p.day}: ${p.orders} order${p.orders === 1 ? '' : 's'} · ${money(p.revenue)}`}>
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  height: `${p.revenue ? Math.max(3, (p.revenue / max) * 100) : 0.8}%`,
                  borderRadius: '6px 6px 2px 2px',
                  background: p.revenue ? `linear-gradient(180deg, ${color.olive500}, ${color.olive700})` : 'rgba(38,44,20,.1)',
                  boxShadow: p.revenue ? `inset 0 1px 0 ${alpha('#fff', 0.25)}` : 'none',
                  transition: `height ${motion.slow} ${motion.emphasized}, background ${motion.base} ${motion.ease}`,
                  '&:hover': p.revenue ? { background: `linear-gradient(180deg, #ddbb72, ${color.brass})` } : {},
                }}
              />
            </Tooltip>
          ))}
        </Stack>
      </Box>
      <Stack direction="row" sx={{ mt: 1, gap }}>
        {series.map((p, i) => (
          <Typography key={p.day} variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 0, textAlign: 'center', whiteSpace: 'nowrap', fontSize: 10.5 }}>
            {i % labelEvery === 0 ? new Date(`${p.day}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}

export default function DashboardPage() {
  const { admin } = useAuth();
  const [range, setRange] = useState('30d');
  const query = useData(`/dashboard?range=${range}`);
  const first = admin?.name?.split(' ')[0] ?? '';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      <PageHeader
        eyebrow={today}
        title={`${greeting()}${first ? `, ${first}` : ''}`}
        subtitle="Here’s how the shop is doing, and what needs you today."
        actions={
          <ToggleButtonGroup size="small" exclusive value={range} onChange={(_e, v) => v && setRange(v)} aria-label="Period">
            {RANGES.map(([value, label]) => (
              <ToggleButton key={value} value={value}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        }
      />
      <Loader query={query}>
        {(d) => (
          <Stack spacing={2.5}>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' } }}>
              <Stat label="Revenue" value={money(d.totals.revenue)} hint="Excluding cancelled orders" icon={PaymentsOutlinedIcon} />
              <Stat label="Orders" value={d.totals.orders} hint={d.totals.cancelled ? `${d.totals.cancelled} cancelled` : 'None cancelled'} icon={ReceiptLongOutlinedIcon} tone="secondary" />
              <Stat label="Average order" value={money(d.totals.averageOrder)} icon={ShoppingBagOutlinedIcon} tone="brass" />
              <Stat label="Frames sold" value={d.totals.pieces} icon={FilterFramesOutlinedIcon} />
              <Stat label="New accounts" value={d.totals.newCustomers} hint={`${d.audience.subscribers} newsletter subscribers`} icon={PersonAddAltOutlinedIcon} tone="success" />
            </Box>

            <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr' }, alignItems: 'start' }}>
              <Section title="Revenue by day" subtitle={`${money(d.totals.revenue)} from ${d.totals.orders} order${d.totals.orders === 1 ? '' : 's'}`}>
                {d.series.some((p) => p.orders) ? <Chart series={d.series} /> : <EmptyState icon={PaymentsOutlinedIcon} title="No sales in this period" text="Orders will show here day by day as they come in." />}
              </Section>
              <Section title="To do" subtitle="Click one to deal with it">
                <Stack spacing={1}>
                  <ToDo label="New orders to confirm" count={d.toDo.pending} to="/orders?status=pending" urgent />
                  <ToDo label="Confirmed, to start" count={d.toDo.confirmed} to="/orders?status=confirmed" />
                  <ToDo label="Printing & framing" count={d.toDo.inProduction} to="/orders?status=in_production" />
                  <ToDo label="Shipped, on the way" count={d.toDo.shipped} to="/orders?status=shipped" />
                  <ToDo label="Delivered, not marked paid" count={d.toDo.unpaidDelivered} to="/orders?status=delivered&payment=unpaid" urgent />
                  <ToDo label="New messages" count={d.toDo.newMessages} to="/messages" urgent />
                  <ToDo label="Reviews to approve" count={d.toDo.pendingReviews} to="/reviews" urgent />
                </Stack>
              </Section>
            </Box>

            <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', lg: '1fr 1.25fr' }, alignItems: 'start' }}>
              <Section title="Best sellers">
                {d.topProducts.length === 0 ? (
                  <EmptyState title="Nothing sold yet" text="Your best-selling pieces in this period will be listed here." />
                ) : (
                  <Stack spacing={1.25}>
                    {d.topProducts.map((p, i) => (
                      <Stack key={p.key} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Typography className="tabular" sx={{ width: 18, fontWeight: 800, color: 'text.secondary', fontSize: 13 }}>
                          {i + 1}
                        </Typography>
                        <Framed src={p.image} size={34} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 750 }} noWrap>
                            {p.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {p.quantity} sold
                          </Typography>
                        </Box>
                        <Typography className="tabular" sx={{ fontWeight: 750 }}>
                          {money(p.revenue)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Section>
              <Section
                title="Recent orders"
                action={
                  <Button component={Link} to="/orders" size="small" endIcon={<ArrowForwardIcon />}>
                    All orders
                  </Button>
                }
              >
                {d.recentOrders.length === 0 ? (
                  <EmptyState icon={ReceiptLongOutlinedIcon} title="No orders yet" text="New orders appear here the moment they’re placed." />
                ) : (
                  <Stack spacing={0.5}>
                    {d.recentOrders.map((o) => (
                      <ButtonBase
                        key={o.id}
                        component={Link}
                        to={`/orders/${o.id}`}
                        sx={{ gap: 1.5, px: 1.25, py: 1, mx: -1.25, borderRadius: `${radius.sm}px`, justifyContent: 'flex-start', textAlign: 'left', transition: `background-color ${motion.base} ${motion.ease}`, '&:hover': { bgcolor: 'rgba(255,255,255,.6)' } }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 750 }} noWrap>
                            {o.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {o.id} · {o.city} · {ago(o.createdAt)}
                          </Typography>
                        </Box>
                        <StatusChip status={o.status} />
                        <Typography className="tabular" sx={{ fontWeight: 750, minWidth: 84, textAlign: 'right' }}>
                          {money(o.total)}
                        </Typography>
                      </ButtonBase>
                    ))}
                  </Stack>
                )}
              </Section>
            </Box>
          </Stack>
        )}
      </Loader>
    </>
  );
}
