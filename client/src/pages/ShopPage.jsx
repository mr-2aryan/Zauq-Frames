import { useId, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { FilterDrawer, FilterTab, Pagination } from '@/components/common';
import { CloseIcon } from '@/components/icons';
import { Button, Container, StatusMessage } from '@/components/ui';
import { ROUTES, shopPath } from '@/config/routes';
import { SITE } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { ProductGrid, ShopFaq, ShopFilters, ShopHero, useCollections, useProducts } from '@/features/products';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/formatPrice';
import styles from './ShopPage.module.css';

/** `label` is shown on the toggle; `title` is read out, shown on hover and used in the filter drawer. */
const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured', title: 'Featured first' },
  { value: 'name-asc', label: 'A–Z', title: 'Name, A to Z' },
  { value: 'name-desc', label: 'Z–A', title: 'Name, Z to A' },
];

/** Three rows of four. */
const PAGE_SIZE = 12;

/** /shop and /collections/:collection — filterable, paged product listing. */
export default function ShopPage() {
  const headingId = useId();
  const listHeadingId = useId();
  const sortId = useId();
  const navigate = useNavigate();
  const location = useLocation();
  const { collection: routeCollection } = useParams();
  const [searchParams] = useSearchParams();
  const { catalog } = useCatalog();
  const resultsRef = useRef(null);
  // Kept open across filter changes (which may move from a collection URL to /shop).
  const [filtersOpen, setFiltersOpen] = useState(() => Boolean(location.state?.filtersOpen));

  const q = searchParams.get('q') ?? '';
  const sort = searchParams.get('sort') ?? 'featured';
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const selected = routeCollection ? [routeCollection] : (searchParams.get('category') ?? '').split(',').filter(Boolean);

  const collectionsQuery = useCollections();
  const productsQuery = useProducts({ collection: selected.join(',') || undefined, q: q || undefined, sort, limit: PAGE_SIZE, page });

  const collections = collectionsQuery.data ?? [];
  const single = selected.length === 1 ? collections.find((collection) => collection.slug === selected[0]) : null;
  const startingPrice = catalog ? formatPrice(Math.min(...catalog.sizes.map((size) => size.salePrice)), catalog.currency) : undefined;

  // Filter and sort changes go back to page 1 and keep the scroll position (and the drawer) where they are.
  const go = (next) =>
    navigate(shopPath({ q, categories: selected, sort, ...next }), { preventScrollReset: true, state: { filtersOpen: next.keepFiltersOpen ?? filtersOpen } });
  const toggleCategory = (slug) => go({ categories: selected.includes(slug) ? selected.filter((item) => item !== slug) : [...selected, slug] });
  const clearAll = () => navigate(ROUTES.shop, { preventScrollReset: true, state: { filtersOpen } });
  const goToPage = (next) => {
    go({ page: next, keepFiltersOpen: false });
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const title = q ? `Results for “${q}”` : single ? single.name : 'Shop all frames';
  // The hero writes its own line for the whole shop; collections and searches get theirs.
  const description = q ? 'Pieces matching your search. Every one comes framed, in six sizes.' : single?.description;
  const { total, pages = 1, page: shownPage = page, items } = productsQuery.data ?? {};
  const first = (shownPage - 1) * PAGE_SIZE + 1;
  const last = Math.min(shownPage * PAGE_SIZE, total ?? 0);
  const notFound = productsQuery.status === 'error' && productsQuery.error?.status === 404;
  const activeCount = selected.length + (sort !== 'featured' ? 1 : 0);

  return (
    <>
      <title>{`${title} | ${SITE.name}`}</title>
      <ShopHero
        headingId={headingId}
        title={title}
        total={total}
        description={description}
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Shop', to: ROUTES.shop }, ...(single ? [{ label: single.name }] : [])]}
        collections={collections}
        activeSlug={single?.slug ?? null}
        searching={Boolean(q)}
      />
      <Container className={styles.page}>
        {/* Results toolbar: a heading and the count on the left, the sort toggle (real radio buttons) on the right.
            Filters open from the tab on the left edge. */}
        <div className={styles.header}>
          <div className={styles.lead}>
            <h2 id={listHeadingId} className={styles.listTitle}>
              {q ? 'Matching pieces' : single ? single.name : 'All pieces'}
            </h2>
            <p className={styles.showing}>
              {typeof total !== 'number'
                ? 'Loading pieces…'
                : total > PAGE_SIZE
                  ? `Showing ${first}–${last} of ${total} pieces`
                  : `Showing ${total} ${total === 1 ? 'piece' : 'pieces'}`}
            </p>
          </div>
          <div className={styles.sort}>
            <span id={sortId} className={styles.sortLabel}>
              Sort by
            </span>
            <div role="radiogroup" aria-labelledby={sortId} className={styles.sortOptions}>
              {SORT_OPTIONS.map((option) => (
                <label key={option.value} title={option.title} className={cn(styles.sortOption, sort === option.value && styles.sortActive)}>
                  <input
                    type="radio"
                    name={`${sortId}-sort`}
                    value={option.value}
                    checked={sort === option.value}
                    onChange={() => go({ sort: option.value })}
                    aria-label={option.title}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <section ref={resultsRef} aria-labelledby={listHeadingId} className={styles.results}>
          {(selected.length > 0 || q) && (
            <div className={styles.active}>
              <span className={styles.activeLabel}>Active filters:</span>
              {selected.map((slug) => (
                <button key={slug} type="button" className={styles.activeChip} onClick={() => toggleCategory(slug)}>
                  {collections.find((collection) => collection.slug === slug)?.name ?? slug}
                  <CloseIcon size={14} />
                  <span className="sr-only">(remove)</span>
                </button>
              ))}
              {q && (
                <button type="button" className={styles.activeChip} onClick={() => go({ q: '' })}>
                  “{q}”
                  <CloseIcon size={14} />
                  <span className="sr-only">(remove search)</span>
                </button>
              )}
              <button type="button" className={styles.clear} onClick={clearAll}>
                Clear all
              </button>
            </div>
          )}

          {notFound ? (
            <StatusMessage status="empty" title="Collection not found" message={productsQuery.error.message} action={<Button to={ROUTES.shop} size="sm">Browse all frames</Button>} />
          ) : (
            <ProductGrid
              status={productsQuery.status}
              products={items}
              error={productsQuery.error}
              onRetry={productsQuery.reload}
              placeholderCount={PAGE_SIZE}
              empty={
                <StatusMessage
                  status="empty"
                  title="No pieces match"
                  message="Try a different search or clear your filters."
                  action={
                    <Button size="sm" onClick={clearAll}>
                      Clear filters
                    </Button>
                  }
                />
              }
            />
          )}

          <Pagination page={shownPage} pages={pages} onChange={goToPage} label="Shop pages" />
        </section>
      </Container>

      {catalog && <ShopFaq catalog={catalog} />}

      <FilterTab target={resultsRef} onClick={() => setFiltersOpen(true)} expanded={filtersOpen} count={activeCount} />
      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        applyLabel={typeof total === 'number' ? `Show ${total} ${total === 1 ? 'piece' : 'pieces'}` : 'Show pieces'}
        onClear={activeCount > 0 ? clearAll : undefined}
      >
        {collectionsQuery.status === 'success' && (
          <ShopFilters
            collections={collections}
            selected={selected}
            onToggle={toggleCategory}
            sortOptions={SORT_OPTIONS}
            sort={sort}
            onSort={(value) => go({ sort: value })}
            startingPrice={startingPrice}
          />
        )}
      </FilterDrawer>
    </>
  );
}
