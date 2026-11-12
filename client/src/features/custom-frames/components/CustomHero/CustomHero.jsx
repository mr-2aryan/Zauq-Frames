import { useId } from 'react';
import { CheckCircleIcon } from '@/components/icons';
import { Badge, Button, Container, Panel } from '@/components/ui';
import { useCatalog } from '@/context/catalog/useCatalog';
import { formatPrice } from '@/utils/formatPrice';
import { HERO_HIGHLIGHTS } from '../../data/content.js';
import styles from './CustomHero.module.css';

/** "Your memory. Your art. Your frame." */
export function CustomHero() {
  const headingId = useId();
  const { catalog } = useCatalog();
  const startingPrice = catalog ? formatPrice(Math.min(...catalog.sizes.map((size) => size.salePrice)), catalog.currency) : null;

  return (
    <section aria-labelledby={headingId} className={styles.section}>
      <Container>
        <Panel tone="tint" className={styles.panel}>
          <div className={styles.copy}>
            <Badge>Custom photo frames · Made in Pakistan</Badge>
            <h1 id={headingId} className={styles.title}>
              Your memory. Your art. <span className={styles.accent}>Your frame.</span>
            </h1>
            <p className={styles.lead}>
              A photo, a calligraphy piece or a personal memory, turned into a framed wall piece — cut and hand-finished to order
              {startingPrice ? `, from ${startingPrice}` : ''}.
            </p>
            <div className={styles.actions}>
              <Button href="#builder" size="lg">
                Create your frame
              </Button>
              <Button href="#how" variant="secondary" size="lg">
                See how it works
              </Button>
            </div>
            <ul className={styles.highlights}>
              {HERO_HIGHLIGHTS.map((item) => (
                <li key={item.label}>
                  <CheckCircleIcon size={18} />
                  <span>
                    <strong>{item.label}</strong> · {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.media}>
            <img src="/images/site/hero-vinyl-dark.jpg" alt="A custom print framed on a softly lit wall" className={styles.image} />
          </div>
        </Panel>
      </Container>
    </section>
  );
}
