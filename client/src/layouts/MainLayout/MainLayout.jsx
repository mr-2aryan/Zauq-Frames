import { ViewTransition } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';
import { TrustStrip } from '@/components/common';
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
      {/* React Router navigates inside a React Transition, so page changes animate (styles in global.css). */}
      <ViewTransition update="page">
        <main id="main-content" tabIndex={-1} className={styles.main}>
          <Outlet />
        </main>
      </ViewTransition>
      {/* Like the footer, the four reasons to buy close every page. */}
      <TrustStrip />
      <Footer />
      <WhatsAppButton />
      <ScrollRestoration />
    </div>
  );
}
