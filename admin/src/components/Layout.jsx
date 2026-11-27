import { keyframes } from '@emotion/react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SearchIcon from '@mui/icons-material/Search';
import { Avatar, Badge, Box, ButtonBase, Divider, Drawer, IconButton, ListItemIcon, Menu, MenuItem, Stack, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../auth.jsx';
import { color, font, glass, motion, radius } from '../design/tokens.js';
import { api } from '../lib/api.js';
import { ago, money, SHOP_URL } from '../lib/format.js';
import { NAV, NAV_ITEMS } from '../nav.js';
import { CommandPalette } from './CommandPalette.jsx';
import { PageSkeleton } from './ui.jsx';

const SIDEBAR = 252;
const GAP = 12;
const SEEN_KEY = 'zauq-admin:orders-seen-at';

const pageIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
`;

/** Order, message and review counts for the sidebar, and the latest orders for the bell; refreshed every minute and on focus. */
function useLiveCounts() {
  const [state, setState] = useState({ counts: {}, latest: [] });
  useEffect(() => {
    let live = true;
    const load = () =>
      Promise.all([api('/dashboard/counts').catch(() => null), api('/dashboard/latest-orders').catch(() => null)]).then(([counts, latest]) => {
        if (live) setState((s) => ({ counts: counts ?? s.counts, latest: latest?.items ?? s.latest }));
      });
    load();
    const timer = setInterval(load, 60_000);
    window.addEventListener('focus', load);
    return () => {
      live = false;
      clearInterval(timer);
      window.removeEventListener('focus', load);
    };
  }, []);
  return state;
}

function Logo() {
  return (
    <Stack spacing={0.4} sx={{ lineHeight: 1 }}>
      <Typography sx={{ fontFamily: font.display, fontWeight: 800, letterSpacing: '0.18em', fontSize: 21, color: color.cream, lineHeight: 1 }}>ZAUQ</Typography>
      <Typography sx={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '0.38em', color: color.brass }}>STUDIO ADMIN</Typography>
    </Stack>
  );
}

function NavItem({ item, count, onNavigate }) {
  const Icon = item.icon;
  return (
    <ButtonBase
      component={NavLink}
      to={item.path}
      end={item.path === '/'}
      onClick={onNavigate}
      sx={{
        position: 'relative',
        width: '100%',
        justifyContent: 'flex-start',
        gap: 1.5,
        px: 1.5,
        py: 1,
        borderRadius: `${radius.sm}px`,
        color: 'rgba(244,243,238,.72)',
        fontSize: 14.5,
        fontWeight: 650,
        transition: `background-color ${motion.base} ${motion.ease}, color ${motion.base} ${motion.ease}`,
        '&:hover': { backgroundColor: 'rgba(255,255,255,.06)', color: color.cream },
        '&.Mui-focusVisible': { boxShadow: `0 0 0 2px ${color.brass}` },
        '&.active': {
          color: '#fff',
          backgroundColor: 'rgba(255,255,255,.11)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08), 0 6px 16px -8px rgba(0,0,0,.5)',
          '& .nav-icon': { color: color.brass },
          '&::before': { opacity: 1, transform: 'scaleY(1)' },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: -8,
          top: 10,
          bottom: 10,
          width: 3,
          borderRadius: 3,
          backgroundColor: color.brass,
          opacity: 0,
          transform: 'scaleY(.4)',
          transition: `all ${motion.base} ${motion.ease}`,
        },
      }}
    >
      <Icon className="nav-icon" sx={{ fontSize: 19, color: 'rgba(244,243,238,.55)', transition: `color ${motion.base} ${motion.ease}` }} />
      <Box component="span" sx={{ flex: 1, textAlign: 'left' }}>
        {item.label}
      </Box>
      {count > 0 && (
        <Box component="span" sx={{ minWidth: 22, height: 20, px: 0.75, borderRadius: 99, display: 'grid', placeItems: 'center', fontSize: 11.5, fontWeight: 800, bgcolor: color.terracotta, color: '#fff', boxShadow: '0 4px 10px -4px rgba(200,100,59,.8)' }}>
          {count > 99 ? '99+' : count}
        </Box>
      )}
    </ButtonBase>
  );
}

function Sidebar({ counts, onNavigate }) {
  const { admin, logout } = useAuth();
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', color: color.cream }}>
      <Box sx={{ px: 2.75, pt: 3, pb: 2.5 }}>
        <Link to="/" onClick={onNavigate} style={{ textDecoration: 'none' }} aria-label="Dashboard">
          <Logo />
        </Link>
      </Box>
      <Box component="nav" sx={{ flex: 1, overflowY: 'auto', px: 1.5, pb: 2, scrollbarColor: 'rgba(255,255,255,.15) transparent' }}>
        {NAV.map((section) => (
          <Box key={section.group} sx={{ mb: 1.75 }}>
            <Typography sx={{ px: 1.5, mb: 0.5, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,243,238,.38)' }}>{section.group}</Typography>
            <Stack spacing={0.25}>
              {section.items.map((item) => (
                <NavItem key={item.path} item={item} count={item.badge ? counts[item.badge] : 0} onNavigate={onNavigate} />
              ))}
            </Stack>
          </Box>
        ))}
      </Box>
      <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255,255,255,.07)' }}>
        <ButtonBase
          component="a"
          href={SHOP_URL}
          target="_blank"
          rel="noopener"
          sx={{ width: '100%', justifyContent: 'flex-start', gap: 1.5, px: 1.5, py: 1, borderRadius: `${radius.sm}px`, color: 'rgba(244,243,238,.72)', fontSize: 14, fontWeight: 650, '&:hover': { backgroundColor: 'rgba(255,255,255,.06)', color: color.cream } }}
        >
          <NorthEastIcon sx={{ fontSize: 18 }} /> View the shop
        </ButtonBase>
        <Stack direction="row" spacing={1.25} sx={{ mt: 1, p: 1.25, borderRadius: `${radius.md}px`, alignItems: 'center', bgcolor: 'rgba(255,255,255,.05)' }}>
          <Avatar sx={{ width: 34, height: 34, fontSize: 14, bgcolor: color.terracotta }}>{admin?.name?.[0]?.toUpperCase() ?? 'A'}</Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography noWrap sx={{ fontWeight: 750, fontSize: 13.5, lineHeight: 1.25 }}>
              {admin?.name}
            </Typography>
            <Typography noWrap sx={{ fontSize: 11.5, color: 'rgba(244,243,238,.5)' }}>
              {admin?.email}
            </Typography>
          </Box>
          <Tooltip title="Sign out">
            <IconButton size="small" onClick={() => logout()} sx={{ color: 'rgba(244,243,238,.6)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,.08)' } }} aria-label="Sign out">
              <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Box>
  );
}

function OrderBell({ latest }) {
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const [seenAt, setSeenAt] = useState(() => {
    try {
      return localStorage.getItem(SEEN_KEY) ?? new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  });
  const unread = latest.filter((o) => o.createdAt > seenAt).length;
  const open = (e) => {
    setAnchor(e.currentTarget);
    const now = new Date().toISOString();
    setSeenAt(now);
    try {
      localStorage.setItem(SEEN_KEY, now);
    } catch {
      // A private window: the bell just counts from now.
    }
  };
  return (
    <>
      <Tooltip title="Latest orders">
        <IconButton onClick={open} aria-label={`${unread} new orders`}>
          <Badge badgeContent={unread} color="secondary">
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} slotProps={{ paper: { sx: { width: 360, maxWidth: '92vw' } } }}>
        <Stack direction="row" sx={{ px: 1.5, pt: 1, pb: 1.25, alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4">Latest orders</Typography>
          <Typography
            component={Link}
            to="/orders"
            onClick={() => setAnchor(null)}
            sx={{ fontSize: 13, fontWeight: 700, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            All orders
          </Typography>
        </Stack>
        {latest.length === 0 && (
          <Typography color="text.secondary" sx={{ px: 1.5, py: 2, fontSize: 14 }}>
            No orders yet.
          </Typography>
        )}
        {latest.slice(0, 8).map((o) => (
          <MenuItem
            key={o.id}
            onClick={() => {
              setAnchor(null);
              navigate(`/orders/${o.id}`);
            }}
          >
            <Stack sx={{ width: '100%', py: 0.25 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
                <Typography noWrap sx={{ fontWeight: 750, fontSize: 14 }}>
                  {o.name}
                </Typography>
                <Typography className="tabular" sx={{ fontWeight: 750, fontSize: 14 }}>
                  {money(o.total)}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {o.id} · {o.city} · {ago(o.createdAt)}
              </Typography>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function AccountMenu() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  return (
    <>
      <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Your account" sx={{ p: 0.5 }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: 14, boxShadow: '0 0 0 2px rgba(255,255,255,.9)' }}>{admin?.name?.[0]?.toUpperCase() ?? 'A'}</Avatar>
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} slotProps={{ paper: { sx: { minWidth: 240 } } }}>
        <Box sx={{ px: 1.5, py: 1 }}>
          <Typography sx={{ fontWeight: 750 }}>{admin?.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {admin?.email}
          </Typography>
        </Box>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => {
            setAnchor(null);
            navigate('/account');
          }}
        >
          <ListItemIcon>
            <LockOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Change password
        </MenuItem>
        <MenuItem onClick={() => logout()}>
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </>
  );
}

function SearchButton({ onOpen, compact }) {
  const mac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform);
  if (compact) {
    return (
      <IconButton onClick={onOpen} aria-label="Search">
        <SearchIcon />
      </IconButton>
    );
  }
  return (
    <ButtonBase
      onClick={onOpen}
      sx={{
        gap: 1,
        height: 38,
        width: { md: 280, lg: 340 },
        px: 1.5,
        borderRadius: `${radius.sm}px`,
        justifyContent: 'flex-start',
        color: 'text.secondary',
        fontSize: 14,
        ...glass.well,
        transition: `background-color ${motion.base} ${motion.ease}`,
        '&:hover': { backgroundColor: 'rgba(255,255,255,.8)' },
      }}
    >
      <SearchIcon sx={{ fontSize: 19 }} />
      <Box component="span" sx={{ flex: 1, textAlign: 'left' }}>
        Search pages, orders, products…
      </Box>
      <Box component="kbd" sx={{ fontFamily: font.body, fontSize: 11.5, fontWeight: 800, px: 0.75, py: 0.25, borderRadius: 1, border: `1px solid ${color.lineStrong}`, bgcolor: 'rgba(255,255,255,.7)' }}>
        {mac ? '⌘K' : 'Ctrl K'}
      </Box>
    </ButtonBase>
  );
}

export function Layout() {
  const desktop = useMediaQuery('(min-width:1000px)');
  const wide = useMediaQuery('(min-width:760px)');
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const location = useLocation();
  const { counts, latest } = useLiveCounts();
  const current = NAV_ITEMS.find((i) => (i.path === '/' ? location.pathname === '/' : location.pathname.startsWith(i.path)));
  const close = useCallback(() => setOpen(false), []);

  // Ctrl+K / ⌘K opens the quick search from anywhere.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearching(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Box sx={{ minHeight: '100dvh' }}>
      {desktop ? (
        <Box sx={{ position: 'fixed', top: GAP, left: GAP, bottom: GAP, width: SIDEBAR, zIndex: 1200, ...glass.dark, borderRadius: `${radius.xl}px`, overflow: 'hidden' }}>
          <Sidebar counts={counts} />
        </Box>
      ) : (
        <Drawer open={open} onClose={close} slotProps={{ paper: { sx: { m: `${GAP}px`, height: `calc(100% - ${GAP * 2}px)`, width: SIDEBAR, ...glass.dark, borderRadius: `${radius.xl}px` } } }}>
          <Sidebar counts={counts} onNavigate={close} />
        </Drawer>
      )}

      <Box sx={{ ml: desktop ? `${SIDEBAR + GAP * 2}px` : 0, minWidth: 0 }}>
        {/* Top bar */}
        <Box sx={{ position: 'sticky', top: GAP, zIndex: 1100, pl: desktop ? 0 : 1.5, pr: 1.5, pt: `${GAP}px` }}>
          <Stack direction="row" spacing={1} sx={{ ...glass.raised, borderRadius: `${radius.lg}px`, height: 60, px: { xs: 1, sm: 1.5 }, alignItems: 'center', maxWidth: 1320 + 48, mx: 'auto' }}>
            {!desktop && (
              <IconButton onClick={() => setOpen(true)} aria-label="Open menu">
                <MenuIcon />
              </IconButton>
            )}
            <Stack direction="row" spacing={0.5} sx={{ flex: 1, minWidth: 0, alignItems: 'center', pl: desktop ? 1 : 0 }}>
              {current?.group && wide && (
                <>
                  <Typography sx={{ color: 'text.secondary', fontSize: 14, fontWeight: 600 }}>{current.group}</Typography>
                  <ChevronRightIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                </>
              )}
              <Typography noWrap sx={{ fontWeight: 800, fontSize: 15 }}>
                {current?.label ?? (location.pathname === '/account' ? 'Your account' : 'Zauq Admin')}
              </Typography>
            </Stack>
            <SearchButton onOpen={() => setSearching(true)} compact={!wide} />
            <OrderBell latest={latest} />
            <AccountMenu />
          </Stack>
        </Box>

        <Box component="main" sx={{ pl: desktop ? 0 : { xs: 2, sm: 3 }, pr: desktop ? 1.5 : { xs: 2, sm: 3 }, pt: { xs: 3, md: 3.5 }, pb: 8 }}>
          <Box key={location.pathname} sx={{ maxWidth: 1320, mx: 'auto', px: desktop ? 3 : 0, animation: `${pageIn} ${motion.slow} ${motion.ease} both` }}>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </Box>
        </Box>
      </Box>

      <CommandPalette open={searching} onClose={() => setSearching(false)} />
    </Box>
  );
}
