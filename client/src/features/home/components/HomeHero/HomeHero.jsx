import { useId } from 'react';
import { Link } from 'react-router';
import { ArrowRightIcon } from '@/components/icons';
import { Button, Container } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useCatalog } from '@/context/catalog/useCatalog';
import { cn } from '@/utils/cn';
import { formatSizeLabel } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';
import { SalonWall } from './SalonWall.jsx';
import styles from './HomeHero.module.css';

/** The size the hero calls out by name. */
const PREMIUM_SIZE_ID = '18x24';

/** The two bold lines under the intro, from the live catalogue. */
function sizeLines(catalog) {
  if (!catalog) return null;
  const premium = catalog.sizes.find((size) => size.id === PREMIUM_SIZE_ID) ?? catalog.sizes[catalog.sizes.length - 1];
  return [
    `Choose from ${catalog.sizes.length} frame sizes.`,
    `Our premium ${formatSizeLabel(premium, { unit: true })} frame is ${formatPrice(premium.salePrice, catalog.currency)}.`,
  ];
}

/**
 * "Taste, properly framed." — a play on zauq (taste) — above a salon wall of
 * the five categories. The keyword line is the H1; the display line is a paragraph.
 * @param {{ collections?: import('@/services/productsApi').Collection[] | null }} props
 */
export function HomeHero({ collections }) {
  const headingId = useId();
  const { catalog } = useCatalog();
  const sizes = sizeLines(catalog);

  return (
    <section aria-labelledby={headingId} className={styles.hero}>
      <Container className={styles.inner}>
        <h1 id={headingId} className={styles.kicker} data-reveal="fade-up">
          Framed wall art · made to order in Pakistan
        </h1>
        <p className={styles.display} data-reveal="fade-up" style={{ '--reveal-delay': '80ms' }}>
          Taste, <span className={styles.light}>properly</span> framed.
        </p>
        {/* Three set lines on desktop: the promise, then the sizes and price in bold. */}
        <p className={styles.lead} data-reveal="fade-up" style={{ '--reveal-delay': '160ms' }}>
          <span className={styles.line}>Every piece is printed, framed by hand in Rawalpindi and delivered across Pakistan.</span>
          {sizes?.map((line) => (
            <strong key={line} className={cn(styles.line, styles.strong)}>
              {' '}
              {line}
            </strong>
          ))}
        </p>
        <div className={styles.actions} data-reveal="fade-up" style={{ '--reveal-delay': '240ms' }}>
          <Button to={ROUTES.shop} size="lg">
            Shop the collection <ArrowRightIcon size={18} />
          </Button>
          <Link to={ROUTES.customFrames} className={styles.textLink}>
            Frame your own photo
          </Link>
        </div>

        <SalonWall collections={collections} />
      </Container>
    </section>
  );
}
