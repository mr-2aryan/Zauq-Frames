import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { thumbOf } from '../components/ImageUploader.jsx';
import { EmptyState, Framed, Loader, PageHeader, Section } from '../components/ui.jsx';
import { api } from '../lib/api.js';
import { SHOP_URL } from '../lib/format.js';
import { useData, useDebounced, useUi } from '../lib/hooks.jsx';

const STATUSES = [
  ['all', 'All'],
  ['active', 'Live'],
  ['draft', 'Draft'],
];

const shopLink = (path) => `${SHOP_URL.replace(/\/$/, '')}${path}`;

export default function ProductsPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { notify, confirm } = useUi();
  const products = useData('/products');
  const collections = useData('/collections');
  const { setData, reload } = products;

  const [search, setSearch] = useState('');
  const query = useDebounced(search.trim().toLowerCase(), 200);
  const [collection, setCollection] = useState(() => params.get('collection') ?? 'all');
  const [status, setStatus] = useState('all');
  const [busy, setBusy] = useState(null);

  // ---------- Reordering: saved shortly after the last move, one request at a time ----------
  const pending = useRef(null);
  const timer = useRef(null);
  const chain = useRef(Promise.resolve());
  const [savingOrder, setSavingOrder] = useState(false);

  const flushOrder = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = null;
    const ids = pending.current;
    pending.current = null;
    if (!ids) return;
    setSavingOrder(true);
    chain.current = chain.current.then(async () => {
      try {
        await api('/products-order', { method: 'PUT', body: { ids } });
        notify('New order saved. The shop shows products in this order.');
      } catch (error) {
        notify(error.message, 'error');
        reload();
      } finally {
        setSavingOrder(false);
      }
    });
  }, [notify, reload]);

  // Leaving the page saves a move that is still waiting.
  useEffect(() => () => pending.current && flushOrder(), [flushOrder]);

  const all = useMemo(() => products.data?.items ?? [], [products.data]);
  const filtering = Boolean(query) || collection !== 'all' || status !== 'all';
  const visible = useMemo(
    () =>
      all.filter(
        (p) =>
          (!query || p.name.toLowerCase().includes(query) || p.slug.includes(query)) &&
          (collection === 'all' || p.collection === collection) &&
          (status === 'all' || p.status === status),
      ),
    [all, query, collection, status],
  );
  const live = all.filter((p) => p.status === 'active').length;
  const drafts = all.length - live;

  const move = (index, delta) => {
    const to = index + delta;
    if (to < 0 || to >= all.length) return;
    const items = [...all];
    [items[index], items[to]] = [items[to], items[index]];
    setData((d) => ({ ...d, items }));
    pending.current = items.map((p) => p.id);
    clearTimeout(timer.current);
    timer.current = setTimeout(flushOrder, 700);
  };

  const duplicate = async (product) => {
    setBusy(product.id);
    try {
      const data = await api(`/products/${product.id}/duplicate`, { method: 'POST' });
      notify(`Copy made as a draft: “${data.product.name}”.`);
      navigate(`/products/${data.product.id}`);
    } catch (error) {
      notify(error.message, 'error');
      setBusy(null);
    }
  };

  const remove = async (product) => {
    const ok = await confirm({
      title: `Delete “${product.name}”?`,
      text: 'It is removed from the shop for good, together with its photos and its private print file. This cannot be undone. To hide it for a while, make it a draft instead.',
      danger: true,
      confirmLabel: 'Delete product',
    });
    if (!ok) return;
    setBusy(product.id);
    try {
      await api(`/products/${product.id}`, { method: 'DELETE' });
      setData((d) => ({ ...d, items: d.items.filter((p) => p.id !== product.id) }));
      notify('Product deleted.');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(null);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCollection('all');
    setStatus('all');
  };

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={products.data ? `${live} live, ${drafts} draft${drafts === 1 ? '' : 's'}` : 'Every piece in the shop, including drafts.'}
        actions={
          <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/products/new">
            Add product
          </Button>
        }
      />

      <Section contentSx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 220px auto' }, alignItems: 'center' }}>
          <TextField
            placeholder="Search by name or web address"
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
              htmlInput: { 'aria-label': 'Search products' },
            }}
          />
          <TextField select label="Collection" value={collection} onChange={(e) => setCollection(e.target.value)}>
            <MenuItem value="all">All collections</MenuItem>
            {(collections.data?.items ?? []).map((c) => (
              <MenuItem key={c.id} value={c.slug}>
                {c.name}
              </MenuItem>
            ))}
            {collection !== 'all' && !collections.data?.items?.some((c) => c.slug === collection) && <MenuItem value={collection}>{collection}</MenuItem>}
          </TextField>
          <ToggleButtonGroup size="small" exclusive value={status} onChange={(_e, value) => value && setStatus(value)} aria-label="Status" sx={{ '& .MuiToggleButton-root': { px: 2, fontWeight: 700, textTransform: 'none' } }}>
            {STATUSES.map(([value, label]) => (
              <ToggleButton key={value} value={value}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ '& > .MuiAlert-root': { m: 2 } }}>
        <Loader query={products} label="Loading products…">
          {() =>
            all.length === 0 ? (
              <EmptyState
                title="No products yet"
                text="Add your first piece: its photos, description and print file."
                action={
                  <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/products/new" sx={{ mt: 1 }}>
                    Add product
                  </Button>
                }
              />
            ) : visible.length === 0 ? (
              <EmptyState
                title="No products match"
                text="Try another search or filter."
                action={
                  <Button onClick={clearFilters} sx={{ mt: 1 }}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: { xs: 2, sm: 2.5 }, pb: 1 }}>
                  {filtering ? (
                    <>
                      Showing {visible.length} of {all.length}. To change the order products appear in the shop,{' '}
                      <MuiLink component="button" type="button" variant="caption" onClick={clearFilters} sx={{ verticalAlign: 'baseline', fontWeight: 700 }}>
                        clear the search and filters
                      </MuiLink>
                      .
                    </>
                  ) : savingOrder ? (
                    'Saving the new order…'
                  ) : (
                    'Use the arrows to change the order products appear in the shop.'
                  )}
                </Typography>
                <Box sx={{ overflowX: 'auto', borderTop: '1px solid', borderColor: 'divider' }}>
                  <Table size="small" sx={{ minWidth: 820, '& td, & th': { whiteSpace: 'nowrap' } }}>
                    <TableHead>
                      <TableRow>
                        {!filtering && <TableCell sx={{ width: 72 }}>Order</TableCell>}
                        <TableCell>Product</TableCell>
                        <TableCell>Collection</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Featured</TableCell>
                        <TableCell>Badge</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visible.map((p, index) => {
                        const isLive = p.status === 'active';
                        return (
                          <TableRow key={p.id} hover sx={{ opacity: busy === p.id ? 0.5 : 1 }}>
                            {!filtering && (
                              <TableCell>
                                <Stack direction="row">
                                  <Tooltip title="Move up">
                                    <span>
                                      <IconButton size="small" aria-label={`Move ${p.name} up`} disabled={index === 0} onClick={() => move(index, -1)}>
                                        <ArrowUpwardIcon fontSize="inherit" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                  <Tooltip title="Move down">
                                    <span>
                                      <IconButton size="small" aria-label={`Move ${p.name} down`} disabled={index === visible.length - 1} onClick={() => move(index, 1)}>
                                        <ArrowDownwardIcon fontSize="inherit" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </Stack>
                              </TableCell>
                            )}
                            <TableCell>
                              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', py: 0.5 }}>
                                <Framed src={thumbOf(p.cardImage ?? p.images?.[0])} size={40} landscape={p.orientation === 'landscape'} />
                                <Box sx={{ minWidth: 0 }}>
                                  <MuiLink component={Link} to={`/products/${p.id}`} underline="hover" color="text.primary" sx={{ fontWeight: 800, display: 'block', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {p.name}
                                  </MuiLink>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    /products/{p.slug}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>{p.collectionName}</TableCell>
                            <TableCell>
                              <Chip size="small" label={isLive ? 'Live' : 'Draft'} color={isLive ? 'success' : 'default'} variant={isLive ? 'filled' : 'outlined'} />
                            </TableCell>
                            <TableCell align="center">
                              {p.featured ? (
                                <Tooltip title="Featured">
                                  <StarIcon fontSize="small" sx={{ color: 'warning.main', verticalAlign: 'middle' }} />
                                </Tooltip>
                              ) : (
                                <StarBorderIcon fontSize="small" sx={{ color: 'divider', verticalAlign: 'middle' }} aria-label="Not featured" />
                              )}
                            </TableCell>
                            <TableCell>{p.badge ? <Chip size="small" label={p.badge} color="secondary" variant="outlined" /> : <Typography variant="body2" color="text.disabled">—</Typography>}</TableCell>
                            <TableCell align="right">
                              <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                                <Tooltip title="Edit">
                                  <IconButton size="small" component={Link} to={`/products/${p.id}`} aria-label={`Edit ${p.name}`}>
                                    <EditOutlinedIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Duplicate (makes a draft copy)">
                                  <span>
                                    <IconButton size="small" aria-label={`Duplicate ${p.name}`} disabled={Boolean(busy)} onClick={() => duplicate(p)}>
                                      <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title={isLive ? 'View in the shop' : 'Drafts are not in the shop'}>
                                  <span>
                                    <IconButton size="small" aria-label={`View ${p.name} in the shop`} disabled={!isLive} component="a" href={shopLink(`/products/${p.slug}`)} target="_blank" rel="noopener">
                                      <OpenInNewIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <span>
                                    <IconButton size="small" aria-label={`Delete ${p.name}`} disabled={Boolean(busy)} onClick={() => remove(p)}>
                                      <DeleteOutlinedIcon fontSize="small" color={busy ? 'disabled' : 'error'} />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              </>
            )
          }
        </Loader>
        </Box>
      </Section>
    </>
  );
}
