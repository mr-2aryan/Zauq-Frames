import { useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { cn } from '@/utils/cn';
import { formatSizeCm, formatSizeLabel } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';
import styles from './ProductInfoTabs.module.css';

const TABS = [
  { id: 'description', label: 'Description' },
  { id: 'sizes', label: 'Size guide' },
  { id: 'delivery', label: 'Delivery & returns' },
];

/**
 * Description / size guide / delivery tabs (arrow keys move between tabs).
 * @param {{ product: import('@/services/productsApi').Product, catalog: import('@/services/framesApi').FrameCatalog }} props
 */
export function ProductInfoTabs({ product, catalog }) {
  const baseId = useId();
  const [active, setActive] = useState(TABS[0].id);
  const tabRefs = useRef({});

  const handleKeyDown = (event) => {
    const index = TABS.findIndex((tab) => tab.id === active);
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = TABS[(index + step + TABS.length) % TABS.length];
    setActive(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Product information" className={styles.tabs} onKeyDown={handleKeyDown}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            ref={(node) => {
              tabRefs.current[tab.id] = node;
            }}
            id={`${baseId}-${tab.id}-tab`}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`${baseId}-${tab.id}-panel`}
            tabIndex={active === tab.id ? 0 : -1}
            className={cn(styles.tab, active === tab.id && styles.tabActive)}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div id={`${baseId}-${active}-panel`} role="tabpanel" aria-labelledby={`${baseId}-${active}-tab`} className={styles.panel}>
        {active === 'description' && (
          <div className={styles.columns}>
            <p className={styles.text}>{product.description}</p>
            <dl className={styles.specs}>
              <div><dt>Frame</dt><dd>Premium {catalog.finish}</dd></div>
              <div><dt>Print</dt><dd>High-quality, colour-rich</dd></div>
              <div><dt>Hanging</dt><dd>Hardware pre-installed</dd></div>
              <div><dt>Made in</dt><dd>{SITE.address}</dd></div>
            </dl>
          </div>
        )}

        {active === 'sizes' && (
          <>
            <p className={styles.sizeNote}>
              Every size is {formatPrice(product.salePrice, product.currency)}
              {product.salePrice < product.price && ` (was ${formatPrice(product.price, product.currency)})`}.
            </p>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className="sr-only">Frame sizes</caption>
                <thead>
                  <tr><th scope="col">Size</th><th scope="col">Centimetres</th><th scope="col">Best for</th></tr>
                </thead>
                <tbody>
                  {catalog.sizes.map((size) => (
                    <tr key={size.id}>
                      <th scope="row">{formatSizeLabel(size, { unit: true })}</th>
                      <td>{formatSizeCm(size)}</td>
                      <td>{size.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {active === 'delivery' && (
          <div className={styles.columns}>
            <p className={styles.text}>
              Every frame is made to order and ready in {SITE.leadTime}. We pack it securely and deliver anywhere in Pakistan for a flat{' '}
              {formatPrice(catalog.deliveryFee, catalog.currency)}.
            </p>
            <p className={styles.text}>
              If a frame arrives damaged or different from your order, we will put it right. See{' '}
              <Link to={ROUTES.returns}>returns &amp; exchanges</Link> or message us on WhatsApp at {SITE.phone.display}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
