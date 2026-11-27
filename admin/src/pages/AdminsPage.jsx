import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
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
import { useState } from 'react';
import { useAuth } from '../auth.jsx';
import { EmptyState, Loader, PageHeader } from '../components/ui.jsx';
import { api, ApiError } from '../lib/api.js';
import { date } from '../lib/format.js';
import { useData, useUi } from '../lib/hooks.jsx';

const EMPTY = { name: '', email: '', password: '' };

function AddAdminDialog({ open, onClose, onAdded }) {
  const { notify } = useUi();
  const phone = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const close = () => {
    if (saving) return;
    // Don't keep a typed password around after the dialog closes.
    setForm(EMPTY);
    setErrors({});
    setShow(false);
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    const problems = {};
    if (form.name.trim().length < 2) problems.name = 'Please enter their name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) problems.email = 'Please enter a valid email address.';
    if (form.password.length < 12) problems.password = 'Use at least 12 characters.';
    setErrors(problems);
    if (Object.keys(problems).length) return;
    setSaving(true);
    try {
      const { admin } = await api('/admins', { method: 'POST', body: { name: form.name.trim(), email: form.email.trim(), password: form.password } });
      notify(`${admin.name} can now sign in to the admin.`);
      setForm(EMPTY);
      setErrors({});
      setShow(false);
      onAdded();
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fields).length) setErrors(error.fields);
      else if (error instanceof ApiError && error.status === 409) setErrors({ email: error.message });
      else notify(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="sm" fullScreen={phone}>
      <Box component="form" onSubmit={submit} noValidate sx={{ display: 'contents' }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Add an admin</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Alert severity="info">
              If this email already has a customer account in the shop, that account becomes an admin. Its shop password changes to the one you set here, and it is signed out everywhere.
            </Alert>
            <TextField label="Name" value={form.name} onChange={set('name')} error={Boolean(errors.name)} helperText={errors.name} autoComplete="off" required autoFocus />
            <TextField label="Email" type="email" value={form.email} onChange={set('email')} error={Boolean(errors.email)} helperText={errors.email} autoComplete="off" required />
            <TextField
              label="Password"
              type={show ? 'text' : 'password'}
              value={form.password}
              onChange={set('password')}
              error={Boolean(errors.password)}
              helperText={errors.password ?? 'Give it to them in person or on a call, and ask them to change it after they first sign in.'}
              autoComplete="new-password"
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" edge="end" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)}>
                        {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                The password must:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'text.secondary', typography: 'body2' }}>
                <li>be at least 12 characters long (a short sentence is easy to remember)</li>
                <li>not be a common password, like &quot;password&quot; or &quot;zauqframes&quot;</li>
                <li>not contain their email address</li>
              </Box>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving} startIcon={<PersonAddAlt1Icon />}>
            {saving ? 'Adding…' : 'Add admin'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default function AdminsPage() {
  const { admin: me } = useAuth();
  const { notify, confirm } = useUi();
  const query = useData('/admins');
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const remove = async (person) => {
    const ok = await confirm({
      title: `Remove admin access for ${person.name}?`,
      text: `${person.email} will be signed out and won't be able to open the admin any more. Their account stays in the shop as a normal customer account.`,
      danger: true,
      confirmLabel: 'Remove access',
    });
    if (!ok) return;
    setBusyId(person.id);
    try {
      await api(`/admins/${encodeURIComponent(person.id)}`, { method: 'DELETE' });
      notify(`${person.name} is no longer an admin.`);
      query.reload();
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Admins"
        subtitle="People who can sign in to this admin. Every admin can do everything here, so only add people you trust."
        actions={
          <Button variant="contained" startIcon={<PersonAddAlt1Icon />} onClick={() => setAdding(true)}>
            Add admin
          </Button>
        }
      />

      <Card>
        <Box sx={{ px: { xs: 1, sm: 2 }, py: 1 }}>
          <Loader query={query} label="Loading admins…">
            {({ items }) =>
              items.length === 0 ? (
                <EmptyState title="No admins found" />
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 600 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Admin since</TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>Access</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((person) => {
                        const isMe = person.id === me?.id;
                        return (
                          <TableRow key={person.id} hover>
                            <TableCell>
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <Typography sx={{ fontWeight: 700 }}>{person.name}</Typography>
                                {isMe && <Chip size="small" color="primary" label="You" />}
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ wordBreak: 'break-all' }}>{person.email}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{date(person.adminSince ?? person.createdAt)}</TableCell>
                            <TableCell sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <Tooltip title={isMe ? 'You can’t remove your own admin access.' : ''}>
                                <span>
                                  <Button size="small" color="error" startIcon={<PersonRemoveIcon />} disabled={isMe || busyId === person.id} onClick={() => remove(person)}>
                                    Remove admin access
                                  </Button>
                                </span>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              )
            }
          </Loader>
        </Box>
      </Card>

      <AddAdminDialog
        open={adding}
        onClose={() => setAdding(false)}
        onAdded={() => {
          setAdding(false);
          query.reload();
        }}
      />
    </>
  );
}
