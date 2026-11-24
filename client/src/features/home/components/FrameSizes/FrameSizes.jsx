import { useId } from 'react';
import { Badge, Container, StatusMessage } from '@/components/ui';
import { useCatalog } from '@/context/catalog/useCatalog';
import { cn } from '@/utils/cn';
import { countWord } from '@/utils/countWord';
import { formatSizeCm, formatSizeLabel } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';
import styles from './FrameSizes.module.css';

/** The size marked "Premium" (the hero calls it out too). */
const PREMIUM_SIZE_ID = '18x24';
/** One artwork in every frame, so only the size changes from card to card. */
const SAMPLE_ART = '/images/hero/vinyl-dance.jpg';

/** "Frame sizes": a full-width dark band with a card per size — the same piece framed to scale, then its price. */
export function FrameSizes() {
  const headingId = useId();
  const { status, catalog, error, reload } = useCatalog();

  return (
    <section id="sizes" aria-labelledby={headingId} className={styles.band}>
      <Container>
        <header className={styles.header} data-reveal="fade-up">
          <p className={styles.kicker}>Sizes &amp; prices</p>
          <h2 id={headingId} className={styles.title}>
            {catalog ? `${catalog.sizes.length} frame sizes, one price list` : 'Frame sizes'}
          </h2>
          <p className={styles.description}>
            Every piece and every custom frame comes in all {catalog ? countWord(catalog.sizes.length) : 'of them'}. The frames below are drawn to scale against one
            another.
          </p>
        </header>

        {status !== 'success' ? (
          <StatusMessage status={status} message={status === 'loading' ? 'Loading sizes…' : error?.message} onRetry={reload} />
        ) : (
          <ul
            className={styles.cards}
            // The largest frame sets the scale, so every card fits it.
            style={{ '--maxw': Math.max(...catalog.sizes.map((size) => size.width)), '--maxh': Math.max(...catalog.sizes.map((size) => size.height)) }}
          >
            {catalog.sizes.map((size, index) => {
              const premium = size.id === PREMIUM_SIZE_ID;
              return (
                <li
                  key={size.id}
                  className={cn(styles.card, premium && styles.premium)}
                  style={{ '--w': size.width, '--h': size.height, '--reveal-delay': `${index * 80}ms` }}
                  data-reveal="fade-up"
                >
                  {premium && (
                    <Badge tone="light" className={styles.badge}>
                      Premium
                    </Badge>
                  )}
                  <div className={styles.stage} aria-hidden="true">
                    <span className={styles.frame}>
                      <img src={SAMPLE_ART} alt="" loading="lazy" className={styles.art} />
                    </span>
                  </div>
                  <h3 className={styles.size}>{formatSizeLabel(size, { unit: true })}</h3>
                  <p className={styles.cm}>{formatSizeCm(size)}</p>
                  <p className={styles.use}>{size.description}</p>
                  <p className={styles.price}>
                    <strong>{formatPrice(size.salePrice, catalog.currency)}</strong>
                    {size.salePrice < size.price && (
                      <s>
                        <span className="sr-only">was </span>
                        {formatPrice(size.price, catalog.currency)}
                      </s>
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </section>
  );
}
