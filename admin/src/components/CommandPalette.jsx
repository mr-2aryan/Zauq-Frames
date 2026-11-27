import AddIcon from '@mui/icons-material/Add';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { Box, ButtonBase, Dialog, InputBase, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { color, font, motion, radius } from '../design/tokens.js';
import { api } from '../lib/api.js';
import { NAV_ITEMS } from '../nav.js';

const EXTRA = [
  { path: '/products/new', label: 'Add a product', group: 'Actions', icon: AddIcon, keywords: 'new create piece' },
  { path: '/account', label: 'Change password', group: 'Actions', icon: LockOutlinedIcon, keywords: 'account password security' },
];

const matches = (text, q) => text.toLowerCase().includes(q);

/** Quick search (Ctrl+K): jump to a page, a product, or orders matching what's typed. */
export function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const [products, setProducts] = useState(null);
  const listRef = useRef(null);

  // Products are loaded the first time the search opens.
  useEffect(() => {
    if (!open || products) return;
    api('/products')
      .then((d) => setProducts(d.items))
      .catch(() => setProducts([]));
  }, [open, products]);

  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
    }
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const pages = [...NAV_ITEMS, ...EXTRA].filter((item) => !term || matches(`${item.label} ${item.group} ${item.keywords ?? ''}`, term));
    const items = pages.map((item) => ({ key: item.path, label: item.label, hint: item.group, icon: item.icon, go: item.path }));
    if (term) {
      for (const p of (products ?? []).filter((p) => matches(`${p.name} ${p.slug} ${p.collectionName ?? ''}`, term)).slice(0, 6)) {
        items.push({ key: `p-${p.id}`, label: p.name, hint: p.collectionName ?? 'Product', icon: Inventory2OutlinedIcon, go: `/products/${p.id}`, image: p.cardImage || p.images?.[0] });
      }
      items.push({ key: 'orders', label: `Orders matching “${q.trim()}”`, hint: 'Order no., name, phone or city', icon: ReceiptLongOutlinedIcon, go: `/orders?q=${encodeURIComponent(q.trim())}` });
    }
    return items;
  }, [q, products]);

  useEffect(() => setActive(0), [q]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const choose = (item) => {
    if (!item) return;
    onClose();
    navigate(item.go);
  };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(results[active]);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      sx={{ '& .MuiDialog-container': { alignItems: 'flex-start' } }}
      slotProps={{ paper: { sx: { width: 620, maxWidth: 'calc(100% - 24px)', mt: { xs: 2, sm: '12vh' }, mx: 1.5, overflow: 'hidden' } } }}
    >
      <Stack direction="row" spacing={1.25} sx={{ px: 2.25, height: 60, alignItems: 'center', borderBottom: `1px solid ${color.line}` }}>
        <SearchIcon sx={{ color: 'text.secondary' }} />
        <InputBase
          autoFocus
          fullWidth
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search pages, products, orders…"
          inputProps={{ 'aria-label': 'Search', role: 'combobox', 'aria-expanded': true, 'aria-controls': 'command-results' }}
          sx={{ fontSize: 17, fontWeight: 600 }}
        />
        <Box component="kbd" sx={{ fontFamily: font.body, fontSize: 11, fontWeight: 800, px: 0.75, py: 0.25, borderRadius: 1, border: `1px solid ${color.lineStrong}`, color: 'text.secondary' }}>
          Esc
        </Box>
      </Stack>
      <Box ref={listRef} id="command-results" role="listbox" sx={{ maxHeight: '52vh', overflowY: 'auto', p: 1 }}>
        {results.length === 0 && (
          <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
            Nothing matches “{q}”.
          </Typography>
        )}
        {results.map((item, index) => {
          const Icon = item.icon;
          const selected = index === active;
          return (
            <ButtonBase
              key={item.key}
              data-index={index}
              role="option"
              aria-selected={selected}
              onMouseMove={() => setActive(index)}
              onClick={() => choose(item)}
              sx={{
                width: '100%',
                justifyContent: 'flex-start',
                gap: 1.5,
                px: 1.25,
                py: 1,
                borderRadius: `${radius.sm}px`,
                textAlign: 'left',
                transition: `background-color ${motion.fast} ${motion.ease}`,
                bgcolor: selected ? 'rgba(62,74,31,.09)' : 'transparent',
              }}
            >
              {item.image ? (
                <Box component="img" src={item.image} alt="" sx={{ width: 32, height: 40, objectFit: 'cover', borderRadius: '3px', border: '2px solid #17190f', flex: 'none' }} />
              ) : (
                <Box sx={{ width: 32, height: 32, borderRadius: `${radius.xs}px`, display: 'grid', placeItems: 'center', bgcolor: selected ? color.olive700 : 'rgba(255,255,255,.7)', color: selected ? '#fff' : 'text.secondary', border: `1px solid ${color.line}`, flex: 'none', transition: `all ${motion.fast} ${motion.ease}` }}>
                  <Icon sx={{ fontSize: 18 }} />
                </Box>
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontWeight: 700, fontSize: 14.5 }}>
                  {item.label}
                </Typography>
                <Typography noWrap variant="caption" color="text.secondary">
                  {item.hint}
                </Typography>
              </Box>
              {selected && <KeyboardReturnIcon sx={{ fontSize: 17, color: 'text.secondary' }} />}
            </ButtonBase>
          );
        })}
      </Box>
    </Dialog>
  );
}
