import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import styles from './ShopFilters.module.css';

/**
 * Collection checkboxes plus a custom-frame prompt.
 * @param {{
 *   collections: import('@/services/productsApi').Collection[],
 *   selected: string[],
 *   onToggle: (slug: string) => void,
 *   startingPrice?: string,
 * }} props
 */
export function ShopFilters({ collections, selected, onToggle, startingPrice }) {
  return (
    <aside aria-label="Filters" className={styles.aside}>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Category</legend>
        {collections.map((collection) => (
          <label key={collection.slug} className={styles.option}>
            <input type="checkbox" checked={selected.includes(collection.slug)} onChange={() => onToggle(collection.slug)} className={styles.checkbox} />
            {collection.name}
            <span className={styles.count}>{collection.productCount}</span>
          </label>
        ))}
      </fieldset>

      <div className={styles.note}>
        <strong>Every piece, every size</strong>
        <p>All artworks come in five sizes from 8 × 10 to 24 × 36 in, in a black frame, ready to hang.</p>
      </div>

      <div className={styles.promo}>
        <strong className={styles.promoTitle}>Have your own photo?</strong>
        <p className={styles.promoText}>Frame it{startingPrice ? ` from ${startingPrice}` : ''} with a live preview.</p>
        <Button to={ROUTES.customFrames} variant="light" size="sm">
          Upload a photo
        </Button>
      </div>
    </aside>
  );
}
