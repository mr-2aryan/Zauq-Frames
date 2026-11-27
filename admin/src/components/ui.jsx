import FilterFramesOutlinedIcon from '@mui/icons-material/FilterFramesOutlined';
import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred';
import { alpha, Box, Button, Card, CardContent, Chip, Skeleton, Stack, Typography } from '@mui/material';
import { color, font, radius } from '../design/tokens.js';
import { ORDER_STATUS } from '../lib/format.js';

/** The title row of a page, with optional actions on the right. */
export function PageHeader({ title, subtitle, actions, eyebrow }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: { xs: 2.5, md: 3.5 }, alignItems: { sm: 'flex-end' }, justifyContent: 'space-between' }}>
      <Box sx={{ minWidth: 0 }}>
        {eyebrow && (
          <Typography variant="overline" sx={{ color: 'secondary.main', display: 'block', mb: 0.25 }}>
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h1">{title}</Typography>
        {subtitle && (
          <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 680 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, flex: 'none' }}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}

/** A glass card with an optional heading. */
export function Section({ title, subtitle, action, children, sx, contentSx }) {
  return (
    <Card sx={sx}>
      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } }, ...contentSx }}>
        {(title || action) && (
          <Stack direction="row" sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ minWidth: 0 }}>
              {title && <Typography variant="h3">{title}</Typography>}
              {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            {action}
          </Stack>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

const DOT = { default: color.inkFaint, primary: color.olive700, secondary: color.terracotta, success: color.success, warning: '#d9962b', error: color.error, info: color.info };

/** An order status, as a tinted chip with a coloured dot. */
export function StatusChip({ status, size = 'small' }) {
  const s = ORDER_STATUS[status] ?? { label: status, color: 'default' };
  return (
    <Chip
      size={size}
      label={s.label}
      color={s.color}
      variant={status === 'delivered' || status === 'shipped' ? 'filled' : 'outlined'}
      icon={<Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: DOT[s.color] ?? DOT.default, ml: '8px !important', mr: '-2px !important', flex: 'none' }} />}
    />
  );
}

/** Shimmering placeholders while something loads (the shape of a page of cards). */
export function Loading({ label = 'Loading…', rows = 3 }) {
  return (
    <Stack spacing={2} aria-busy="true" aria-label={label} sx={{ py: 1 }}>
      {Array.from({ length: rows }, (_, i) => (
        <Card key={i} sx={{ p: { xs: 2, sm: 3 } }}>
          <Skeleton width="32%" height={22} />
          <Skeleton width="88%" height={16} sx={{ mt: 1.5 }} />
          <Skeleton width="72%" height={16} />
          <Skeleton width="54%" height={16} />
        </Card>
      ))}
    </Stack>
  );
}

/** What a page looks like while its code loads. */
export function PageSkeleton() {
  return (
    <Box aria-busy="true" aria-label="Loading the page">
      <Skeleton width={240} height={44} />
      <Skeleton width={360} height={20} sx={{ mb: 3 }} />
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, mb: 2 }}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" height={110} />
        ))}
      </Box>
      <Skeleton variant="rounded" height={320} />
    </Box>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <Card sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
      <Box sx={{ width: 52, height: 52, mx: 'auto', mb: 1.5, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: alpha(color.error, 0.1), color: 'error.main' }}>
        <ReportGmailerrorredIcon />
      </Box>
      <Typography variant="h3">That didn’t load</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: onRetry ? 2 : 0 }}>
        {error?.message ?? 'Something went wrong.'}
      </Typography>
      {onRetry && (
        <Button variant="outlined" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Card>
  );
}

export function EmptyState({ title, text, action, icon: Icon = FilterFramesOutlinedIcon }) {
  return (
    <Stack spacing={1} sx={{ py: 6, px: 2, alignItems: 'center', textAlign: 'center', color: 'text.secondary' }}>
      <Box sx={{ width: 56, height: 56, mb: 0.5, borderRadius: `${radius.md}px`, display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,.7)', border: `1px solid ${color.line}`, boxShadow: '0 8px 20px -12px rgba(31,38,16,.35)', color: 'primary.main' }}>
        <Icon />
      </Box>
      <Typography variant="h3" color="text.primary">
        {title}
      </Typography>
      {text && (
        <Typography variant="body2" sx={{ maxWidth: 420 }}>
          {text}
        </Typography>
      )}
      {action && <Box sx={{ pt: 1 }}>{action}</Box>}
    </Stack>
  );
}

/** Shows loading / error states, then `children(data)`. */
export function Loader({ query, children, label }) {
  if (query.error && !query.data) return <ErrorState error={query.error} onRetry={query.reload} />;
  if (!query.data) return <Loading label={label} />;
  return children(query.data);
}

/** A small framed picture, the way the shop shows a piece (black frame, optional white mat). */
export function Framed({ src, size = 44, mat = false, landscape = false }) {
  const w = landscape ? size * 1.25 : size;
  const h = landscape ? size : size * 1.25;
  return (
    <Box sx={{ width: w, height: h, flex: 'none', bgcolor: '#17190f', p: '3px', borderRadius: '2px', boxShadow: '0 4px 10px -3px rgba(0,0,0,.35)' }}>
      <Box sx={{ width: '100%', height: '100%', bgcolor: '#fbfaf6', p: mat ? '4px' : 0 }}>
        {src ? <Box component="img" src={src} alt="" loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : null}
      </Box>
    </Box>
  );
}

/** A big number with a label, for dashboards and summaries. */
export function Stat({ label, value, hint, icon: Icon, tone = 'primary' }) {
  const toneColor = { primary: color.olive700, secondary: color.terracotta, brass: color.brass, success: color.success }[tone] ?? color.olive700;
  return (
    <Card sx={{ p: 2.25, height: '100%', '&:hover': { transform: 'translateY(-2px)' } }}>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          {label}
        </Typography>
        {Icon && (
          <Box sx={{ width: 34, height: 34, borderRadius: `${radius.sm}px`, display: 'grid', placeItems: 'center', bgcolor: alpha(toneColor, 0.12), color: toneColor, flex: 'none' }}>
            <Icon sx={{ fontSize: 19 }} />
          </Box>
        )}
      </Stack>
      <Typography className="tabular" sx={{ fontFamily: font.display, fontWeight: 800, fontSize: { xs: 26, sm: 30 }, letterSpacing: '-0.02em', lineHeight: 1.1, mt: 0.75 }}>
        {value}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {hint}
        </Typography>
      )}
    </Card>
  );
}
