import CheckIcon from '@mui/icons-material/Check';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import LinkIcon from '@mui/icons-material/Link';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { EmptyState, Loader, PageHeader } from '../components/ui.jsx';
import { api, download, uploadImages } from '../lib/api.js';
import { ago, dateTime, SHOP_URL } from '../lib/format.js';
import { useData, useDebounced, useUi } from '../lib/hooks.jsx';

const TABS = [
  ['', 'All'],
  ['products', 'Products'],
  ['collections', 'Collections'],
  ['site', 'Site'],
  ['blog', 'Blog'],
  ['seo', 'SEO'],
  ['artwork', 'Print files'],
];
const FOLDER_LABEL = Object.fromEntries(TABS.filter(([key]) => key));
/** Folders you can upload images into here (print files are uploaded on a product's page). */
const UPLOAD_FOLDERS = TABS.filter(([key]) => key && key !== 'artwork');
const ACCEPT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const PER_REQUEST = 20;

const fileSize = (bytes) => (bytes == null ? '' : bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/** Copies text to the clipboard (with a fallback for older browsers and plain http). */
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

function MediaCard({ item, showFolder, onUpdated, onDelete, deleting }) {
  const { notify } = useUi();
  const [alt, setAlt] = useState(item.alt ?? '');
  const [savingAlt, setSavingAlt] = useState(false);
  const [altSaved, setAltSaved] = useState(false);
  const isPrivate = Boolean(item.private);
  const preview = item.files?.thumb ?? item.files?.art ?? item.files?.medium ?? item.files?.large;
  const link = item.files?.large ?? item.files?.art;

  const saveAlt = async () => {
    const value = alt.trim();
    if (value === (item.alt ?? '')) return;
    setSavingAlt(true);
    try {
      const data = await api(`/media/${item.id}`, { method: 'PATCH', body: { alt: value } });
      onUpdated({ ...item, ...data.media });
      setAlt(data.media.alt ?? value);
      setAltSaved(true);
      setTimeout(() => setAltSaved(false), 2000);
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSavingAlt(false);
    }
  };

  const copyLink = async () => {
    const url = `${SHOP_URL.replace(/\/$/, '')}${link}`;
    if (await copyText(url)) notify(isPrivate ? 'Link to the small public copy copied.' : 'Link copied.');
    else notify(`Could not copy. The link is: ${url}`, 'warning');
  };

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', opacity: deleting ? 0.5 : 1 }}>
      <Box sx={{ position: 'relative', aspectRatio: '1', bgcolor: 'rgba(255,255,255,.5)', borderBottom: '1px solid', borderColor: 'divider' }}>
        {preview && <Box component="img" src={preview} alt={item.alt || ''} loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />}
        <Stack direction="row" spacing={0.5} useFlexGap sx={{ position: 'absolute', top: 8, left: 8, right: 8, flexWrap: 'wrap' }}>
          <Chip size="small" label={item.inUse ? 'In use' : 'Not used'} color={item.inUse ? 'success' : 'default'} sx={{ bgcolor: item.inUse ? undefined : 'rgba(255,255,255,.92)' }} />
          {isPrivate && <Chip size="small" icon={<LockOutlinedIcon />} label="Private print file" color="secondary" />}
        </Stack>
      </Box>
      <Box sx={{ p: 1.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
        <Box sx={{ minWidth: 0 }}>
          <Tooltip title={item.originalName || ''} placement="top-start">
            <Typography variant="body2" sx={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.originalName || 'Untitled'}
            </Typography>
          </Tooltip>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {item.width && item.height ? `${item.width} × ${item.height} px · ` : ''}
            {fileSize(item.bytes)}
          </Typography>
          <Tooltip title={dateTime(item.createdAt)} placement="bottom-start">
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {showFolder && FOLDER_LABEL[item.folder] ? `${FOLDER_LABEL[item.folder]} · ` : ''}
              Added {ago(item.createdAt)}
            </Typography>
          </Tooltip>
        </Box>
        {!isPrivate && (
          <TextField
            size="small"
            label="Description (alt text)"
            placeholder="What the picture shows"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            onBlur={saveAlt}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.target.blur();
            }}
            slotProps={{
              htmlInput: { maxLength: 160 },
              input: {
                endAdornment:
                  savingAlt || altSaved ? (
                    <InputAdornment position="end">{savingAlt ? <CircularProgress size={14} /> : <CheckIcon fontSize="small" color="success" />}</InputAdornment>
                  ) : undefined,
              },
            }}
          />
        )}
        <Stack direction="row" sx={{ mt: 'auto', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row">
            {link && (
              <Tooltip title={isPrivate ? 'Copy the link to the small public copy' : 'Copy link'}>
                <IconButton size="small" onClick={copyLink} aria-label="Copy link">
                  <LinkIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {isPrivate && (
              <Tooltip title="Download print file">
                <IconButton size="small" onClick={() => download(`/media/${item.id}/original`)} aria-label="Download print file">
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
          <Tooltip title={item.inUse ? 'In use on the shop. Remove it from where it is used first.' : 'Delete'}>
            <span>
              <IconButton size="small" onClick={() => onDelete(item)} disabled={item.inUse || deleting} aria-label="Delete">
                <DeleteOutlinedIcon fontSize="small" color={item.inUse || deleting ? 'disabled' : 'error'} />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>
    </Card>
  );
}

export default function MediaPage() {
  const { notify, confirm } = useUi();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([key]) => key === params.get('folder')) ? params.get('folder') : '';
  const media = useData(`/media${tab ? `?folder=${tab}` : ''}`);
  const { setData, reload } = media;

  const [uploadFolder, setUploadFolder] = useState(() => (UPLOAD_FOLDERS.some(([key]) => key === tab) ? tab : 'products'));
  const [uploading, setUploading] = useState(null); // { done, total }
  const [dragOver, setDragOver] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');
  const query = useDebounced(search.trim().toLowerCase(), 200);
  const [unusedOnly, setUnusedOnly] = useState(false);
  const input = useRef(null);

  const changeTab = (key) => {
    setParams(key ? { folder: key } : {}, { replace: true });
    if (UPLOAD_FOLDERS.some(([k]) => k === key)) setUploadFolder(key);
  };

  const items = useMemo(() => media.data?.items ?? [], [media.data]);
  const visible = useMemo(
    () => items.filter((m) => (!unusedOnly || !m.inUse) && (!query || `${m.originalName ?? ''} ${m.alt ?? ''}`.toLowerCase().includes(query))),
    [items, unusedOnly, query],
  );
  const unusedCount = items.filter((m) => !m.inUse).length;
  const totalBytes = items.reduce((sum, m) => sum + (m.bytes ?? 0), 0);

  const upload = async (fileList) => {
    const files = [...(fileList ?? [])];
    if (!files.length || uploading) return;
    const wrongType = files.filter((f) => !ACCEPT_TYPES.includes(f.type));
    const tooBig = files.filter((f) => ACCEPT_TYPES.includes(f.type) && f.size > MAX_IMAGE_BYTES);
    const ok = files.filter((f) => ACCEPT_TYPES.includes(f.type) && f.size <= MAX_IMAGE_BYTES);
    if (wrongType.length) notify(`${wrongType.length} file${wrongType.length === 1 ? ' was' : 's were'} skipped: only JPG, PNG or WebP images. Print files are uploaded on a product’s page.`, 'warning');
    else if (tooBig.length) notify(`${tooBig.length} image${tooBig.length === 1 ? ' is' : 's are'} over 25 MB and ${tooBig.length === 1 ? 'was' : 'were'} skipped.`, 'warning');
    if (!ok.length) return;

    setUploading({ done: 0, total: ok.length });
    let done = 0;
    try {
      for (let i = 0; i < ok.length; i += PER_REQUEST) {
        const saved = await uploadImages(ok.slice(i, i + PER_REQUEST), uploadFolder);
        done += saved.length;
        setUploading({ done, total: ok.length });
      }
      notify(`${done} image${done === 1 ? '' : 's'} uploaded to ${FOLDER_LABEL[uploadFolder]}.`);
    } catch (error) {
      notify(done ? `${done} uploaded, then: ${error.message}` : error.message, 'error');
    } finally {
      setUploading(null);
      if (done) {
        if (tab && tab !== uploadFolder) changeTab(uploadFolder);
        else reload();
      }
    }
  };

  const remove = async (item) => {
    const ok = await confirm({
      title: item.private ? 'Delete this print file?' : 'Delete this image?',
      text: item.private
        ? `“${item.originalName || 'This file'}” and its small copy are deleted from the server for good. Download it first if you may need it again.`
        : `“${item.originalName || 'This image'}” and all its sizes are deleted from the server for good. This cannot be undone.`,
      danger: true,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    setDeleting(item.id);
    try {
      await api(`/media/${item.id}`, { method: 'DELETE' });
      setData((d) => ({ ...d, items: d.items.filter((m) => m.id !== item.id) }));
      notify(item.private ? 'Print file deleted.' : 'Image deleted.');
    } catch (error) {
      notify(error.message, 'error');
      if (error.status === 409) reload();
    } finally {
      setDeleting(null);
    }
  };

  const canDrop = tab !== 'artwork';

  return (
    <>
      <PageHeader
        title="Media library"
        subtitle="Every image uploaded to the shop, and the private print files."
        actions={
          <>
            <TextField select size="small" label="Upload to" value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)} sx={{ width: 150 }} disabled={Boolean(uploading)}>
              {UPLOAD_FOLDERS.map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="contained" startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadOutlinedIcon />} onClick={() => input.current?.click()} disabled={Boolean(uploading)}>
              {uploading ? `Uploading ${uploading.done}/${uploading.total}…` : 'Upload images'}
            </Button>
          </>
        }
      />
      <input ref={input} type="file" accept={ACCEPT_TYPES.join(',')} multiple hidden onChange={(e) => (upload(e.target.files), (e.target.value = ''))} />

      <Card sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_e, key) => changeTab(key)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile aria-label="Folders" sx={{ px: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          {TABS.map(([key, label]) => (
            <Tab key={key || 'all'} value={key} label={label} icon={key === 'artwork' ? <LockOutlinedIcon fontSize="small" /> : undefined} iconPosition="start" sx={{ minHeight: 48, fontWeight: 700, textTransform: 'none' }} />
          ))}
        </Tabs>
        <Box sx={{ p: 2, display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto' }, alignItems: 'center' }}>
          <TextField
            placeholder="Search by file name or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
              htmlInput: { 'aria-label': 'Search media' },
            }}
          />
          <FormControlLabel control={<Switch checked={unusedOnly} onChange={(e) => setUnusedOnly(e.target.checked)} />} label={<Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>Only not used</Typography>} sx={{ mr: 0 }} />
        </Box>
        {uploading && <LinearProgress variant={uploading.done ? 'determinate' : 'indeterminate'} value={(uploading.done / uploading.total) * 100} />}
      </Card>

      {tab === 'artwork' && (
        <Alert severity="info" icon={<LockOutlinedIcon fontSize="small" />} sx={{ mb: 2 }}>
          Print files are uploaded on a product’s page (Artwork section). They are private: the full file is never public and only admins can download it. Only a small copy is shown on the shop.
        </Alert>
      )}

      <Loader query={media} label="Loading media…">
        {() => (
          <Box
            onDragOver={(e) => {
              if (!canDrop) return;
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false);
            }}
            onDrop={(e) => {
              if (!canDrop) return;
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files?.length) upload(e.dataTransfer.files);
            }}
            sx={{ borderRadius: 3, outline: dragOver ? '2px dashed' : 'none', outlineColor: 'primary.main', outlineOffset: 4 }}
          >
            {items.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                {visible.length === items.length ? `${items.length} file${items.length === 1 ? '' : 's'}` : `Showing ${visible.length} of ${items.length}`} · {unusedCount} not used · {fileSize(totalBytes)} uploaded
                {canDrop ? ' · drop images here to upload them' : ''}
              </Typography>
            )}
            {visible.length === 0 ? (
              <Card>
                {items.length === 0 ? (
                  <EmptyState
                    title={tab === 'artwork' ? 'No print files yet' : 'Nothing here yet'}
                    text={tab === 'artwork' ? 'Upload a print file from a product’s page.' : 'Upload images, or drop them here.'}
                    action={
                      canDrop && (
                        <Button variant="outlined" startIcon={<CloudUploadOutlinedIcon />} onClick={() => input.current?.click()} sx={{ mt: 1 }}>
                          Upload images
                        </Button>
                      )
                    }
                  />
                ) : (
                  <EmptyState
                    title="Nothing matches"
                    text="Try another search, or turn off “Only not used”."
                    action={
                      <Button
                        onClick={() => {
                          setSearch('');
                          setUnusedOnly(false);
                        }}
                        sx={{ mt: 1 }}
                      >
                        Clear filters
                      </Button>
                    }
                  />
                )}
              </Card>
            ) : (
              <Box sx={{ display: 'grid', gap: { xs: 1.5, sm: 2 }, gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(auto-fill, minmax(210px, 1fr))' } }}>
                {visible.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    showFolder={!tab}
                    deleting={deleting === item.id}
                    onDelete={remove}
                    onUpdated={(next) => setData((d) => ({ ...d, items: d.items.map((m) => (m.id === next.id ? { ...m, ...next } : m)) }))}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Loader>
    </>
  );
}
