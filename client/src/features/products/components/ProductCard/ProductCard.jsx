import { Link } from 'react-router';
import { Badge, Button, Price } from '@/components/ui';
import { productPath } from '@/config/routes';
import styles from './ProductCard.module.css';

/**
 * Product tile for grids.
 * @param {{ product: import('@/services/productsApi').ProductSummary, headingLevel?: 'h2' | 'h3' }} props
 */
export function ProductCard({ product, headingLevel: Heading = 'h3' }) {
  const href = productPath(product.slug);

  return (
    <article className={styles.card}>
      <Link to={href} className={styles.link}>
        <div className={styles.media}>
          <img src={product.image} alt="" loading="lazy" className={styles.image} />
          {product.badge && <Badge className={styles.badge}>{product.badge}</Badge>}
        </div>
        <div className={styles.body}>
          <span className={styles.collection}>{product.collectionName}</span>
          <Heading className={styles.name}>{product.name}</Heading>
          <Price amount={product.salePrice} listAmount={product.price} currency={product.currency} showSaving />
        </div>
      </Link>
      <Button to={href} variant="outline" size="sm" block className={styles.cta} tabIndex={-1} aria-hidden="true">
        Choose size
      </Button>
    </article>
  );
}

/** Grey placeholder with the same footprint as a card. */
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
