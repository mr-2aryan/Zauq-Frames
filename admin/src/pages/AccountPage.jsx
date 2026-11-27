import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Avatar, Box, Button, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../auth.jsx';
import { PageHeader, Section } from '../components/ui.jsx';
import { api, ApiError } from '../lib/api.js';
import { useUi } from '../lib/hooks.jsx';

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function AccountPage() {
  const { admin } = useAuth();
  const { notify } = useUi();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);

  const set = (field) => (e) => {
    const { value } = e.target;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const submit = async (e) => {
    e.preventDefault();
    const problems = {};
    if (!form.currentPassword) problems.currentPassword = 'Please enter your current password.';
    if (form.newPassword.length < 12) problems.newPassword = 'Use at least 12 characters.';
    else if (form.newPassword === form.currentPassword) problems.newPassword = 'Choose a password that is different from your current one.';
    if (!problems.newPassword && form.confirmPassword !== form.newPassword) problems.confirmPassword = 'The two new passwords don’t match.';
    setErrors(problems);
    if (Object.keys(problems).length) return;

    setSaving(true);
    try {
      await api('/auth/password', { method: 'POST', body: { currentPassword: form.currentPassword, newPassword: form.newPassword } });
      setForm(EMPTY);
      setErrors({});
      setShow(false);
      notify('Password changed. You’ve been signed out everywhere else.');
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fields).length) setErrors(error.fields);
      else notify(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const visibility = {
    input: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton size="small" edge="end" aria-label={show ? 'Hide passwords' : 'Show passwords'} onClick={() => setShow((s) => !s)}>
            {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </IconButton>
        </InputAdornment>
      ),
    },
  };

  return (
    <>
      <PageHeader title="Your account" subtitle="Your admin sign-in details." />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 1.4fr)' }, gap: 3, alignItems: 'start' }}>
        <Section title="Signed in as">
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: 'secondary.main', fontWeight: 800 }}>{admin?.name?.[0]?.toUpperCase() ?? 'A'}</Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800 }}>{admin?.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                {admin?.email}
              </Typography>
            </Box>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            For safety, you are signed out after an hour with no activity.
          </Typography>
        </Section>

        <Section title="Change password">
          <Stack component="form" spacing={2.5} onSubmit={submit} noValidate>
            {/* Lets password managers know which account this is for. */}
            <input type="email" name="username" autoComplete="username" value={admin?.email ?? ''} readOnly hidden />
            <TextField
              label="Current password"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={set('currentPassword')}
              error={Boolean(errors.currentPassword)}
              helperText={errors.currentPassword}
              required
              slotProps={visibility}
            />
            <TextField
              label="New password"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.newPassword}
              onChange={set('newPassword')}
              error={Boolean(errors.newPassword)}
              helperText={errors.newPassword}
              required
            />
            <TextField
              label="Confirm new password"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword ?? 'Type the new password again.'}
              required
            />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Your new password must:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5, color: 'text.secondary', typography: 'body2' }}>
                <li>be at least 12 characters long (a short sentence is easy to remember)</li>
                <li>not be a common password, like &quot;password&quot; or &quot;zauqframes&quot;</li>
                <li>not contain your email address</li>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Changing it signs you out on every other phone and computer. You stay signed in here.
              </Typography>
            </Box>
            <Box>
              <Button type="submit" variant="contained" startIcon={<LockOutlinedIcon />} disabled={saving}>
                {saving ? 'Changing…' : 'Change password'}
              </Button>
            </Box>
          </Stack>
        </Section>
      </Box>
    </>
  );
}
