import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { SingleImage, thumbOf } from '../components/ImageUploader.jsx';
import { EmptyState, Loader, PageHeader } from '../components/ui.jsx';
import { ApiError, api } from '../lib/api.js';
import { SHOP_URL } from '../lib/format.js';
import { useData, useUi } from '../lib/hooks.jsx';

const EMPTY = { name: '', shortName: '', slug: '', description: '', image: null };
const LIMITS = { name: 80, shortName: 30, slug: 120, description: 400 };
const SHOWN_FIELDS = ['name', 'shortName', 'slug', 'description', 'image'];

/** The same rule the server uses to make a web address from a name. */
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);

const shopLink = (path) => `${SHOP_URL.replace(/\/$/, '')}${path}`;

function Help({ text, count, max }) {
  return (
    <Box component="span" sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
      <span>{text}</span>
      {max != null && (
        <Box component="span" sx={{ flex: 'none', fontWeight: count >= max ? 800 : 400 }}>
          {count}/{max}
        </Box>
      )}
    </Box>
  );
}

/** Create or edit a collection. `collection` is null for a new one. (Given a new `key` each time it opens.) */
function CollectionDialog({ open, collection, onClose, onSaved }) {
  const { notify } = useUi();
  const phone = useMediaQuery('(max-width:600px)');
  const [form, setForm] = useState(() =>
    collection ? { name: collection.name ?? '', shortName: collection.shortName ?? '', slug: collection.slug ?? '', description: collection.description ?? '', image: collection.image ?? null } : EMPTY,
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isNew = !collection;

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };
  const otherErrors = Object.entries(errors).filter(([k, v]) => v && !SHOWN_FIELDS.includes(k));

  const save = async (e) => {
    e?.preventDefault();
    if (saving) return;
    setSaving(true);
    setErrors({});
    try {
      const body = { ...form, slug: form.slug.trim() };
      const data = isNew ? await api('/collections', { method: 'POST', body }) : await api(`/collections/${collection.id}`, { method: 'PUT', body });
      notify(isNew ? `Collection “${data.collection.name}” created.` : 'Collection saved.');
      onSaved(data.collection);
    } catch (error) {
      setErrors(error instanceof ApiError ? error.fields : {});
      notify(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const slugPreview = form.slug.trim() || (isNew ? slugify(form.name) : collection?.slug) || 'collection-name';

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm" fullScreen={phone}>
      <Box component="form" onSubmit={save} noValidate sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{isNew ? 'New collection' : `Edit “${collection.name}”`}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {otherErrors.length > 0 && (
              <Alert severity="error">
                {otherErrors.map(([field, message]) => (
                  <div key={field}>{message}</div>
                ))}
              </Alert>
            )}
            <TextField
              label="Name"
              required
              autoFocus={!phone}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name || 'For example “Islamic Calligraphy”.'}
              slotProps={{ htmlInput: { maxLength: LIMITS.name } }}
            />
            <TextField
              label="Short name"
              value={form.shortName}
              placeholder={form.name}
              onChange={(e) => set('shortName', e.target.value)}
              error={Boolean(errors.shortName)}
              helperText={<Help text={errors.shortName || 'Used where space is tight, like menus and filter buttons. Leave empty to use the name.'} count={form.shortName.length} max={LIMITS.shortName} />}
              slotProps={{ htmlInput: { maxLength: LIMITS.shortName } }}
            />
            <TextField
              label="Web address (slug)"
              value={form.slug}
              placeholder={isNew ? slugify(form.name) || 'made-from-the-name' : collection.slug}
              onChange={(e) => set('slug', e.target.value)}
              onBlur={() => form.slug.trim() && set('slug', slugify(form.slug))}
              error={Boolean(errors.slug)}
              helperText={
                errors.slug || (
                  <>
                    zauqframes.com/collections/<b>{slugPreview}</b>
                    <br />
                    {isNew ? 'Leave it empty and it is made from the name.' : 'Changing it changes the collection’s web address. Its products stay in it.'}
                  </>
                )
              }
              slotProps={{ htmlInput: { maxLength: LIMITS.slug, spellCheck: false, autoCapitalize: 'none' } }}
            />
            <TextField
              label="Description"
              multiline
              minRows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              error={Boolean(errors.description)}
              helperText={<Help text={errors.description || 'One or two sentences shown on the collection’s page.'} count={form.description.length} max={LIMITS.description} />}
              slotProps={{ htmlInput: { maxLength: LIMITS.description } }}
            />
            <Box>
              <SingleImage value={form.image} onChange={(url) => set('image', url)} folder="collections" label="Cover image" hint="Shown on the collection’s tile in the shop. A room photo with one of its pieces works well." aspect="4 / 3" />
              {errors.image && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                  {errors.image}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}>
            {saving ? 'Saving…' : isNew ? 'Create collection' : 'Save'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

function CollectionCard({ collection: c, index, count, onMove, onEdit, onDelete, busy }) {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', opacity: busy ? 0.5 : 1 }}>
      <Box sx={{ position: 'relative', aspectRatio: '16 / 10', bgcolor: '#eceadf' }}>
        {c.image ? (
          <Box component="img" src={thumbOf(c.image)} alt="" loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <Stack sx={{ height: '100%', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', gap: 0.5 }}>
            <ImageOutlinedIcon />
            <Typography variant="caption">No cover image</Typography>
          </Stack>
        )}
        <Chip size="small" label={`#${index + 1}`} sx={{ position: 'absolute', top: 10, left: 10, bgcolor: 'rgba(255,255,255,.92)' }} />
      </Box>
      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box>
          <Typography variant="h3" sx={{ lineHeight: 1.25 }}>
            {c.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflowWrap: 'anywhere' }}>
            {c.shortName && c.shortName !== c.name ? `Short name: ${c.shortName} · ` : ''}/collections/{c.slug}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Chip size="small" variant="outlined" label={`${c.productCount} product${c.productCount === 1 ? '' : 's'}`} />
          <Chip size="small" color={c.activeCount ? 'success' : 'default'} variant={c.activeCount ? 'filled' : 'outlined'} label={`${c.activeCount} live`} />
        </Stack>
        {c.description ? (
          <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {c.description}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.disabled">
            No description yet.
          </Typography>
        )}
      </Box>
      <Stack direction="row" sx={{ px: 1, py: 0.5, borderTop: '1px solid', borderColor: 'divider', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row">
          <Tooltip title="Move earlier">
            <span>
              <IconButton size="small" aria-label={`Move ${c.name} earlier`} disabled={index === 0} onClick={() => onMove(index, -1)}>
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Move later">
            <span>
              <IconButton size="small" aria-label={`Move ${c.name} later`} disabled={index === count - 1} onClick={() => onMove(index, 1)}>
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
        <Stack direction="row">
          <Tooltip title="See its products">
            <IconButton size="small" component={Link} to={`/products?collection=${encodeURIComponent(c.slug)}`} aria-label={`Products in ${c.name}`}>
              <Inventory2OutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View in the shop">
            <IconButton size="small" component="a" href={shopLink(`/collections/${c.slug}`)} target="_blank" rel="noopener" aria-label={`View ${c.name} in the shop`}>
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(c)} aria-label={`Edit ${c.name}`}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <span>
              <IconButton size="small" onClick={() => onDelete(c)} disabled={busy} aria-label={`Delete ${c.name}`}>
                <DeleteOutlinedIcon fontSize="small" color={busy ? 'disabled' : 'error'} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>
    </Card>
  );
}

export default function CollectionsPage() {
  const { notify, confirm } = useUi();
  const collections = useData('/collections');
  const { setData, reload } = collections;
  const [dialog, setDialog] = useState({ open: false, collection: null, key: 0 });
  const openDialog = (collection) => setDialog((d) => ({ open: true, collection, key: d.key + 1 }));
  const [busy, setBusy] = useState(null);

  // ---------- Reordering: saved shortly after the last move, one request at a time ----------
  const pending = useRef(null);
  const timer = useRef(null);
  const chain = useRef(Promise.resolve());

  const flushOrder = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = null;
    const ids = pending.current;
    pending.current = null;
    if (!ids) return;
    chain.current = chain.current.then(async () => {
      try {
        await api('/collections-order', { method: 'PUT', body: { ids } });
        notify('New order saved. The shop shows collections in this order.');
      } catch (error) {
        notify(error.message, 'error');
        reload();
      }
    });
  }, [notify, reload]);

  useEffect(() => () => pending.current && flushOrder(), [flushOrder]);

  const items = collections.data?.items ?? [];

  const move = (index, delta) => {
    const to = index + delta;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[index], next[to]] = [next[to], next[index]];
    setData((d) => ({ ...d, items: next }));
    pending.current = next.map((c) => c.id);
    clearTimeout(timer.current);
    timer.current = setTimeout(flushOrder, 600);
  };

  const remove = async (c) => {
    const ok = await confirm({
      title: `Delete “${c.name}”?`,
      text: c.productCount
        ? `It still has ${c.productCount} product${c.productCount === 1 ? '' : 's'}. A collection can only be deleted once its products are moved to another collection or deleted.`
        : 'The collection and its cover image are removed for good. This cannot be undone.',
      danger: true,
      confirmLabel: 'Delete collection',
    });
    if (!ok) return;
    setBusy(c.id);
    try {
      await api(`/collections/${c.id}`, { method: 'DELETE' });
      setData((d) => ({ ...d, items: d.items.filter((x) => x.id !== c.id) }));
      notify('Collection deleted.');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(null);
    }
  };

  const close = () => setDialog((d) => ({ ...d, open: false }));

  return (
    <>
      <PageHeader
        title="Collections"
        subtitle={collections.data ? `${items.length} collection${items.length === 1 ? '' : 's'}. Use the arrows to change the order they appear in the shop.` : 'Groups of pieces in the shop.'}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog(null)}>
            Add collection
          </Button>
        }
      />
      <Loader query={collections} label="Loading collections…">
        {() =>
          items.length === 0 ? (
            <Card>
              <EmptyState
                title="No collections yet"
                text="Collections group your pieces in the shop, like “Islamic Calligraphy” or “Modern & Minimal”."
                action={
                  <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDialog(null)} sx={{ mt: 1 }}>
                    Add collection
                  </Button>
                }
              />
            </Card>
          ) : (
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(auto-fill, minmax(280px, 1fr))' } }}>
              {items.map((c, index) => (
                <CollectionCard key={c.id} collection={c} index={index} count={items.length} onMove={move} onEdit={openDialog} onDelete={remove} busy={busy === c.id} />
              ))}
            </Box>
          )
        }
      </Loader>
      <CollectionDialog
        key={dialog.key}
        open={dialog.open}
        collection={dialog.collection}
        onClose={close}
        onSaved={() => {
          close();
          // Any move still waiting is saved first, so the reloaded list has the new order.
          flushOrder();
          chain.current = chain.current.then(reload);
        }}
      />
    </>
  );
}
