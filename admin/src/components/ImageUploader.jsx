import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import StarIcon from '@mui/icons-material/Star';
import { Box, Button, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { uploadImages } from '../lib/api.js';
import { useUi } from '../lib/hooks.jsx';

const ACCEPT = 'image/jpeg,image/png,image/webp';

/** The small copy of an uploaded image (for previews), when there is one. */
export const thumbOf = (url) => (url?.startsWith('/media/') && url.endsWith('-large.webp') ? url.replace('-large.webp', '-thumb.webp') : url);

/**
 * A list of images (URLs) you can add to, reorder (drag, or the arrows) and
 * remove. Uploads go straight to the media library on the server; the first
 * image is the main one.
 */
export function ImageList({ value, onChange, folder = 'products', max = 12, label = 'Photos' }) {
  const { notify } = useUi();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(null);

  const add = async (files) => {
    const list = [...files].slice(0, max - value.length);
    if (!list.length) return;
    setBusy(true);
    try {
      const saved = await uploadImages(list, folder);
      onChange([...value, ...saved.map((m) => m.files.large)]);
      notify(`${saved.length} photo${saved.length === 1 ? '' : 's'} uploaded.`);
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  const move = (from, to) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <Box>
      <Stack direction="row" sx={{ mb: 1, alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Typography variant="h4">{label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {value.length}/{max} · the first is the main photo · drag to reorder
        </Typography>
      </Stack>
      <Box
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))', gap: 1.5 }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.length) add(e.dataTransfer.files);
        }}
      >
        {value.map((url, index) => (
          <Box
            key={url}
            draggable
            onDragStart={() => setDragging(index)}
            onDragEnd={() => setDragging(null)}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (dragging !== null) move(dragging, index);
            }}
            sx={{ position: 'relative', aspectRatio: '1', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: index === 0 ? 'primary.main' : 'divider', bgcolor: 'rgba(255,255,255,.5)', cursor: 'grab', opacity: dragging === index ? 0.4 : 1 }}
          >
            <Box component="img" src={thumbOf(url)} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            {index === 0 && (
              <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', left: 6, top: 6, px: 0.75, py: 0.25, borderRadius: 99, bgcolor: 'primary.main', color: '#fff', alignItems: 'center' }}>
                <StarIcon sx={{ fontSize: 12 }} />
                <Typography sx={{ fontSize: 10, fontWeight: 800 }}>MAIN</Typography>
              </Stack>
            )}
            <Stack direction="row" sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,.88)' }}>
              <IconButton size="small" aria-label="Move earlier" disabled={index === 0} onClick={() => move(index, index - 1)}>
                <ArrowBackIcon fontSize="inherit" />
              </IconButton>
              <Tooltip title="Remove">
                <IconButton size="small" aria-label="Remove photo" onClick={() => onChange(value.filter((_, i) => i !== index))}>
                  <DeleteOutlineIcon fontSize="inherit" color="error" />
                </IconButton>
              </Tooltip>
              <IconButton size="small" aria-label="Move later" disabled={index === value.length - 1} onClick={() => move(index, index + 1)}>
                <ArrowForwardIcon fontSize="inherit" />
              </IconButton>
            </Stack>
          </Box>
        ))}
        {value.length < max && (
          <Button
            variant="outlined"
            onClick={() => input.current?.click()}
            disabled={busy}
            sx={{ aspectRatio: '1', borderRadius: 2, borderStyle: 'dashed', flexDirection: 'column', gap: 0.5, minWidth: 0 }}
          >
            {busy ? <CircularProgress size={22} /> : <AddPhotoAlternateIcon />}
            <Typography variant="caption">{busy ? 'Uploading…' : 'Add or drop'}</Typography>
          </Button>
        )}
      </Box>
      <input ref={input} type="file" accept={ACCEPT} multiple hidden onChange={(e) => (add(e.target.files), (e.target.value = ''))} />
    </Box>
  );
}

/** One image (collection cover, card image, share image): upload, replace or clear. */
export function SingleImage({ value, onChange, folder = 'products', label, hint, aspect = '4 / 5' }) {
  const { notify } = useUi();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const pick = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const [saved] = await uploadImages([file], folder);
      onChange(saved.files.large);
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Box>
      {label && <Typography variant="h4" sx={{ mb: 0.5 }}>{label}</Typography>}
      {hint && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{hint}</Typography>}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box sx={{ width: 96, aspectRatio: aspect, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,.5)', flex: 'none' }}>
          {value && <Box component="img" src={thumbOf(value)} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
        </Box>
        <Stack spacing={1}>
          <Button size="small" variant="outlined" onClick={() => input.current?.click()} disabled={busy} startIcon={busy ? <CircularProgress size={14} /> : <AddPhotoAlternateIcon />}>
            {value ? 'Replace' : 'Upload'}
          </Button>
          {value && (
            <Button size="small" color="error" onClick={() => onChange(null)}>
              Remove
            </Button>
          )}
        </Stack>
      </Stack>
      <input ref={input} type="file" accept={ACCEPT} hidden onChange={(e) => (pick(e.target.files?.[0]), (e.target.value = ''))} />
    </Box>
  );
}
