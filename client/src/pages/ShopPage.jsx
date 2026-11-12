import { useId } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { CloseIcon } from '@/components/icons';
import { Breadcrumbs, Button, Container, StatusMessage } from '@/components/ui';
import { ROUTES, shopPath } from '@/config/routes';
import { SITE } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { ProductGrid, ShopFilters, useCollections, useProducts } from '@/features/products';
import { formatPrice } from '@/utils/formatPrice';
import styles from './ShopPage.module.css';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

/** /shop and /collections/:collection — filterable product listing. */
export default function ShopPage() {
  const headingId = useId();
  const sortId = useId();
  const navigate = useNavigate();
  const { collection: routeCollection } = useParams();
  const [searchParams] = useSearchParams();
  const { catalog } = useCatalog();

  const q = searchParams.get('q') ?? '';
  const sort = searchParams.get('sort') ?? 'featured';
  const selected = routeCollection ? [routeCollection] : (searchParams.get('category') ?? '').split(',').filter(Boolean);

  const collectionsQuery = useCollections();
  const productsQuery = useProducts({ collection: selected.join(',') || undefined, q: q || undefined, sort });

  const collections = collectionsQuery.data ?? [];
  const single = selected.length === 1 ? collections.find((collection) => collection.slug === selected[0]) : null;
  const startingPrice = catalog ? formatPrice(Math.min(...catalog.sizes.map((size) => size.salePrice)), catalog.currency) : undefined;

  const go = (next) => navigate(shopPath({ q, categories: selected, sort, ...next }));
  const toggleCategory = (slug) => go({ categories: selected.includes(slug) ? selected.filter((item) => item !== slug) : [...selected, slug] });
  const clearAll = () => navigate(ROUTES.shop);

  const title = q ? `Results for “${q}”` : single ? single.name : 'Shop all frames';
  const description = single?.description ?? 'Every piece is printed in high quality, set in a black frame and finished by hand to order.';
  const total = productsQuery.data?.total;
  const notFound = productsQuery.status === 'error' && productsQuery.error?.status === 404;

  return (
    <>
      <title>{`${title} | ${SITE.name}`}</title>
      <Container className={styles.page}>
        <Breadcrumbs items={[{ label: 'Home', to: ROUTES.home }, { label: 'Shop', to: ROUTES.shop }, ...(single ? [{ label: single.name }] : [])]} />

        <div className={styles.header}>
          <div>
            <h1 id={headingId} className={styles.title}>
              {title} {typeof total === 'number' && <span className={styles.count}>{total} {total === 1 ? 'piece' : 'pieces'}</span>}
            </h1>
            <p className={styles.description}>{description}</p>
          </div>
          <div className={styles.sort}>
            <label htmlFor={sortId} className={styles.sortLabel}>
              Sort by
            </label>
            <select id={sortId} value={sort} onChange={(event) => go({ sort: event.target.value })} className={styles.select}>
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.sidebar}>
            {collectionsQuery.status === 'success' && (
              <ShopFilters collections={collections} selected={selected} onToggle={toggleCategory} startingPrice={startingPrice} />
            )}
          </div>

          <section aria-labelledby={headingId} className={styles.results}>
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
                products={productsQuery.data?.items}
                error={productsQuery.error}
                onRetry={productsQuery.reload}
                placeholderCount={6}
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
          </section>
        </div>
      </Container>
    </>
  );
}
