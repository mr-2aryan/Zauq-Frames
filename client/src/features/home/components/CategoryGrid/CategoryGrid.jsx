import { useId } from 'react';
import { Link } from 'react-router';
import { Section, SectionHeader, StatusMessage } from '@/components/ui';
import { collectionPath, ROUTES } from '@/config/routes';
import { useCatalog } from '@/context/catalog/useCatalog';
import { CategoryCard } from '@/features/products';
import { formatPrice } from '@/utils/formatPrice';
import styles from './CategoryGrid.module.css';

/**
 * Collections plus the custom-frame tile.
 * @param {{ collectionsQuery: ReturnType<typeof import('@/features/products').useCollections> }} props
 */
export function CategoryGrid({ collectionsQuery }) {
  const headingId = useId();
  const { catalog } = useCatalog();
  const { status, data: collections, error, reload } = collectionsQuery;
  const startingPrice = catalog ? formatPrice(Math.min(...catalog.sizes.map((size) => size.salePrice)), catalog.currency) : null;

  return (
    <Section aria-labelledby={headingId}>
      <SectionHeader id={headingId} title="Shop by category" action={<Link to={ROUTES.shop} className={styles.link}>See all</Link>} />
      {status === 'error' ? (
        <StatusMessage status="error" message={error?.message} onRetry={reload} />
      ) : (
        <div className={styles.grid} aria-busy={status === 'loading'}>
          {status === 'loading'
            ? [0, 1, 2, 3].map((index) => <div key={index} className={styles.placeholder}></div>)
            : collections.map((collection) => (
                <CategoryCard
                  key={collection.slug}
                  to={collectionPath(collection.slug)}
                  title={collection.name}
                  meta={`${collection.productCount} pieces`}
                  image={collection.image}
                />
              ))}
          {status === 'success' && (
            <CategoryCard
              to={ROUTES.customFrames}
              title="Custom Frames"
              meta={startingPrice ? `Your photo, from ${startingPrice}` : 'Your photo, framed'}
              image="/images/products/vinyl-dance-room.jpg"
            />
          )}
        </div>
      )}
    </Section>
  );
}
