import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { BagIcon, CloseIcon, MenuIcon, UserIcon } from '@/components/icons';
import { Container, Logo } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { useCart } from '@/context/cart/useCart';
import { cn } from '@/utils/cn';
import { AnnouncementBar } from './AnnouncementBar.jsx';
import { MainNav } from './MainNav.jsx';
import { SearchForm } from './SearchForm.jsx';
import styles from './Header.module.css';

/** Announcement strip, logo, navigation, search, account and cart. Collapses into a menu on small screens. */
export function Header() {
  const { count } = useCart();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPath, setMenuPath] = useState(pathname);

  // Close the mobile menu whenever the page changes.
  if (pathname !== menuPath) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <AnnouncementBar />
      <header className={styles.header}>
        <Container className={styles.bar}>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>

          <Link to={ROUTES.home} aria-label={`${SITE.fullName} — home`} className={styles.logoLink}>
            <Logo />
          </Link>

          <MainNav className={styles.desktopOnly} />
          <SearchForm className={cn(styles.desktopOnly, styles.search)} />

          <div className={styles.actions}>
            <Link to={ROUTES.account} aria-label="Account" className={styles.iconLink}>
              <UserIcon size={21} />
            </Link>
            <Link to={ROUTES.cart} aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`} className={styles.cart}>
              <BagIcon size={18} />
              <span aria-hidden="true">Cart · {count}</span>
            </Link>
          </div>
        </Container>

        {menuOpen && (
          <div id="mobile-menu" className={styles.mobileMenu}>
            <Container>
              <SearchForm onSearch={closeMenu} />
              <MainNav layout="column" onNavigate={closeMenu} className={styles.mobileNav} />
            </Container>
          </div>
        )}
      </header>
    </>
  );
}
