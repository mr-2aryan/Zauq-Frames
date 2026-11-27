import { keyframes } from '@emotion/react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardCapslockIcon from '@mui/icons-material/KeyboardCapslock';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MailOutlinedIcon from '@mui/icons-material/MailOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Alert, Box, Button, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../auth.jsx';
import { glass, radius } from '../design/tokens.js';

const CREAM = '#f4f3ee';
const BRASS = '#c9a45c';

const hangIn = keyframes`
  from { opacity: 0; transform: translateY(-14px) rotate(var(--tilt, 0deg)); }
  to { opacity: 1; transform: translateY(0) rotate(var(--tilt, 0deg)); }
`;
const glow = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
const motion = (animation) => ({ animation, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } });

/** One framed piece on the wall: black frame, white mat, the picture. `w`/`h` are in em, so the wall scales as one. */
function WallFrame({ src, w, h, top, left, tilt = 0, delay = 0 }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: `${top}em`,
        left: `${left}em`,
        width: `${w}em`,
        height: `${h}em`,
        '--tilt': `${tilt}deg`,
        transform: `rotate(${tilt}deg)`,
        bgcolor: '#121409',
        p: '0.55em',
        borderRadius: '0.12em',
        boxShadow: '0 1.6em 2.4em -0.6em rgba(0,0,0,.55), 0 0.3em 0.6em rgba(0,0,0,.35), inset 0 0 0 0.06em rgba(255,255,255,.06)',
        ...motion(`${hangIn} 900ms cubic-bezier(.2,.8,.2,1) ${delay}ms both`),
      }}
    >
      <Box sx={{ width: '100%', height: '100%', bgcolor: '#fbfaf6', p: '0.8em', boxShadow: 'inset 0 0.15em 0.3em rgba(0,0,0,.18)' }}>
        <Box component="img" src={src} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', boxShadow: '0 0 0 0.05em rgba(0,0,0,.12)' }} />
      </Box>
    </Box>
  );
}

/** The studio wall: three framed pieces under a brass picture light. */
function GalleryWall({ size }) {
  return (
    <Box sx={{ position: 'relative', fontSize: size, width: '30em', height: '24em', mx: 'auto' }} aria-hidden="true">
      {/* Picture light and its glow */}
      <Box
        sx={{
          position: 'absolute',
          top: '-1.9em',
          left: '0.75em',
          width: '14em',
          height: '18em',
          // Fades to nothing well inside the box, so no edge shows.
          background: 'radial-gradient(ellipse 50% 100% at 50% 0%, rgba(255,236,190,.26) 0%, rgba(255,236,190,.08) 40%, rgba(255,236,190,0) 70%)',
          pointerEvents: 'none',
          ...motion(`${glow} 1600ms ease 500ms both`),
        }}
      />
      <Box sx={{ position: 'absolute', top: '-2.2em', left: '5.3em', width: '4.8em', height: '0.55em', borderRadius: '0.3em', background: `linear-gradient(180deg, #e6c98a, ${BRASS} 60%, #8a6d34)`, boxShadow: '0 0.3em 0.6em rgba(0,0,0,.4)' }} />
      <WallFrame src="/images/art/tawakkul-sabr-shukr.jpg" w={11.5} h={15.2} top={0} left={2} delay={150} />
      <WallFrame src="/images/art/badshahi-mosque.jpg" w={13} h={10} top={1.4} left={15.4} tilt={0} delay={350} />
      <WallFrame src="/images/art/colour-town.jpg" w={7.4} h={9.6} top={13.2} left={17.6} delay={550} />
    </Box>
  );
}

function Logo({ light = false }) {
  const color = light ? CREAM : 'text.primary';
  return (
    <Stack spacing={0.25} sx={{ alignItems: 'flex-start' }}>
      <Typography sx={{ color, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, letterSpacing: '0.16em', fontSize: 26, lineHeight: 1 }}>ZAUQ</Typography>
      <Typography sx={{ color: light ? BRASS : 'primary.main', fontSize: 9.5, fontWeight: 800, letterSpacing: '0.42em' }}>STUDIO ADMIN</Typography>
    </Stack>
  );
}

export default function LoginPage() {
  const { login, notice } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [state, setState] = useState({ busy: false, error: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: '' });
    try {
      await login(form.email.trim(), form.password);
    } catch (error) {
      setState({ busy: false, error: error.message });
    }
  };
  const watchCaps = (e) => setCapsLock(Boolean(e.getModifierState?.('CapsLock')));

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' }, p: { xs: 1.25, md: 1.5 }, gap: { xs: 1.25, md: 1.5 } }}>
      {/* The studio wall (a short band on phones, the left half on larger screens) */}
      <Box
        component="aside"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: `${radius.xl}px`,
          boxShadow: '0 30px 70px -30px rgba(20,24,8,.6), inset 0 1px 0 rgba(255,255,255,.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: { xs: 2, md: 4 },
          px: { xs: 3, md: 6 },
          pt: { xs: 3, md: 6 },
          pb: { xs: 3, md: 6 },
          background: 'radial-gradient(90% 70% at 30% 20%, #4a5726 0%, #2f3817 55%, #232a10 100%)',
          '&::after': {
            // A faint plaster texture, so the wall doesn't look flat.
            content: '""',
            position: 'absolute',
            inset: 0,
            opacity: 0.08,
            backgroundImage: 'radial-gradient(rgba(255,255,255,.5) 0.6px, transparent 0.6px)',
            backgroundSize: '5px 5px',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Logo light />
        </Box>
        <Box sx={{ position: 'relative', zIndex: 1, py: { xs: 2, md: 0 } }}>
          <GalleryWall size={{ xs: 'min(2.7vw, 11px)', sm: '11px', md: 'clamp(11px, 1.15vw, 17px)' }} />
        </Box>
        <Box sx={{ position: 'relative', zIndex: 1, display: { xs: 'none', md: 'block' }, maxWidth: 440 }}>
          <Typography sx={{ color: CREAM, fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 'clamp(1.4rem, 2vw, 1.9rem)', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
            Every frame that leaves the studio starts here.
          </Typography>
          <Typography sx={{ color: 'rgba(244,243,238,.62)', mt: 1.25, fontSize: 14.5 }}>Orders, pieces, prices and customers — all in one place.</Typography>
        </Box>
      </Box>

      {/* Sign-in form */}
      <Box component="main" sx={{ display: 'grid', placeItems: 'center', px: { xs: 0, sm: 3 }, py: { xs: 0, md: 6 } }}>
        <Box sx={{ width: '100%', maxWidth: 440, ...glass.raised, borderRadius: `${radius.xl}px`, p: { xs: 3, sm: 4.5 } }}>
          <Typography sx={{ color: 'secondary.main', fontWeight: 800, fontSize: 12, letterSpacing: '0.2em', mb: 1 }}>WELCOME BACK</Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '2rem', sm: '2.3rem' }, lineHeight: 1.1 }}>
            Sign in to the studio
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 3.5 }}>
            For the Zauq Frames team only.
          </Typography>

          {notice && !state.error && (
            <Alert severity="info" sx={{ mb: 2.5 }}>
              {notice}
            </Alert>
          )}
          {state.error && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {state.error}
            </Alert>
          )}

          <Stack component="form" spacing={2.25} onSubmit={submit}>
            <TextField
              label="Email"
              type="email"
              autoComplete="username"
              required
              autoFocus
              fullWidth
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              fullWidth
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={watchCaps}
              onKeyUp={watchCaps}
              helperText={
                capsLock ? (
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'warning.dark' }}>
                    <KeyboardCapslockIcon sx={{ fontSize: 16 }} /> Caps Lock is on
                  </Box>
                ) : (
                  ' '
                )
              }
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} size="small">
                        {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button type="submit" variant="contained" size="large" fullWidth disabled={state.busy} endIcon={state.busy ? null : <ArrowForwardIcon />} sx={{ py: 1.5, fontSize: 16 }}>
              {state.busy ? 'Signing in…' : 'Sign in'}
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 3, alignItems: 'center', justifyContent: 'center' }}>
            <ShieldOutlinedIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
              Private area · every sign-in is recorded
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
