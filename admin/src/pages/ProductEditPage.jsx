import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  FormHelperText,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ImageList, SingleImage } from '../components/ImageUploader.jsx';
import { ErrorState, Loading, PageHeader, Section } from '../components/ui.jsx';
import { ApiError, api, download } from '../lib/api.js';
import { SHOP_URL } from '../lib/format.js';
import { useData, useDebounced, useUi } from '../lib/hooks.jsx';

// ---------- Helpers ----------

const LIMITS = { summary: 200, description: 4000, badge: 20, metaTitle: 70, metaDescription: 170 };
const ARTWORK_MAX_BYTES = 600 * 1024 * 1024;
const ARTWORK_ACCEPT = 'image/jpeg,image/png,image/webp,image/tiff,.tif,.tiff';
const BADGE_IDEAS = ['New', 'Bestseller', 'Limited'];
/** Fields that have their own place on the form (other field errors are listed at the top). */
const SHOWN_FIELDS = ['name', 'slug', 'collection', 'orientation', 'summary', 'description', 'images', 'cardImage', 'art', 'artworkMediaId', 'featured', 'badge', 'status', 'seo.metaTitle', 'seo.metaDescription', 'seo.ogImage', 'seo.noindex'];

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

const fileSize = (bytes) => (bytes == null ? '' : bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

const toForm = (p) => ({
  name: p?.name ?? '',
  slug: p?.slug ?? '',
  collection: p?.collection ?? '',
  orientation: p?.orientation ?? 'portrait',
  summary: p?.summary ?? '',
  description: p?.description ?? '',
  images: p?.images ?? [],
  cardImage: p?.cardImage ?? null,
  art: p?.art ?? null,
  artworkMediaId: p?.artworkMediaId ?? null,
  featured: Boolean(p?.featured),
  badge: p?.badge ?? '',
  status: p?.status ?? 'draft',
  seo: {
    metaTitle: p?.seo?.metaTitle ?? '',
    metaDescription: p?.seo?.metaDescription ?? '',
    ogImage: p?.seo?.ogImage ?? null,
    noindex: Boolean(p?.seo?.noindex),
  },
});

/** The full body the server expects (POST /products, PUT /products/:id). */
const toBody = (f) => ({
  name: f.name,
  slug: f.slug.trim(),
  collection: f.collection,
  orientation: f.orientation,
  summary: f.summary,
  description: f.description,
  images: f.images,
  cardImage: f.cardImage || null,
  art: f.art || null,
  artworkMediaId: f.artworkMediaId || null,
  featured: f.featured,
  badge: f.badge.trim() || null,
  status: f.status,
  seo: {
    metaTitle: f.seo.metaTitle,
    metaDescription: f.seo.metaDescription,
    ogImage: f.seo.ogImage || null,
    noindex: f.seo.noindex,
  },
});

/** Uploads a print file with progress (it can be hundreds of MB). Resolves with the media record. */
function uploadArtwork(file, { onProgress, signal }) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/media/artwork');
    xhr.responseType = 'json';
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.upload.onload = () => onProgress(1);
    xhr.onload = () => {
      const body = xhr.response;
      if (xhr.status >= 200 && xhr.status < 300 && body?.data?.media) return resolve(body.data.media);
      if (xhr.status === 401) window.dispatchEvent(new Event('admin:signed-out'));
      const fallback = xhr.status === 413 ? 'That file is too large. Print files can be up to 600 MB.' : 'The upload did not finish. Please try again.';
      reject(new ApiError(body?.error?.message ?? fallback, xhr.status, body?.error?.details));
    };
    xhr.onerror = () => reject(new ApiError('Could not reach the server. Check your connection.', 0));
    xhr.onabort = () => reject(Object.assign(new Error('Upload cancelled.'), { name: 'AbortError' }));
    signal?.addEventListener('abort', () => xhr.abort());
    const form = new FormData();
    form.append('artwork', file);
    xhr.send(form);
  });
}

/** Helper text with an optional character counter on the right. */
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

function ErrorText({ children }) {
  if (!children) return null;
  return (
    <FormHelperText error data-field-error sx={{ mt: 1, mx: 0 }}>
      {children}
    </FormHelperText>
  );
}

/** Roughly how the product shows up in a Google search. */
function GooglePreview({ title, url, description, hidden }) {
  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: '#fff', fontFamily: 'Arial, Helvetica, sans-serif', opacity: hidden ? 0.55 : 1 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }}>
        <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: '#eef0e6', color: 'primary.main', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12, flex: 'none' }}>Z</Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, color: '#202124', lineHeight: 1.3, fontFamily: 'inherit' }}>Zauq Frames</Typography>
          <Typography sx={{ fontSize: 12, color: '#4d5156', lineHeight: 1.3, fontFamily: 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</Typography>
        </Box>
      </Stack>
      <Typography sx={{ fontSize: 20, color: '#1a0dab', lineHeight: 1.3, fontFamily: 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</Typography>
      <Typography sx={{ fontSize: 14, color: '#4d5156', lineHeight: 1.58, fontFamily: 'inherit', mt: 0.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {description || 'Add a summary or a meta description to show text here.'}
      </Typography>
    </Box>
  );
}

// ---------- Print file (artwork) ----------

function ArtworkSection({ form, onChange, error, knownMedia }) {
  const { notify, confirm } = useUi();
  const input = useRef(null);
  const controller = useRef(null);
  const [upload, setUpload] = useState(null); // { name, progress }
  const [uploaded, setUploaded] = useState(null);
  const info = [uploaded, knownMedia].find((m) => m && m.id === form.artworkMediaId) ?? null;

  useEffect(() => () => controller.current?.abort(), []);

  const pick = async (file) => {
    if (!file) return;
    if (file.size > ARTWORK_MAX_BYTES) {
      notify(`That file is ${fileSize(file.size)}. Print files can be up to 600 MB.`, 'error');
      return;
    }
    controller.current = new AbortController();
    setUpload({ name: file.name, progress: 0 });
    try {
      const media = await uploadArtwork(file, { onProgress: (progress) => setUpload({ name: file.name, progress }), signal: controller.current.signal });
      setUploaded(media);
      onChange({ art: media.files.art, artworkMediaId: media.id });
      notify('Print file uploaded. Save the product to keep it.');
    } catch (err) {
      if (err.name !== 'AbortError') notify(err.message, 'error');
      else notify('Upload cancelled.', 'info');
    } finally {
      controller.current = null;
      setUpload(null);
    }
  };

  const removeFile = async () => {
    const ok = await confirm({
      title: form.artworkMediaId ? 'Remove the print file?' : 'Remove the artwork picture?',
      text: form.artworkMediaId
        ? 'The print file and its small copy are deleted from the server when you save this product. You can upload a new one at any time.'
        : 'The small picture of the artwork is removed from this product when you save. You can upload a print file at any time.',
      danger: true,
      confirmLabel: 'Remove',
    });
    if (ok) onChange({ art: null, artworkMediaId: null });
  };

  return (
    <Section title="Artwork (print file)">
      <Alert severity="info" icon={<LockOutlinedIcon fontSize="small" />} sx={{ mb: 2 }}>
        The full print file is <b>private</b>: it is never shown on the shop and only admins can download it. Only a small copy (600 px) is public, for thumbnails.
      </Alert>

      <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Box sx={{ width: 104, aspectRatio: form.orientation === 'landscape' ? '5 / 4' : '4 / 5', flex: 'none', borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,.5)', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
          {form.art ? (
            <Box component="img" src={form.art} alt="Small public copy of the artwork" sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', px: 1 }}>
              No artwork yet
            </Typography>
          )}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          {form.artworkMediaId ? (
            <>
              <Typography sx={{ fontWeight: 800, overflowWrap: 'anywhere' }}>{info?.originalName || 'Print file on the server'}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {info ? `${info.width} × ${info.height} px · ${fileSize(info.bytes)}` : 'Kept privately on the server.'}
              </Typography>
              <Chip size="small" icon={<LockOutlinedIcon />} label="Private" sx={{ mt: 1 }} />
            </>
          ) : form.art ? (
            <Typography variant="body2" color="text.secondary">
              There is a small picture of this artwork, but no print file on the server yet.
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Upload the full-quality file you print from. JPG, PNG, WebP or TIFF, up to 600 MB.
            </Typography>
          )}
        </Box>
      </Stack>

      {upload && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, overflowWrap: 'anywhere' }}>
            {upload.progress < 1 ? `Uploading ${upload.name}… ${Math.round(upload.progress * 100)}%` : 'Upload complete. Making the small copy… (large files take a minute)'}
          </Typography>
          <LinearProgress variant={upload.progress < 1 ? 'determinate' : 'indeterminate'} value={Math.round(upload.progress * 100)} />
        </Box>
      )}

      <Stack direction="row" spacing={1} useFlexGap sx={{ mt: 2, flexWrap: 'wrap' }}>
        {upload ? (
          <Button size="small" onClick={() => controller.current?.abort()} disabled={upload.progress >= 1}>
            Cancel upload
          </Button>
        ) : (
          <Button size="small" variant="outlined" startIcon={<CloudUploadOutlinedIcon />} onClick={() => input.current?.click()}>
            {form.artworkMediaId ? 'Replace print file' : 'Upload print file'}
          </Button>
        )}
        {form.artworkMediaId && !upload && (
          <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={() => download(`/media/${form.artworkMediaId}/original`)}>
            Download print file
          </Button>
        )}
        {(form.artworkMediaId || form.art) && !upload && (
          <Button size="small" color="error" onClick={removeFile}>
            Remove
          </Button>
        )}
      </Stack>
      {form.artworkMediaId && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Uploading a new file replaces this one when you save.
        </Typography>
      )}
      <ErrorText>{error}</ErrorText>
      <input ref={input} type="file" accept={ARTWORK_ACCEPT} hidden onChange={(e) => (pick(e.target.files?.[0]), (e.target.value = ''))} />
    </Section>
  );
}

// ---------- The form ----------

function ProductForm({ product, collections, collectionsError }) {
  const navigate = useNavigate();
  const { notify, confirm } = useUi();
  const isNew = !product;
  const initial = useMemo(() => toForm(product), [product]);
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [current, setCurrent] = useState(product);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);

  // What Google shows when the SEO fields are left empty: worked out by the server, the same way the shop does.
  const seoPath = useDebounced(`/seo/product-preview?${new URLSearchParams({ name: form.name.trim(), collection: form.collection, summary: form.summary.trim() })}`, 400);
  const seoDefaults = useData(seoPath).data;
  const defaultTitle = seoDefaults?.title ?? `${form.name.trim() || 'Product name'} | Zauq Frames`;
  const defaultDescription = seoDefaults?.description ?? form.summary.trim();

  // Details of the private print file (name, size), when the product has one.
  const artworkList = useData(product?.artworkMediaId ? '/media?folder=artwork' : null);
  const knownArtwork = artworkList.data?.items?.find((m) => m.id === form.artworkMediaId) ?? null;

  /** Forgets the error of a field (and of its parts, like images.0) once it is edited. */
  const clearError = (key) =>
    setErrors((e) => {
      const next = Object.fromEntries(Object.entries(e).filter(([k]) => k !== key && !k.startsWith(`${key}.`)));
      return Object.keys(next).length === Object.keys(e).length ? e : next;
    });
  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    clearError(key);
  };
  const setSeo = (key, value) => {
    setForm((f) => ({ ...f, seo: { ...f.seo, [key]: value } }));
    clearError(`seo.${key}`);
  };
  const err = (key) => errors[key] ?? (key === 'images' ? Object.entries(errors).find(([k, v]) => k.startsWith('images.') && v)?.[1] : undefined);
  const otherErrors = Object.entries(errors).filter(([k, v]) => v && !SHOWN_FIELDS.includes(k) && !k.startsWith('images.'));

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setErrors({});
    try {
      const body = toBody(form);
      const data = isNew ? await api('/products', { method: 'POST', body }) : await api(`/products/${current.id}`, { method: 'PUT', body });
      if (isNew) {
        notify(data.product.status === 'active' ? 'Product created. It is live in the shop.' : 'Product created as a draft.');
        setSaved(form); // nothing unsaved while we move to the product's own page
        navigate(`/products/${data.product.id}`, { replace: true });
        return;
      }
      const next = toForm(data.product);
      setForm(next);
      setSaved(next);
      setCurrent(data.product);
      notify('Product saved.');
    } catch (error) {
      const fields = error instanceof ApiError ? error.fields : {};
      setErrors(fields);
      notify(error.message, 'error');
      if (Object.keys(fields).length) {
        setTimeout(() => document.querySelector('[aria-invalid="true"], [data-field-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
      }
    } finally {
      setSaving(false);
    }
  };

  // Ctrl+S / Cmd+S saves.
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

  const back = async () => {
    if (dirty && !(await confirm({ title: 'Leave without saving?', text: 'Your changes to this product will be lost.', danger: true, confirmLabel: 'Leave' }))) return;
    navigate('/products');
  };

  const remove = async () => {
    const ok = await confirm({
      title: `Delete “${current.name}”?`,
      text: 'It is removed from the shop for good, together with its photos and its private print file. This cannot be undone. To hide it for a while, make it a draft instead.',
      danger: true,
      confirmLabel: 'Delete product',
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await api(`/products/${current.id}`, { method: 'DELETE' });
      notify('Product deleted.');
      setSaved(form);
      navigate('/products', { replace: true });
    } catch (error) {
      notify(error.message, 'error');
      setDeleting(false);
    }
  };

  const slugPreview = form.slug.trim() || (isNew ? slugify(form.name) : current?.slug) || 'your-product';
  const isLive = current?.status === 'active';
  const collectionMissing = form.collection && collections && !collections.some((c) => c.slug === form.collection);

  const saveButton = (
    <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveOutlinedIcon />} onClick={save} disabled={saving || deleting}>
      {saving ? 'Saving…' : isNew ? 'Create product' : 'Save'}
    </Button>
  );

  return (
    <>
      <Button size="small" startIcon={<ArrowBackIcon />} onClick={back} sx={{ mb: 1, ml: -1 }}>
        Products
      </Button>
      <PageHeader
        title={isNew ? 'New product' : current.name}
        subtitle={
          isNew ? (
            'Fill in the details, add photos, then save. New products start as drafts.'
          ) : (
            <Stack component="span" direction="row" spacing={1} sx={{ alignItems: 'center', display: 'inline-flex', flexWrap: 'wrap' }}>
              <Chip component="span" size="small" label={isLive ? 'Live' : 'Draft'} color={isLive ? 'success' : 'default'} variant={isLive ? 'filled' : 'outlined'} />
              <span>/products/{current.slug}</span>
            </Stack>
          )
        }
        actions={
          <>
            {!isNew && isLive && (
              <Button variant="outlined" startIcon={<OpenInNewIcon />} href={shopLink(`/products/${current.slug}`)} target="_blank" rel="noopener">
                View in shop
              </Button>
            )}
            {saveButton}
          </>
        }
      />

      {(Object.values(errors).some(Boolean)) && (
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

      <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 360px' }, alignItems: 'start' }}>
        {/* Main column */}
        <Stack spacing={3} sx={{ minWidth: 0 }}>
          <Section title="Basics">
            <Stack spacing={2.5}>
              <TextField label="Name" required value={form.name} onChange={(e) => set('name', e.target.value)} error={Boolean(err('name'))} helperText={err('name') || 'The title of the piece, as customers see it.'} slotProps={{ htmlInput: { maxLength: 120 } }} />
              <TextField
                label="Web address (slug)"
                value={form.slug}
                placeholder={isNew ? slugify(form.name) || 'made-from-the-name' : current?.slug}
                onChange={(e) => set('slug', e.target.value)}
                onBlur={() => form.slug.trim() && set('slug', slugify(form.slug))}
                error={Boolean(err('slug'))}
                helperText={
                  err('slug') || (
                    <>
                      zauqframes.com/products/<b>{slugPreview}</b>
                      <br />
                      {isNew ? 'Leave it empty and it is made from the name. ' : 'Leave it empty to keep the current address. '}
                      Changing it changes the product’s web address, so links people already have may stop working.
                    </>
                  )
                }
                slotProps={{ htmlInput: { maxLength: 120, spellCheck: false, autoCapitalize: 'none' } }}
              />
              <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, alignItems: 'start' }}>
                <TextField
                  select
                  label="Collection"
                  required
                  value={collections ? form.collection : ''}
                  onChange={(e) => set('collection', e.target.value)}
                  error={Boolean(err('collection'))}
                  helperText={
                    err('collection') ||
                    (collectionsError ? (
                      'The collections could not be loaded. Please reload the page.'
                    ) : collections && collections.length === 0 ? (
                      <>
                        No collections yet. <Link to="/collections">Create one first.</Link>
                      </>
                    ) : (
                      'Where the piece is listed in the shop.'
                    ))
                  }
                  disabled={!collections}
                >
                  {(collections ?? []).map((c) => (
                    <MenuItem key={c.id} value={c.slug}>
                      {c.name}
                    </MenuItem>
                  ))}
                  {collectionMissing && <MenuItem value={form.collection}>{form.collection}</MenuItem>}
                </TextField>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700 }}>
                    Orientation
                  </Typography>
                  <ToggleButtonGroup size="small" exclusive fullWidth value={form.orientation} onChange={(_e, value) => value && set('orientation', value)} aria-label="Orientation" sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 700 } }}>
                    <ToggleButton value="portrait">Portrait (tall)</ToggleButton>
                    <ToggleButton value="landscape">Landscape (wide)</ToggleButton>
                  </ToggleButtonGroup>
                  <ErrorText>{err('orientation')}</ErrorText>
                </Box>
              </Box>
              <TextField
                label="Summary"
                required
                value={form.summary}
                onChange={(e) => set('summary', e.target.value)}
                error={Boolean(err('summary'))}
                helperText={<Help text={err('summary') || 'One line shown on product cards and in search results.'} count={form.summary.length} max={LIMITS.summary} />}
                slotProps={{ htmlInput: { maxLength: LIMITS.summary } }}
              />
              <TextField
                label="Description"
                required
                multiline
                minRows={5}
                maxRows={16}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                error={Boolean(err('description'))}
                helperText={<Help text={err('description') || 'The full story of the piece, shown on its page.'} count={form.description.length} max={LIMITS.description} />}
                slotProps={{ htmlInput: { maxLength: LIMITS.description } }}
              />
            </Stack>
          </Section>

          <Section title="Photos">
            <ImageList value={form.images} onChange={(images) => set('images', images)} folder="products" label="Product photos" />
            {err('images') ? (
              <ErrorText>{err('images')}</ErrorText>
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                At least one photo is needed. JPG, PNG or WebP. The first photo is the main one.
              </Typography>
            )}
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider', opacity: form.orientation === 'landscape' || form.cardImage ? 1 : 0.75 }}>
              <SingleImage
                value={form.cardImage}
                onChange={(url) => set('cardImage', url)}
                folder="products"
                label="Card image"
                hint={
                  form.orientation === 'landscape'
                    ? 'Needed for landscape pieces: product cards are tall (4:5), so upload a tall picture of the piece for them.'
                    : 'Only needed for landscape pieces. Product cards are shown 4:5 (tall); portrait pieces use the main photo.'
                }
                aspect="4 / 5"
              />
              <ErrorText>{err('cardImage')}</ErrorText>
            </Box>
          </Section>

          <Section title="Search engines (SEO)">
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, fontWeight: 700 }}>
                  Preview on Google
                </Typography>
                <GooglePreview
                  title={form.seo.metaTitle.trim() || defaultTitle}
                  url={`zauqframes.com/products/${slugPreview}`}
                  description={form.seo.metaDescription.trim() || defaultDescription}
                  hidden={form.seo.noindex}
                />
                {form.seo.noindex && (
                  <Stack direction="row" spacing={0.75} sx={{ mt: 1, alignItems: 'center', color: 'warning.dark' }}>
                    <VisibilityOffOutlinedIcon fontSize="small" />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      Hidden from Google: this page will not show up in search results.
                    </Typography>
                  </Stack>
                )}
              </Box>
              <TextField
                label="Meta title"
                value={form.seo.metaTitle}
                placeholder={defaultTitle}
                onChange={(e) => setSeo('metaTitle', e.target.value)}
                error={Boolean(err('seo.metaTitle'))}
                helperText={<Help text={err('seo.metaTitle') || 'The blue headline on Google. Leave empty to use the one shown in the preview.'} count={form.seo.metaTitle.length} max={LIMITS.metaTitle} />}
                slotProps={{ htmlInput: { maxLength: LIMITS.metaTitle } }}
              />
              <TextField
                label="Meta description"
                multiline
                minRows={2}
                value={form.seo.metaDescription}
                placeholder={defaultDescription || 'Uses the summary when empty'}
                onChange={(e) => setSeo('metaDescription', e.target.value)}
                error={Boolean(err('seo.metaDescription'))}
                helperText={<Help text={err('seo.metaDescription') || 'The grey text under the headline. Leave empty to use the one shown in the preview (summary, sizes and delivery).'} count={form.seo.metaDescription.length} max={LIMITS.metaDescription} />}
                slotProps={{ htmlInput: { maxLength: LIMITS.metaDescription } }}
              />
              <Box>
                <SingleImage
                  value={form.seo.ogImage}
                  onChange={(url) => setSeo('ogImage', url)}
                  folder="seo"
                  label="Share image"
                  hint="Shown when the link is shared on WhatsApp, Facebook and so on. 1200 × 630 px works best. Leave empty to use the main photo."
                  aspect="1200 / 630"
                />
                <ErrorText>{err('seo.ogImage')}</ErrorText>
              </Box>
              <Box>
                <FormControlLabel control={<Switch checked={form.seo.noindex} onChange={(e) => setSeo('noindex', e.target.checked)} />} label={<Typography component="span" sx={{ fontWeight: 700 }}>Hide from Google</Typography>} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 6.5, mt: -0.5 }}>
                  Asks search engines not to list this page. Customers can still open it from the shop.
                </Typography>
              </Box>
            </Stack>
          </Section>
        </Stack>

        {/* Side column */}
        <Stack spacing={3} sx={{ minWidth: 0 }}>
          <Section title="Visibility">
            <Stack spacing={2.5}>
              <Box>
                <ToggleButtonGroup
                  exclusive
                  fullWidth
                  size="small"
                  value={form.status}
                  color={form.status === 'active' ? 'success' : 'standard'}
                  onChange={(_e, value) => value && set('status', value)}
                  aria-label="Status"
                  sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 800 } }}
                >
                  <ToggleButton value="draft">Draft</ToggleButton>
                  <ToggleButton value="active">Live in the shop</ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="caption" color={err('status') ? 'error' : 'text.secondary'} sx={{ display: 'block', mt: 0.75 }}>
                  {err('status') || (form.status === 'active' ? 'Customers can see and order it once you save.' : 'Drafts are hidden from the shop. Only admins can see them.')}
                </Typography>
              </Box>
              <Box>
                <FormControlLabel control={<Switch checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />} label={<Typography component="span" sx={{ fontWeight: 700 }}>Featured</Typography>} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 6.5, mt: -0.5 }}>
                  Featured pieces are shown first in the shop and in the featured picks.
                </Typography>
              </Box>
              <Box>
                <TextField
                  label="Badge"
                  value={form.badge}
                  placeholder="e.g. New"
                  onChange={(e) => set('badge', e.target.value)}
                  error={Boolean(err('badge'))}
                  helperText={<Help text={err('badge') || 'A short label on the product card. Leave empty for none.'} count={form.badge.length} max={LIMITS.badge} />}
                  slotProps={{ htmlInput: { maxLength: LIMITS.badge } }}
                />
                <Stack direction="row" spacing={0.75} useFlexGap sx={{ mt: 1, flexWrap: 'wrap' }}>
                  {BADGE_IDEAS.map((idea) => (
                    <Chip key={idea} size="small" label={idea} variant={form.badge === idea ? 'filled' : 'outlined'} color={form.badge === idea ? 'secondary' : 'default'} onClick={() => set('badge', form.badge === idea ? '' : idea)} />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Section>

          <ArtworkSection
            form={form}
            knownMedia={knownArtwork}
            error={err('art') || err('artworkMediaId')}
            onChange={(patch) => {
              setForm((f) => ({ ...f, ...patch }));
              setErrors((e) => ({ ...e, art: undefined, artworkMediaId: undefined }));
            }}
          />

          {!isNew && (
            <Section title="Delete">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Removes the product, its photos and its print file for good. To hide it for a while, make it a draft instead.
              </Typography>
              <Button variant="outlined" color="error" startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlinedIcon />} onClick={remove} disabled={saving || deleting}>
                Delete product
              </Button>
            </Section>
          )}
        </Stack>
      </Box>

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
          {isNew ? 'New product: not saved yet' : dirty ? 'You have unsaved changes' : 'All changes saved'}
        </Typography>
        <Stack direction="row" spacing={1}>
          {dirty && !isNew && (
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
          {saveButton}
        </Stack>
      </Paper>
    </>
  );
}

// ---------- Page ----------

export default function ProductEditPage() {
  const { id } = useParams();
  const query = useData(id ? `/products/${encodeURIComponent(id)}` : null);
  const collections = useData('/collections');
  const loaded = query.data?.product;

  if (id && loaded?.id !== id) {
    if (query.error) {
      return (
        <>
          <Button size="small" startIcon={<ArrowBackIcon />} component={Link} to="/products" sx={{ mb: 1, ml: -1 }}>
            Products
          </Button>
          <PageHeader title="Product" />
          <ErrorState error={query.error} onRetry={query.error.status === 404 ? undefined : query.reload} />
        </>
      );
    }
    return <Loading label="Loading the product…" />;
  }

  return <ProductForm key={id ?? 'new'} product={id ? loaded : null} collections={collections.data?.items ?? (collections.error ? [] : null)} collectionsError={Boolean(collections.error && !collections.data)} />;
}
