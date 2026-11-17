import { useId, useRef, useState } from 'react';
import { FilterDrawer, FilterTab } from '@/components/common';
import { Section, SectionHeader } from '@/components/ui';
import { ProductGrid, ShopFilters, useProducts } from '@/features/products';

/**
 * A fresh random pick of pieces on every visit. A Filters tab slides out from
 * the left edge while the pieces are on screen and opens a drawer to narrow
 * them to one collection.
 * @param {{ collections: import('@/services/productsApi').Collection[] | null }} props
 */
export function FeaturedProducts({ collections }) {
  const headingId = useId();
  const listRef = useRef(null);
  const [active, setActive] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { status, data, error, reload } = useProducts({ collection: active || undefined, sort: 'random', limit: 8 });
  const activeName = collections?.find((collection) => collection.slug === active)?.name;

  return (
    <Section aria-labelledby={headingId}>
      <SectionHeader
        id={headingId}
        title={activeName ? `Featured · ${activeName}` : 'Featured pieces'}
        description="A fresh pick from our collections on every visit"
      />
      <div ref={listRef}>
        <ProductGrid status={status} products={data?.items} error={error} onRetry={reload} placeholderCount={8} />
      </div>

      <FilterTab target={listRef} onClick={() => setFiltersOpen(true)} expanded={filtersOpen} count={active ? 1 : 0} />
      <FilterDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        applyLabel={activeName ? `Show ${activeName}` : 'Show all pieces'}
        onClear={active ? () => setActive('') : undefined}
      >
        {collections && <ShopFilters collections={collections} selected={active ? [active] : []} onToggle={setActive} single />}
      </FilterDrawer>
    </Section>
  );
}
