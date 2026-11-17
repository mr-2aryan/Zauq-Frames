import { Link } from 'react-router';
import { ArrowRightIcon } from '@/components/icons';
import { Badge, Price } from '@/components/ui';
import { productPath } from '@/config/routes';
import styles from './ProductCard.module.css';

/** Whole-percent saving between the list and sale price (0 when there is none). */
const percentOff = (product) => (product.price > product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0);

/**
 * Product tile, "gallery label" style: the framed photo with its tags, then a
 * small caption. "Choose size" slides up over the photo on hover.
 * @param {{ product: import('@/services/productsApi').ProductSummary, headingLevel?: 'h2' | 'h3' }} props
 */
export function ProductCard({ product, headingLevel: Heading = 'h3' }) {
  const saving = percentOff(product);

  return (
    <article className={styles.card}>
      <Link to={productPath(product.slug)} className={styles.link}>
        <div className={styles.media}>
          <img src={product.image} alt="" loading="lazy" className={styles.image} />
          <div className={styles.tags}>
            {product.badge && <Badge>{product.badge}</Badge>}
            {saving > 0 && (
              <Badge tone="sale" className={styles.saleTag}>
                {saving}% off
              </Badge>
            )}
          </div>
          <span className={styles.choose} aria-hidden="true">
            Choose size <ArrowRightIcon size={16} />
          </span>
        </div>
        <div className={styles.body}>
          <span className={styles.collection}>{product.collectionName}</span>
          <Heading className={styles.name}>{product.name}</Heading>
          <Price amount={product.salePrice} listAmount={product.price} currency={product.currency} from />
        </div>
      </Link>
    </article>
  );
}

/** Placeholder with the same footprint as a card. */
export function ProductCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={`${styles.media} ${styles.pulse}`}></div>
      <div className={styles.body}>
        <span className={`${styles.line} ${styles.pulse}`} style={{ width: '40%' }}></span>
        <span className={`${styles.line} ${styles.pulse}`} style={{ width: '75%', height: 18 }}></span>
        <span className={`${styles.line} ${styles.pulse}`} style={{ width: '55%' }}></span>
      </div>
    </div>
  );
}
