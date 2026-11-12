import { Outlet, ScrollRestoration } from 'react-router';
import { Footer, Header, WhatsAppButton } from '@/components/layout';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import styles from './MainLayout.module.css';

/** Shared shell for every storefront page. */
export function MainLayout() {
  useScrollToHash();

  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>
        Skip to content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <ScrollRestoration />
    </div>
  );
}
