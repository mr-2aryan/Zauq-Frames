import { useId, useState } from 'react';
import { Chip, Section, SectionHeader } from '@/components/ui';
import { ProductGrid, useProducts } from '@/features/products';
import styles from './FeaturedProducts.module.css';

/**
 * Featured pieces with collection filter chips.
 * @param {{ collections: import('@/services/productsApi').Collection[] | null }} props
 */
export function FeaturedProducts({ collections }) {
  const headingId = useId();
  const [active, setActive] = useState('');
  const { status, data, error, reload } = useProducts({ collection: active || undefined, sort: 'featured', limit: 8 });

  const chips = [{ slug: '', label: 'All' }, ...(collections ?? []).map((collection) => ({ slug: collection.slug, label: collection.shortName }))];

  return (
    <Section aria-labelledby={headingId}>
      <SectionHeader
        id={headingId}
        title="Featured pieces"
        description="Hand-picked from our collections"
        action={
          <div role="group" aria-label="Filter featured pieces" className={styles.chips}>
            {chips.map((chip) => (
              <Chip key={chip.slug || 'all'} selected={active === chip.slug} onClick={() => setActive(chip.slug)}>
                {chip.label}
              </Chip>
            ))}
          </div>
        }
      />
      <ProductGrid status={status} products={data?.items} error={error} onRetry={reload} placeholderCount={8} />
    </Section>
  );
}
