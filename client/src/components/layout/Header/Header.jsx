import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { MenuIcon, SearchIcon, UserIcon } from '@/components/icons';
import { useAuth } from '@/context/auth/useAuth';
import { Container, Logo } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { useScrolled } from '@/hooks/useScrolled';
import { cn } from '@/utils/cn';
import { CartLink } from './CartLink.jsx';
import { MainNav } from './MainNav.jsx';
import { MobileMenu } from './MobileMenu.jsx';
import { SearchDialog } from './SearchDialog.jsx';
import { TopBar } from './TopBar.jsx';
import styles from './Header.module.css';

/**
 * Top bar, then a single-line sticky header: logo, categories and search,
 * account and cart. On smaller screens: logo, search, cart and a menu button
 * (right corner) that opens the slide-in MobileMenu.
 */
export function Header() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the menu and search whenever the page changes.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
  }

  const closeMenu = () => setMenuOpen(false);
  const openSearch = () => {
    setMenuOpen(false);
    setSearchOpen(true);
  };

  return (
    <>
      <TopBar />
      <header className={cn(styles.header, scrolled && styles.scrolled)}>
        <Container className={styles.bar}>
          <div className={styles.start}>
            <Link to={ROUTES.home} aria-label={`${SITE.fullName} — home`} className={styles.logoLink}>
              <Logo />
            </Link>
          </div>

          <div className={cn(styles.middle, styles.desktopOnly)}>
            <MainNav className={styles.nav} />
            <button type="button" className={cn(styles.iconButton, styles.searchButton)} aria-haspopup="dialog" aria-label="Search" title="Search" onClick={openSearch}>
              <SearchIcon size={20} />
            </button>
          </div>

          <div className={styles.end}>
            <button type="button" className={cn(styles.iconButton, styles.mobileOnly)} aria-haspopup="dialog" aria-label="Search" onClick={openSearch}>
              <SearchIcon size={21} />
            </button>
            <Link
              to={ROUTES.account}
              aria-label={user ? `Your account (${user.name})` : 'Sign in or create an account'}
              title={user ? 'Your account' : 'Sign in'}
              className={cn(styles.iconButton, styles.desktopOnly, user && styles.signedIn)}
            >
              {user ? <span aria-hidden="true">{user.name.trim().charAt(0).toUpperCase()}</span> : <UserIcon size={21} />}
            </Link>
            <CartLink className={styles.cart} />
            <button
              type="button"
              className={cn(styles.iconButton, styles.menuButton)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <MenuIcon size={23} />
            </button>
          </div>
        </Container>

      </header>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
