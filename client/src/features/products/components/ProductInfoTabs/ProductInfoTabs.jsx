import { useId, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { BoxIcon, BrushIcon, CheckCircleIcon, HangIcon, ImageIcon, TruckIcon } from '@/components/icons';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { cn } from '@/utils/cn';
import { formatSizeCm, formatSizeLabel, orientSize } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';
import { useProductReviews } from '../../hooks/useProducts.js';
import { ProductReviews } from '../ProductReviews/ProductReviews.jsx';
import styles from './ProductInfoTabs.module.css';

/**
 * Description / size guide / delivery / reviews. The active tab's pill slides
 * between tabs and each panel eases in; arrow keys move between tabs.
 * @param {{ product: import('@/services/productsApi').Product, catalog: import('@/services/framesApi').FrameCatalog }} props
 */
export function ProductInfoTabs({ product, catalog }) {
  const baseId = useId();
  const reviews = useProductReviews(product.slug);
  const [active, setActive] = useState('description');
  const [indicator, setIndicator] = useState(null);
  const listRef = useRef(null);
  const tabRefs = useRef({});

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'sizes', label: 'Size guide' },
    { id: 'delivery', label: 'Delivery & returns' },
    { id: 'reviews', label: reviews.data ? `Reviews (${reviews.data.count})` : 'Reviews' },
  ];

  // Measure the active tab so the pill behind it can slide into place.
  useLayoutEffect(() => {
    const measure = () => {
      const tab = tabRefs.current[active];
      if (tab) setIndicator({ left: tab.offsetLeft, top: tab.offsetTop, width: tab.offsetWidth, height: tab.offsetHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (listRef.current) observer.observe(listRef.current);
    return () => observer.disconnect();
  }, [active, reviews.data?.count]);

  const handleKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const index = tabs.findIndex((tab) => tab.id === active);
    const next = tabs[(index + step + tabs.length) % tabs.length];
    setActive(next.id);
    tabRefs.current[next.id]?.focus();
  };

  const specs = [
    { Icon: ImageIcon, label: 'Frame', value: `Premium ${catalog.finish}` },
    { Icon: BrushIcon, label: 'Print', value: 'High-quality, colour-rich' },
    { Icon: HangIcon, label: 'Hanging', value: 'Hardware pre-installed' },
    { Icon: BoxIcon, label: 'Made in', value: SITE.address },
  ];

  return (
    <div>
      <div className={styles.tabsWrap}>
        <div ref={listRef} role="tablist" aria-label="Product information" className={styles.tabs} onKeyDown={handleKeyDown}>
          {indicator && (
            <span
              className={styles.indicator}
              style={{ transform: `translate(${indicator.left}px, ${indicator.top}px)`, width: indicator.width, height: indicator.height }}
              aria-hidden="true"
            ></span>
          )}
          {tabs.map((tab) => (
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
      </div>

      {/* Keyed by tab, so each newly opened panel plays its entrance. */}
      <div key={active} id={`${baseId}-${active}-panel`} role="tabpanel" aria-labelledby={`${baseId}-${active}-tab`} className={styles.panel}>
        {active === 'description' && (
          <div className={styles.description}>
            <div>
              <p className={styles.kicker}>{product.collectionName}</p>
              <p className={styles.lead}>{product.description}</p>
            </div>
            <dl className={styles.specs}>
              {specs.map(({ Icon, label, value }) => (
                <div key={label} className={styles.spec}>
                  <span className={styles.specIcon} aria-hidden="true">
                    <Icon size={20} />
                  </span>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {active === 'sizes' && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <caption className="sr-only">Frame sizes and prices</caption>
              <thead>
                <tr>
                  <th scope="col">Size</th>
                  <th scope="col">Centimetres</th>
                  <th scope="col">Best for</th>
                  <th scope="col">Price</th>
                </tr>
              </thead>
              <tbody>
                {catalog.sizes.map((size) => (
                  <tr key={size.id}>
                    <th scope="row" className={styles.sizeCell}>
                      {formatSizeLabel(orientSize(size, product.orientation), { unit: true })}
                    </th>
                    <td className={styles.cmCell}>{formatSizeCm(orientSize(size, product.orientation))}</td>
                    <td className={styles.useCell}>{size.description}</td>
                    <td className={styles.priceCell}>
                      <strong>{formatPrice(size.salePrice, catalog.currency)}</strong>
                      {size.salePrice < size.price && (
                        <s>
                          <span className="sr-only">was </span>
                          {formatPrice(size.price, catalog.currency)}
                        </s>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {active === 'delivery' && (
          <div className={styles.delivery}>
            <ol className={styles.timeline}>
              <li>
                <span className={styles.step}>
                  <BrushIcon size={20} />
                </span>
                <strong>Ordered &amp; made by hand</strong>
                <span>Printed, framed and checked in Rawalpindi.</span>
              </li>
              <li>
                <span className={styles.step}>
                  <TruckIcon size={20} />
                </span>
                <strong>Shipped · {SITE.shippingTime}</strong>
                <span>Packed securely, {formatPrice(catalog.deliveryFee, catalog.currency)} to any city.</span>
              </li>
              <li>
                <span className={styles.step}>
                  <HangIcon size={20} />
                </span>
                <strong>At your door · {SITE.leadTime}</strong>
                <span>From the day you order, ready to hang.</span>
              </li>
            </ol>
            <div className={styles.returns}>
              <CheckCircleIcon size={22} />
              <p>
                If a frame arrives damaged or different from your order, we’ll put it right. See <Link to={ROUTES.returns}>returns &amp; exchanges</Link> or
                message us on WhatsApp at {SITE.phone.display}.
              </p>
            </div>
          </div>
        )}

        {active === 'reviews' && <ProductReviews product={product} query={reviews} />}
      </div>
    </div>
  );
}
