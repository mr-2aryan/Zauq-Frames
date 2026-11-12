import { useId } from 'react';
import { Panel, Section, SectionHeader } from '@/components/ui';
import { useCatalog } from '@/context/catalog/useCatalog';
import { formatSizeLabel } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';
import { SCALE_PX_PER_INCH } from '../../utils/frameGeometry.js';
import styles from './SizesToScale.module.css';

/** Every frame size drawn side by side at the same scale. */
export function SizesToScale() {
  const headingId = useId();
  const { status, catalog } = useCatalog();
  if (status !== 'success') return null;

  return (
    <Section aria-labelledby={headingId}>
      <SectionHeader id={headingId} title="Five sizes, to scale" description="Every frame is cut to order. Here they are side by side, drawn to the same scale." />
      <Panel tone="surface" className={styles.panel}>
        <ul className={styles.sizes}>
          {catalog.sizes.map((size) => (
            <li key={size.id} className={styles.size}>
              <div aria-hidden="true" className={styles.swatch} style={{ width: size.width * SCALE_PX_PER_INCH, height: size.height * SCALE_PX_PER_INCH }}></div>
              <span className={styles.label}>{formatSizeLabel(size, { unit: true })}</span>
              <span className={styles.price}>
                <strong>{formatPrice(size.salePrice, catalog.currency)}</strong>
                {size.salePrice < size.price && <s>{formatPrice(size.price, catalog.currency)}</s>}
              </span>
              <p className={styles.use}>{size.description}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </Section>
  );
}
