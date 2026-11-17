import { useId } from 'react';
import { Link } from 'react-router';
import { ArrowRightIcon, ImageIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { cn } from '@/utils/cn';
import styles from './ShopFilters.module.css';

/**
 * The options inside the filter drawer: collections as a clean list (tick
 * several, or pick one with `single`, which adds "All pieces"), an optional
 * sort order as a segmented pill, and a slim custom-frame link.
 * @param {{
 *   collections: import('@/services/productsApi').Collection[],
 *   selected: string[],
 *   onToggle: (slug: string) => void,
 *   single?: boolean,
 *   sortOptions?: Array<{ value: string, label: string, title: string }>,
 *   sort?: string,
 *   onSort?: (value: string) => void,
 *   startingPrice?: string,
 * }} props
 */
export function ShopFilters({ collections, selected, onToggle, single = false, sortOptions, sort, onSort, startingPrice }) {
  const name = useId();
  const total = collections.reduce((sum, collection) => sum + collection.productCount, 0);
  const options = single ? [{ slug: '', name: 'All pieces', productCount: total }, ...collections] : collections;
  const isChecked = (slug) => (single ? (selected[0] ?? '') === slug : selected.includes(slug));

  return (
    <div className={styles.filters}>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Category</legend>
        <div className={styles.list}>
          {options.map((collection) => {
            const checked = isChecked(collection.slug);
            const empty = collection.productCount === 0;
            return (
              <label key={collection.slug || 'all'} className={cn(styles.row, checked && styles.checked, empty && styles.empty)}>
                <input
                  type={single ? 'radio' : 'checkbox'}
                  name={single ? `${name}-category` : undefined}
                  checked={checked}
                  disabled={empty}
                  onChange={() => onToggle(collection.slug)}
                  className={cn(styles.input, single && styles.round)}
                />
                <span className={styles.name}>{collection.name}</span>
                <span className={styles.count}>{empty ? 'Soon' : collection.productCount}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {sortOptions && (
        <fieldset className={styles.group}>
          <legend className={styles.legend}>Sort by</legend>
          <div className={styles.segments}>
            {sortOptions.map((option) => (
              <label key={option.value} title={option.title} className={cn(styles.segment, sort === option.value && styles.segmentActive)}>
                <input
                  type="radio"
                  name={`${name}-sort`}
                  checked={sort === option.value}
                  onChange={() => onSort(option.value)}
                  aria-label={option.title}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <Link to={ROUTES.customFrames} className={styles.custom}>
        <span className={styles.customIcon} aria-hidden="true">
          <ImageIcon size={18} />
        </span>
        <span className={styles.customText}>
          <strong>Frame your own photo</strong>
          <span>Every size{startingPrice ? `, from ${startingPrice}` : ''}</span>
        </span>
        <ArrowRightIcon size={16} />
      </Link>
    </div>
  );
}
