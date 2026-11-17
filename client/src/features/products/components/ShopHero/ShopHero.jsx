import { Link, NavLink } from 'react-router';
import { ArchIcon, GridIcon, ImageIcon, PaletteIcon, PenNibIcon, ShapesIcon } from '@/components/icons';
import { Breadcrumbs, Container } from '@/components/ui';
import { collectionPath, productPath, ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/formatPrice';
import styles from './ShopHero.module.css';

const art = (slug, name, image = `/images/products/${slug}-flat.jpg`) => ({ slug, name, image });

/**
 * The three pieces fanned out on the right, left to right (the middle one is
 * in front): a mix of the collections for the whole shop and for searches,
 * and each collection's own pieces on its page. Heritage pieces are landscape.
 */
const HERO_SETS = {
  all: [
    art('tawakkul-sabr-shukr', 'Tawakkul · Sabr · Shukr'),
    art('vinyl-dance', 'Vinyl Dance'),
    art('paparazzi', 'Paparazzi'),
  ],
  'islamic-calligraphy': [
    art('uduni-astajib-lakum', 'Ud’uni Astajib Lakum'),
    art('black-and-gold', 'Black & Gold'),
    art('tawakkul-sabr-shukr', 'Tawakkul · Sabr · Shukr'),
  ],
  'modern-minimal': [
    art('flowing-curves', 'Flowing Curves', '/images/hero/flowing-curves.jpg'),
    art('sunset-peaks', 'Sunset Peaks', '/images/hero/sunset-peaks.jpg'),
    art('vinyl-dance', 'Vinyl Dance'),
  ],
  'art-culture': [
    art('weeknd-type', 'Weeknd Type'),
    art('porsche-911-gt3-rs', 'Porsche 911 GT3 RS'),
    art('paparazzi', 'Paparazzi'),
  ],
  'heritage-pakistan': [
    art('hilltop-fort', 'Hilltop Fort'),
    art('badshahi-mosque', 'Badshahi Mosque'),
    art('mountain-fort', 'Mountain Fort'),
  ],
};
const LANDSCAPE_SETS = new Set(['heritage-pakistan']);

/** The icon on each collection's tile; anything new falls back to a picture. */
const COLLECTION_ICONS = {
  'islamic-calligraphy': PenNibIcon,
  'modern-minimal': ShapesIcon,
  'art-culture': PaletteIcon,
  'heritage-pakistan': ArchIcon,
};

const pieceCount = (count) => (count > 0 ? `${count} ${count === 1 ? 'piece' : 'pieces'}` : 'Coming soon');

/**
 * "Collection band": a full-width tint band with the title and piece count,
 * category tiles (icon, name, count) that filter the shop, and
 * three framed pieces fanned out on the right.
 * @param {{
 *   headingId: string,
 *   title: string,
 *   total?: number,
 *   description?: string,
 *   breadcrumbs: Array<{ label: string, to?: string }>,
 *   collections: import('@/services/productsApi').Collection[],
 *   activeSlug?: string | null,
 *   searching?: boolean,
 * }} props
 */
export function ShopHero({ headingId, title, total, description, breadcrumbs, collections, activeSlug, searching = false }) {
  const { catalog } = useCatalog();
  const fromPrice = catalog ? formatPrice(Math.min(...catalog.sizes.map((size) => size.salePrice)), catalog.currency) : null;
  const allCount = collections.reduce((sum, collection) => sum + collection.productCount, 0);
  const tileClass = (active) => cn(styles.tile, active && styles.tileActive);
  const setKey = !searching && activeSlug && HERO_SETS[activeSlug] ? activeSlug : 'all';

  return (
    <section className={styles.band} aria-labelledby={headingId}>
      <Container className={styles.inner}>
        <div className={styles.copy}>
          <Breadcrumbs items={breadcrumbs} />
          <h1 id={headingId} className={styles.title} data-reveal="fade-up">
            {title}
            {typeof total === 'number' && <span className={styles.count}> · {total}</span>}
          </h1>
          <p className={styles.lead} data-reveal="fade-up" style={{ '--reveal-delay': '80ms' }}>
            {description ?? (
              <>
                Calligraphy, modern prints and pop culture — every piece printed, framed by hand and offered in five sizes
                {fromPrice && (
                  <>
                    , from <strong>{fromPrice}</strong>
                  </>
                )}
                .
              </>
            )}
          </p>

          {/* Category tiles: equal widths, an icon, the name and a line of detail. */}
          <nav aria-label="Collections" data-reveal="fade-up" style={{ '--reveal-delay': '160ms' }}>
            <ul className={styles.tiles}>
              <li>
                <NavLink to={ROUTES.shop} end className={({ isActive }) => tileClass(isActive && !searching && !activeSlug)}>
                  <span className={styles.tileIcon}>
                    <GridIcon size={22} />
                  </span>
                  <span className={styles.tileText}>
                    <span className={styles.tileName}>All pieces</span>
                    <span className={styles.tileMeta}>{allCount ? `${allCount} pieces` : 'Every collection'}</span>
                  </span>
                </NavLink>
              </li>
              {collections.map((collection) => {
                const active = collection.slug === activeSlug;
                const Icon = COLLECTION_ICONS[collection.slug] ?? ImageIcon;
                return (
                  <li key={collection.slug}>
                    <Link to={collectionPath(collection.slug)} className={tileClass(active)} aria-current={active ? 'page' : undefined}>
                      <span className={styles.tileIcon}>
                        <Icon size={22} />
                      </span>
                      <span className={styles.tileText}>
                        <span className={styles.tileName}>{collection.shortName ?? collection.name}</span>
                        <span className={styles.tileMeta}>{pieceCount(collection.productCount)}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link to={ROUTES.customFrames} className={tileClass(false)}>
                  <span className={styles.tileIcon}>
                    <ImageIcon size={22} />
                  </span>
                  <span className={styles.tileText}>
                    <span className={styles.tileName}>Custom frames</span>
                    <span className={styles.tileMeta}>Your photo</span>
                  </span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Keyed by set, so a new collection's pieces fade in afresh. */}
        <div key={setKey} className={cn(styles.fan, LANDSCAPE_SETS.has(setKey) && styles.landscape)} data-reveal="fade-left" style={{ '--reveal-delay': '120ms' }}>
          {HERO_SETS[setKey].map((frame, index) => (
            <Link key={frame.slug} to={productPath(frame.slug)} className={cn(styles.frame, styles[`frame${index}`])} aria-label={frame.name}>
              <img src={frame.image} alt="" className={styles.frameImage} />
            </Link>
          ))}
          <p className={styles.offer}>
            {catalog?.promotion.percentOff > 0 && <strong>{catalog.promotion.label}</strong>}
            {catalog && ` · ${formatPrice(catalog.deliveryFee, catalog.currency)} delivery`} · {SITE.leadTime} to your door
          </p>
        </div>
      </Container>
    </section>
  );
}
