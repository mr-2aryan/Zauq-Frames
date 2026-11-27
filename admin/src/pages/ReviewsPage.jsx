import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  InputAdornment,
  LinearProgress,
  Link as MuiLink,
  Rating,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { EmptyState, Loader, PageHeader } from '../components/ui.jsx';
import { api, ApiError } from '../lib/api.js';
import { dateTime } from '../lib/format.js';
import { useData, useDebounced, useUi } from '../lib/hooks.jsx';

const STATUS = {
  pending: { label: 'Waiting for approval', tab: 'Pending', color: 'warning' },
  approved: { label: 'Approved', tab: 'Approved', color: 'success' },
  rejected: { label: 'Rejected', tab: 'Rejected', color: 'default' },
};
const TABS = ['pending', 'approved', 'rejected', 'all'];

function TabLabel({ label, count }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <span>{label}</span>
      {count != null && <Chip size="small" label={count} sx={{ height: 20, fontSize: 12 }} />}
    </Stack>
  );
}

function ReviewCard({ review, busy, onStatus, onEdit, onDelete }) {
  const s = STATUS[review.status] ?? { label: review.status, color: 'default' };
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } }, flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h4" sx={{ wordBreak: 'break-word' }}>
            {review.productName}
          </Typography>
          <Chip size="small" label={s.label} color={s.color} variant={review.status === 'approved' ? 'filled' : 'outlined'} sx={{ flex: 'none' }} />
        </Stack>

        <Stack useFlexGap direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
          <Rating value={review.rating} readOnly size="small" />
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {review.name}
            {review.city ? `, ${review.city}` : ''}
          </Typography>
        </Stack>

        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {review.text}
        </Typography>

        <Stack useFlexGap direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
          {review.verified && <Chip size="small" color="success" icon={<VerifiedIcon />} label="Verified purchase" />}
          {review.orderId && (
            <Typography variant="caption" color="text.secondary">
              Order{' '}
              <MuiLink component={RouterLink} to={`/orders/${encodeURIComponent(review.orderId)}`} underline="hover" sx={{ fontWeight: 700 }}>
                {review.orderId}
              </MuiLink>
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {dateTime(review.createdAt)}
          </Typography>
        </Stack>

        {review.adminNote && (
          <Box sx={{ bgcolor: 'rgba(255,255,255,.6)', border: '1px solid rgba(38,44,20,.08)', borderRadius: 2, px: 1.5, py: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              Admin note (only admins see this)
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {review.adminNote}
            </Typography>
          </Box>
        )}

        <Box sx={{ flex: 1 }} />
        <Stack useFlexGap direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          {review.status !== 'approved' && (
            <Button size="small" variant="contained" color="success" startIcon={<CheckIcon />} disabled={busy} onClick={() => onStatus(review, 'approved')}>
              Approve
            </Button>
          )}
          {review.status !== 'rejected' && (
            <Button size="small" variant="outlined" startIcon={<BlockIcon />} disabled={busy} onClick={() => onStatus(review, 'rejected')}>
              Reject
            </Button>
          )}
          <Button size="small" startIcon={<EditIcon />} disabled={busy} onClick={() => onEdit(review)}>
            Edit
          </Button>
          <Button size="small" color="error" startIcon={<DeleteOutlinedIcon />} disabled={busy} onClick={() => onDelete(review)}>
            Delete
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

/** Checks the form the same way the server does, with friendlier wording. */
function checkReview(form) {
  const errors = {};
  const name = form.name.trim();
  if (name.length < 2) errors.name = 'Please enter a name (at least 2 characters).';
  else if (name.length > 40) errors.name = 'Keep the name to 40 characters or fewer.';
  if (form.city.trim().length > 40) errors.city = 'Keep the city to 40 characters or fewer.';
  if (!form.rating) errors.rating = 'Please choose a star rating.';
  const text = form.text.trim();
  if (text.length < 10) errors.text = 'The review needs at least 10 characters.';
  else if (text.length > 1000) errors.text = 'Keep the review to 1000 characters or fewer.';
  if (form.adminNote.trim().length > 500) errors.adminNote = 'Keep the note to 500 characters or fewer.';
  return errors;
}

function EditReviewDialog({ review, onClose, onSaved }) {
  const { notify } = useUi();
  const phone = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const [form, setForm] = useState(() => ({
    name: review.name ?? '',
    city: review.city ?? '',
    rating: review.rating ?? 5,
    text: review.text ?? '',
    adminNote: review.adminNote ?? '',
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    const problems = checkReview(form);
    setErrors(problems);
    if (Object.keys(problems).length) return;
    setSaving(true);
    try {
      await api(`/reviews/${encodeURIComponent(review.id)}`, {
        method: 'PATCH',
        body: { name: form.name.trim(), city: form.city.trim(), rating: form.rating, text: form.text.trim(), adminNote: form.adminNote.trim() },
      });
      notify('Review saved.');
      onSaved();
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fields).length) setErrors(error.fields);
      else notify(error.message, 'error');
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={saving ? undefined : onClose} fullWidth maxWidth="sm" fullScreen={phone}>
      <Box component="form" onSubmit={save} noValidate sx={{ display: 'contents' }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Edit review</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Typography variant="body2" color="text.secondary">
              On {review.productName}. Fix a typo or remove personal details. Changes show in the shop straight away if the review is approved.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField label="Name" value={form.name} onChange={set('name')} error={Boolean(errors.name)} helperText={errors.name} required />
              <TextField label="City" value={form.city} onChange={set('city')} error={Boolean(errors.city)} helperText={errors.city ?? 'Optional'} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Rating
              </Typography>
              <Rating value={form.rating} onChange={(_e, value) => setForm((f) => ({ ...f, rating: value ?? f.rating }))} />
              {errors.rating && <FormHelperText error>{errors.rating}</FormHelperText>}
            </Box>
            <TextField
              label="Review"
              value={form.text}
              onChange={set('text')}
              multiline
              minRows={4}
              error={Boolean(errors.text)}
              helperText={errors.text ?? `${form.text.trim().length} / 1000`}
              required
            />
            <TextField
              label="Admin note"
              value={form.adminNote}
              onChange={set('adminNote')}
              multiline
              minRows={2}
              error={Boolean(errors.adminNote)}
              helperText={errors.adminNote ?? 'Only admins see this, e.g. why it was rejected or edited.'}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function ReviewsPage() {
  const { notify, confirm } = useUi();
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const q = useDebounced(search.trim(), 300);
  const query = useData(`/reviews?status=${status}${q ? `&q=${encodeURIComponent(q)}` : ''}`);
  const [busyId, setBusyId] = useState(null);
  const [editing, setEditing] = useState(null);

  const counts = query.data?.counts;
  const countFor = (key) => (counts ? (key === 'all' ? counts.pending + counts.approved + counts.rejected : counts[key]) : undefined);

  const changeStatus = async (review, next) => {
    setBusyId(review.id);
    try {
      await api(`/reviews/${encodeURIComponent(review.id)}`, { method: 'PATCH', body: { status: next } });
      notify(next === 'approved' ? 'Review approved. It now shows in the shop.' : 'Review rejected. It is hidden from the shop.');
      query.reload();
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (review) => {
    const ok = await confirm({
      title: 'Delete this review?',
      text: `The review by ${review.name} on ${review.productName} will be removed for good. To just hide it from the shop, reject it instead.`,
      danger: true,
      confirmLabel: 'Delete review',
    });
    if (!ok) return;
    setBusyId(review.id);
    try {
      await api(`/reviews/${encodeURIComponent(review.id)}`, { method: 'DELETE' });
      notify('Review deleted.');
      query.reload();
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader title="Reviews" subtitle="What customers say about your frames." />

      <Alert severity="info" sx={{ mb: 2 }}>
        New reviews only appear in the shop after you approve them. Rejected reviews stay hidden.
      </Alert>

      <Card sx={{ mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 1, sm: 2 } }}>
          <Tabs value={status} onChange={(_e, value) => setStatus(value)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
            {TABS.map((key) => (
              <Tab key={key} value={key} label={<TabLabel label={key === 'all' ? 'All' : STATUS[key].tab} count={countFor(key)} />} />
            ))}
          </Tabs>
        </Box>
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          <TextField
            type="search"
            placeholder="Search by product, name, city or words in the review"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ maxWidth: { sm: 480 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
              htmlInput: { 'aria-label': 'Search reviews' },
            }}
          />
        </Box>
        {query.loading && query.data ? <LinearProgress sx={{ height: 2 }} /> : <Box sx={{ height: 2 }} />}
      </Card>

      <Loader query={query} label="Loading reviews…">
        {({ items }) =>
          items.length === 0 ? (
            <Card>
              <EmptyState
                title={q ? 'No reviews match your search' : status === 'pending' ? 'No reviews waiting' : 'No reviews here'}
                text={q ? 'Try different words.' : status === 'pending' ? 'You are all caught up. New reviews will appear here for you to check.' : undefined}
              />
            </Card>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
              {items.map((review) => (
                <ReviewCard key={review.id} review={review} busy={busyId === review.id} onStatus={changeStatus} onEdit={setEditing} onDelete={remove} />
              ))}
            </Box>
          )
        }
      </Loader>

      {editing && (
        <EditReviewDialog
          key={editing.id}
          review={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            query.reload();
          }}
        />
      )}
    </>
  );
}
