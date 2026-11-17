import { Link } from 'react-router';
import { UploadIcon } from '@/components/icons';
import { collectionPath, ROUTES } from '@/config/routes';
import { cn } from '@/utils/cn';
import styles from './SalonWall.module.css';

/**
 * The five categories, hung salon-style left to right. `size` sets the frame,
 * `drop` how much lower than the tallest it hangs, `tilt` its angle at rest.
 * `phone` places it on small screens: Custom on top, two below, the rest hidden.
 * Collections take their name and piece count from the API when it has loaded.
 */
const WALL = [
  { key: 'islamic-calligraphy', name: 'Islamic Calligraphy', image: '/images/products/tawakkul-sabr-shukr-flat.jpg', size: 'md', drop: 40, tilt: -2, phone: 'right' },
  { key: 'modern-minimal', name: 'Modern & Minimal', image: '/images/hero/sunset-peaks.jpg', size: 'md', drop: 14, tilt: 1.2, phone: 'hidden' },
  { key: 'custom', name: 'Custom Frames', to: ROUTES.customFrames, meta: 'Your photo, framed', size: 'lg', drop: 0, tilt: 0, phone: 'top' },
  { key: 'art-culture', name: 'Art & Culture', image: '/images/hero/vinyl-dance.jpg', size: 'md', drop: 20, tilt: -1, phone: 'left' },
  { key: 'heritage-pakistan', name: 'Heritage Pakistan', image: '/images/products/badshahi-mosque-flat.jpg', size: 'md', drop: 44, tilt: 2, phone: 'hidden' },
];

const pieceCount = (count) => (count > 0 ? `${count} ${count === 1 ? 'piece' : 'pieces'}` : 'Coming soon');

/**
 * Category frames linking to each collection (and to custom frames); each straightens on hover.
 * @param {{ collections?: import('@/services/productsApi').Collection[] | null }} props
 */
export function SalonWall({ collections }) {
  const items = WALL.map((item) => {
    if (item.to) return item;
    const collection = collections?.find((entry) => entry.slug === item.key);
    return {
      ...item,
      to: collectionPath(item.key),
      name: collection?.name ?? item.name,
      meta: collection ? pieceCount(collection.productCount) : '',
    };
  });

  return (
    <ul className={styles.wall} aria-label="Shop by category">
      {items.map((item, index) => (
        <li
          key={item.key}
          className={cn(styles.piece, styles[item.size], styles[`phone-${item.phone}`])}
          style={{ '--drop': `${item.drop}px`, '--tilt': `${item.tilt}deg`, '--reveal-delay': `${300 + index * 90}ms` }}
          data-reveal="fade-down"
        >
          <Link to={item.to} className={styles.link}>
            <span className={styles.frame}>
              {item.image ? (
                <img src={item.image} alt="" className={styles.art} />
              ) : (
                <span className={cn(styles.art, styles.yourPhoto)}>
                  <UploadIcon size={30} />
                  Your photo here
                  <span className={styles.yourPhotoHint}>Upload · preview · order</span>
                </span>
              )}
            </span>
            <span className={styles.caption}>
              <span className={styles.name}>{item.name}</span>
              <span className={styles.meta}>{item.meta}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
