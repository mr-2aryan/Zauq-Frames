import { useId } from 'react';
import { UploadIcon } from '@/components/icons';
import { Badge, Button, Panel, Section } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { formatPrice } from '@/utils/formatPrice';
import styles from './CustomTeaser.module.css';

/** "Turn any photo into wall art in 3 steps" — links to the custom frame builder. */
export function CustomTeaser() {
  const headingId = useId();
  const { catalog } = useCatalog();
  const startingPrice = catalog ? formatPrice(Math.min(...catalog.sizes.map((size) => size.salePrice)), catalog.currency) : null;
  const delivery = catalog ? `${formatPrice(catalog.deliveryFee, catalog.currency)} delivery` : 'nationwide delivery';

  const steps = [
    { title: 'Upload a photo', text: 'JPG or PNG, up to 20 MB' },
    { title: 'Pick a size & preview it live', text: '8 × 10 to 24 × 36 in, portrait or landscape' },
    { title: 'We print, frame & deliver', text: `${SITE.leadTime} · ${delivery}` },
  ];

  return (
    <Section aria-labelledby={headingId}>
      <Panel tone="dark" className={styles.panel}>
        <div className={styles.copy}>
          <Badge tone="primary">Custom frames</Badge>
          <h2 id={headingId} className={styles.title}>
            Turn any photo into wall art in 3 steps
          </h2>
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.number}>{index + 1}</span>
                <span>
                  <strong className={styles.stepTitle}>{step.title}</strong>
                  <span className={styles.stepText}>{step.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <Button to={ROUTES.customFrames} variant="light" size="lg">
            Start designing{startingPrice ? ` — from ${startingPrice}` : ''}
          </Button>
        </div>
        <div className={styles.preview} aria-hidden="true">
          <div className={styles.frame}>
            <div className={styles.canvas}>
              <UploadIcon size={36} />
              <strong>Your photo goes here</strong>
              <span>Live preview · 16 × 20 in</span>
            </div>
          </div>
        </div>
      </Panel>
    </Section>
  );
}
