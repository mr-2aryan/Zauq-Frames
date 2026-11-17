import { useId, useState } from 'react';
import { Link } from 'react-router';
import { ChevronDownIcon } from '@/components/icons';
import { Logo } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/formatPrice';
import styles from './CheckoutShell.module.css';

/**
 * The checkout frame, Shopify-style: just the logo, the page on the left and
 * the order summary in a grey panel on the right. On phones the summary folds
 * into a bar under the logo showing the total.
 * @param {{ summary: import('react').ReactNode, total: number, currency: string, children: import('react').ReactNode }} props
 */
export function CheckoutShell({ summary, total, currency, children }) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <header className={styles.brandBar}>
        <Link to={ROUTES.home} aria-label={`${SITE.fullName} — home`} className={styles.brand}>
          <Logo size={30} />
        </Link>
      </header>

      <div className={styles.mobileSummary}>
        <button type="button" className={styles.toggle} aria-expanded={open} aria-controls={`${id}-summary`} onClick={() => setOpen((value) => !value)}>
          <span>
            {open ? 'Hide order summary' : 'Show order summary'}
            <ChevronDownIcon size={16} className={cn(styles.chevron, open && styles.chevronOpen)} />
          </span>
          <strong>{formatPrice(total, currency)}</strong>
        </button>
        <div id={`${id}-summary`} className={cn(styles.mobilePanel, open && styles.mobilePanelOpen)} inert={!open}>
          <div className={styles.mobilePanelInner}>{summary}</div>
        </div>
      </div>

      <main id="main-content" className={styles.main}>
        <div className={styles.mainInner}>{children}</div>
      </main>

      <aside className={styles.side} aria-label="Order summary">
        <div className={styles.sideInner}>{summary}</div>
      </aside>
    </div>
  );
}
