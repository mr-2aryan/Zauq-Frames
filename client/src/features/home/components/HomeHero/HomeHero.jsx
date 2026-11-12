import { useId } from 'react';
import { Link } from 'react-router';
import { ArrowRightIcon, CheckCircleIcon, HangIcon, SparkleIcon, TruckIcon } from '@/components/icons';
import { Badge, Button } from '@/components/ui';
import { productPath, ROUTES } from '@/config/routes';
import { useCatalog } from '@/context/catalog/useCatalog';
import { formatPrice } from '@/utils/formatPrice';
import styles from './HomeHero.module.css';

const FEATURED = { slug: 'sunset-peaks', name: 'Sunset Peaks', thumb: '/images/products/sunset-peaks-room.jpg' };

/** Full-width hero: copy aligned to the page container, photo running to the right edge. */
export function HomeHero() {
  const headingId = useId();
  const { catalog } = useCatalog();
  const productPrice = catalog ? formatPrice(catalog.productPrice.salePrice, catalog.currency) : null;
  const delivery = catalog ? `${formatPrice(catalog.deliveryFee, catalog.currency)} delivery` : 'Nationwide delivery';

  return (
    <section aria-labelledby={headingId} className={styles.hero}>
      <div className={styles.copy}>
        <Badge className={styles.badge}>
          <SparkleIcon size={13} />
          {catalog?.promotion.percentOff ? `New season · ${catalog.promotion.percentOff}% off` : 'New season'}
        </Badge>
        <h1 id={headingId} className={styles.title}>
          Framed wall art, made to order in Pakistan
        </h1>
        <p className={styles.lead}>Islamic calligraphy, modern prints and custom frames — high-quality prints in black frames, ready to hang.</p>
        <div className={styles.actions}>
          <Button to={ROUTES.shop} size="lg">
            Shop the collection <ArrowRightIcon size={18} />
          </Button>
          <Button to={ROUTES.customFrames} variant="secondary" size="lg">
            Upload your photo
          </Button>
        </div>
        <ul className={styles.perks}>
          <li><TruckIcon size={18} /> {delivery}</li>
          <li><HangIcon size={18} /> Ready to hang</li>
          <li><CheckCircleIcon size={18} /> Damage covered</li>
        </ul>
      </div>

      <div className={styles.media}>
        <img src="/images/site/hero-home.jpg" alt="Sunset Peaks print framed in an arched alcove" className={styles.image} />
        <Link to={productPath(FEATURED.slug)} className={styles.floating}>
          <img src={FEATURED.thumb} alt="" className={styles.floatingThumb} />
          <span>
            <span className={styles.floatingName}>{FEATURED.name}</span>
            <span className={styles.floatingMeta}>{productPrice ? `${productPrice} · ` : ''}Shop now →</span>
          </span>
        </Link>
      </div>
    </section>
  );
}
