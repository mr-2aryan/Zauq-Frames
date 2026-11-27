import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader, PageHeader, Section } from '../components/ui.jsx';
import { ApiError, api } from '../lib/api.js';
import { money } from '../lib/format.js';
import { useData, useUi } from '../lib/hooks.jsx';

const MAX_SIZES = 12;
const SHOWN_FIELDS = ['deliveryFee', 'finish', 'promotion.percentOff', 'promotion.label', 'sizes'];

let rowKey = 0;
const nextKey = () => {
  rowKey += 1;
  return `row-${rowKey}`;
};

const toForm = (s) => ({
  deliveryFee: String(s?.deliveryFee ?? 0),
  finish: s?.finish ?? 'black',
  promotion: { percentOff: String(s?.promotion?.percentOff ?? 0), label: s?.promotion?.label ?? '' },
  sizes: (s?.sizes ?? []).map((size) => ({
    key: nextKey(),
    id: size.id ?? '',
    width: String(size.width ?? ''),
    height: String(size.height ?? ''),
    salePrice: String(size.salePrice ?? ''),
    description: size.description ?? '',
  })),
});

const num = (value) => (String(value).trim() === '' ? NaN : Number(value));

const toBody = (f) => ({
  deliveryFee: num(f.deliveryFee),
  finish: f.finish,
  promotion: { percentOff: num(f.promotion.percentOff), label: f.promotion.label },
  sizes: f.sizes.map(({ id, width, height, salePrice, description }) => ({ id: id.trim(), width: num(width), height: num(height), salePrice: num(salePrice), description })),
});

/** The "before" price the shop shows struck through, worked out from what customers pay. */
const listPrice = (salePrice, percentOff) => {
  const sale = Number(salePrice);
  const pct = Number(percentOff);
  if (!sale || !(pct > 0) || pct >= 100) return null;
  return Math.round((sale * 100) / (100 - pct));
};

export default function PricingPage() {
  const query = useData('/settings/frames');
  return (
    <>
      <PageHeader title="Sizes & prices" subtitle="Frame sizes, what each costs, delivery and the shop-wide promotion. Every piece is sold in every size." />
      <Loader query={query} label="Loading prices…">
        {(data) => <PricingForm settings={data.settings} />}
      </Loader>
    </>
  );
}

function PricingForm({ settings }) {
  const { notify, confirm } = useUi();
  const phone = useMediaQuery('(max-width:820px)');
  const initial = useMemo(() => toForm(settings), [settings]);
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);

  const percentOff = Number(form.promotion.percentOff) || 0;
  const promoOn = percentOff > 0;

  // Sizes used twice, flagged as you type.
  const duplicateIds = useMemo(() => {
    const seen = new Map();
    for (const s of form.sizes) {
      const id = s.id.trim();
      if (id) seen.set(id, (seen.get(id) ?? 0) + 1);
    }
    return new Set([...seen].filter(([, n]) => n > 1).map(([id]) => id));
  }, [form.sizes]);

  const clearError = (key) =>
    setErrors((e) => {
      const next = Object.fromEntries(Object.entries(e).filter(([k]) => k !== key));
      return Object.keys(next).length === Object.keys(e).length ? e : next;
    });

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    clearError(key);
  };
  const setPromo = (key, value) => {
    setForm((f) => ({ ...f, promotion: { ...f.promotion, [key]: value } }));
    clearError(`promotion.${key}`);
  };
  const setSize = (index, key, value) => {
    setForm((f) => {
      const sizes = f.sizes.map((s, i) => {
        if (i !== index) return s;
        const next = { ...s, [key]: value };
        // Keep the size name in step with width × height while it still matches them.
        if ((key === 'width' || key === 'height') && (s.id.trim() === '' || s.id.trim() === `${s.width}x${s.height}`) && next.width && next.height) {
          next.id = `${next.width}x${next.height}`;
        }
        return next;
      });
      return { ...f, sizes };
    });
    clearError(`sizes.${index}.${key}`);
    if (key === 'width' || key === 'height') clearError(`sizes.${index}.id`);
    clearError('sizes');
  };
  const addSize = () => {
    setForm((f) => ({ ...f, sizes: [...f.sizes, { key: nextKey(), id: '', width: '', height: '', salePrice: '', description: '' }] }));
    clearError('sizes');
  };
  const removeSize = (index) => {
    setForm((f) => ({ ...f, sizes: f.sizes.filter((_, i) => i !== index) }));
    // Errors for rows after this one no longer line up: drop the size errors.
    setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !k.startsWith('sizes.'))));
  };

  const err = (key) => errors[key];
  const otherErrors = Object.entries(errors).filter(([k, v]) => v && !SHOWN_FIELDS.includes(k) && !/^sizes\.\d+\.\w+$/.test(k));

  const save = async () => {
    if (saving || !dirty) return;
    if (duplicateIds.size) {
      notify('Each size must be different. Change the sizes marked in red.', 'error');
      return;
    }
    const ok = await confirm({
      title: 'Save these prices?',
      text: `These prices go live on the shop and apply to new orders immediately.${promoOn ? ` The shop will show ${percentOff}% off every frame.` : ''}`,
      confirmLabel: 'Save and go live',
    });
    if (!ok) return;
    setSaving(true);
    setErrors({});
    try {
      const data = await api('/settings/frames', { method: 'PUT', body: toBody(form) });
      const next = toForm(data.settings);
      setForm(next);
      setSaved(next);
      notify('Prices saved. The shop shows them now.');
    } catch (error) {
      setErrors(error instanceof ApiError ? error.fields : {});
      notify(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // Ctrl+S / Cmd+S saves (after the confirmation).
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /** The inputs of one size row, laid out as a table row (desktop) or a card (phone). */
  const sizeFields = (size, index) => {
    const idError = err(`sizes.${index}.id`) || (duplicateIds.has(size.id.trim()) ? 'Used twice' : undefined);
    const shown = listPrice(size.salePrice, percentOff);
    const numberProps = (min, max) => ({ htmlInput: { min, max, step: 1, inputMode: 'numeric' } });
    return {
      id: (
        <TextField
          label={phone ? 'Size' : undefined}
          value={size.id}
          placeholder="12x16"
          onChange={(e) => setSize(index, 'id', e.target.value.replace(/\s+/g, '').replace('×', 'x').toLowerCase())}
          error={Boolean(idError)}
          helperText={idError}
          slotProps={{ htmlInput: { maxLength: 7, 'aria-label': `Size ${index + 1} name`, spellCheck: false } }}
          sx={{ minWidth: 92 }}
        />
      ),
      width: (
        <TextField
          label={phone ? 'Width (in)' : undefined}
          type="number"
          value={size.width}
          onChange={(e) => setSize(index, 'width', e.target.value)}
          error={Boolean(err(`sizes.${index}.width`))}
          helperText={err(`sizes.${index}.width`)}
          slotProps={{ htmlInput: { ...numberProps(2, 120).htmlInput, 'aria-label': `Size ${index + 1} width in inches` } }}
          sx={{ minWidth: 76 }}
        />
      ),
      height: (
        <TextField
          label={phone ? 'Height (in)' : undefined}
          type="number"
          value={size.height}
          onChange={(e) => setSize(index, 'height', e.target.value)}
          error={Boolean(err(`sizes.${index}.height`))}
          helperText={err(`sizes.${index}.height`)}
          slotProps={{ htmlInput: { ...numberProps(2, 120).htmlInput, 'aria-label': `Size ${index + 1} height in inches` } }}
          sx={{ minWidth: 76 }}
        />
      ),
      price: (
        <TextField
          label={phone ? 'Customers pay' : undefined}
          type="number"
          value={size.salePrice}
          onChange={(e) => setSize(index, 'salePrice', e.target.value)}
          error={Boolean(err(`sizes.${index}.salePrice`))}
          helperText={err(`sizes.${index}.salePrice`)}
          slotProps={{
            input: { startAdornment: <InputAdornment position="start">Rs</InputAdornment> },
            htmlInput: { min: 100, max: 1000000, step: 50, inputMode: 'numeric', 'aria-label': `Size ${index + 1} price customers pay` },
          }}
          sx={{ minWidth: 130 }}
        />
      ),
      shown: shown ? (
        <Stack sx={{ lineHeight: 1.2 }}>
          <Typography component="s" variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
            {money(shown)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            then {money(Number(size.salePrice))}
          </Typography>
        </Stack>
      ) : (
        <Typography variant="body2" color="text.disabled">
          {promoOn ? '—' : 'No promotion'}
        </Typography>
      ),
      description: (
        <TextField
          label={phone ? 'Description' : undefined}
          value={size.description}
          placeholder="Where it suits best"
          onChange={(e) => setSize(index, 'description', e.target.value)}
          error={Boolean(err(`sizes.${index}.description`))}
          helperText={err(`sizes.${index}.description`)}
          multiline
          maxRows={3}
          slotProps={{ htmlInput: { maxLength: 160, 'aria-label': `Size ${index + 1} description` } }}
          sx={{ minWidth: 220 }}
        />
      ),
      remove: (
        <Tooltip title={form.sizes.length <= 1 ? 'Keep at least one size' : 'Remove this size'}>
          <span>
            <IconButton aria-label={`Remove size ${size.id || index + 1}`} onClick={() => removeSize(index)} disabled={form.sizes.length <= 1}>
              <DeleteOutlinedIcon fontSize="small" color={form.sizes.length <= 1 ? 'disabled' : 'error'} />
            </IconButton>
          </span>
        </Tooltip>
      ),
    };
  };

  return (
    <>
      {Object.values(errors).some(Boolean) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Please check the highlighted fields.
          {otherErrors.length > 0 && (
            <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2.5 }}>
              {otherErrors.map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </Box>
          )}
        </Alert>
      )}

      <Stack spacing={3}>
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '1fr 1fr' }, alignItems: 'start' }}>
          <Section title="Delivery and frame">
            <Stack spacing={2.5}>
              <TextField
                label="Delivery fee"
                type="number"
                value={form.deliveryFee}
                onChange={(e) => setField('deliveryFee', e.target.value)}
                error={Boolean(err('deliveryFee'))}
                helperText={err('deliveryFee') || 'Added to every order. 0 means free delivery.'}
                slotProps={{ input: { startAdornment: <InputAdornment position="start">Rs</InputAdornment> }, htmlInput: { min: 0, max: 20000, step: 50, inputMode: 'numeric' } }}
              />
              <TextField
                label="Frame finish"
                value={form.finish}
                onChange={(e) => setField('finish', e.target.value)}
                error={Boolean(err('finish'))}
                helperText={err('finish') || 'The frame colour customers are told about, e.g. “black”.'}
                slotProps={{ htmlInput: { maxLength: 40 } }}
              />
              <Typography variant="caption" color="text.secondary">
                Prices are in Pakistani rupees (PKR).
              </Typography>
            </Stack>
          </Section>

          <Section title="Promotion">
            <Stack spacing={2.5}>
              <TextField
                label="Percent off"
                type="number"
                value={form.promotion.percentOff}
                onChange={(e) => setPromo('percentOff', e.target.value)}
                error={Boolean(err('promotion.percentOff'))}
                helperText={err('promotion.percentOff') || (promoOn ? `On: the shop shows ${percentOff}% off every frame.` : 'Off. Set a number above 0 to start a sale (up to 90).')}
                slotProps={{ input: { endAdornment: <InputAdornment position="end">% off</InputAdornment> }, htmlInput: { min: 0, max: 90, step: 1, inputMode: 'numeric' } }}
              />
              <TextField
                label="Promotion label"
                value={form.promotion.label}
                placeholder={promoOn ? `${percentOff}% off every frame` : ''}
                onChange={(e) => setPromo('label', e.target.value)}
                error={Boolean(err('promotion.label'))}
                helperText={err('promotion.label') || 'The words customers see with the sale, e.g. “15% off every frame”.'}
                slotProps={{ htmlInput: { maxLength: 60 } }}
              />
            </Stack>
          </Section>
        </Box>

        <Section
          title="Sizes"
          action={
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addSize} disabled={form.sizes.length >= MAX_SIZES}>
              Add size
            </Button>
          }
        >
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            “Customers pay” is the real price. With a promotion on, the struck-through price is calculated for you from it (price × 100 ÷ (100 − percent off)).
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Sizes are in inches, width × height. Avoid renaming a size customers may already have in their cart. Up to {MAX_SIZES} sizes.
          </Typography>
          {err('sizes') && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {err('sizes')}
            </Alert>
          )}

          {phone ? (
            <Stack spacing={1.5}>
              {form.sizes.map((size, index) => {
                const f = sizeFields(size, index);
                return (
                  <Card key={size.key} sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,.5)' }}>
                    <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: '1fr 1fr' }}>
                      <Box sx={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Box sx={{ flex: 1 }}>{f.id}</Box>
                        {f.remove}
                      </Box>
                      {f.width}
                      {f.height}
                      {f.price}
                      <Box sx={{ alignSelf: 'center' }}>{f.shown}</Box>
                      <Box sx={{ gridColumn: '1 / -1' }}>{f.description}</Box>
                    </Box>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 820, '& td': { verticalAlign: 'top', py: 1.25 } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Size</TableCell>
                    <TableCell>Width (in)</TableCell>
                    <TableCell>Height (in)</TableCell>
                    <TableCell>Customers pay</TableCell>
                    <TableCell>Shown as (struck-through)</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {form.sizes.map((size, index) => {
                    const f = sizeFields(size, index);
                    return (
                      <TableRow key={size.key}>
                        <TableCell sx={{ width: 110 }}>{f.id}</TableCell>
                        <TableCell sx={{ width: 100 }}>{f.width}</TableCell>
                        <TableCell sx={{ width: 100 }}>{f.height}</TableCell>
                        <TableCell sx={{ width: 160 }}>{f.price}</TableCell>
                        <TableCell sx={{ width: 150, pt: '18px !important' }}>{f.shown}</TableCell>
                        <TableCell>{f.description}</TableCell>
                        <TableCell sx={{ width: 52 }}>{f.remove}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
          {form.sizes.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
              No sizes. Add at least one.
            </Typography>
          )}
        </Section>
      </Stack>

      {/* Save bar, always in reach at the bottom of the screen */}
      <Paper
        elevation={0}
        sx={{
          position: 'sticky',
          bottom: { xs: 8, sm: 16 },
          zIndex: 5,
          mt: 3,
          px: { xs: 2, sm: 3 },
          py: 1.5,
          backgroundColor: 'rgba(255,255,255,.74)',
          backdropFilter: 'blur(28px) saturate(165%)',
          WebkitBackdropFilter: 'blur(28px) saturate(165%)',
          border: '1px solid',
          borderColor: dirty ? 'rgba(92,107,51,.55)' : 'rgba(255,255,255,.8)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.75), 0 22px 44px -18px rgba(31,38,16,.32)',
          transition: 'border-color 220ms cubic-bezier(.2,.8,.2,1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, color: dirty ? 'text.primary' : 'text.secondary' }}>
          {dirty ? 'You have unsaved changes' : 'These are the prices on the shop now'}
        </Typography>
        <Stack direction="row" spacing={1}>
          {dirty && (
            <Button
              onClick={() => {
                setForm(saved);
                setErrors({});
              }}
              disabled={saving}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Undo changes
            </Button>
          )}
          <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />} onClick={save} disabled={saving || !dirty}>
            {saving ? 'Saving…' : 'Save prices'}
          </Button>
        </Stack>
      </Paper>
    </>
  );
}
