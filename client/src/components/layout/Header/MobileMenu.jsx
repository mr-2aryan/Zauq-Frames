import { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router';
import { HashLink } from '@/components/common';
import { ArrowRightIcon, CloseIcon, SparkleIcon, UserIcon, WhatsAppIcon } from '@/components/icons';
import { Logo } from '@/components/ui';
import { MAIN_NAV, SUPPORT_NAV, UTILITY_NAV } from '@/config/navigation';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { cn } from '@/utils/cn';
import { NAV_ICONS } from './navIcons.js';
import styles from './MobileMenu.module.css';

/** Plain links only: the Support dropdown gets its own section below. */
const LINKS = MAIN_NAV.filter((item) => item.to);

/**
 * Phone menu: a dark-olive drawer that slides in from the right over a
 * blurred page. A native modal <dialog>, so focus stays inside and Esc closes it.
 * @param {{ open: boolean, onClose: () => void }} props
 */
export function MobileMenu({ open, onClose }) {
  const dialogRef = useRef(null);
  const pressedBackdrop = useRef(false);
  const { catalog } = useCatalog();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    // The dialog itself is only "hit" on the backdrop; the panel fills it.
    <dialog
      ref={dialogRef}
      id="mobile-menu"
      className={styles.drawer}
      aria-label="Menu"
      onClose={onClose}
      onMouseDown={(event) => {
        pressedBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pressedBackdrop.current && event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.panel}>
        <div className={styles.top}>
          <Link to={ROUTES.home} aria-label={`${SITE.fullName} — home`} className={styles.logo} onClick={onClose}>
            <Logo tone="light" size={26} />
          </Link>
          <button type="button" className={styles.close} aria-label="Close menu" onClick={onClose}>
            <CloseIcon size={22} />
          </button>
        </div>

        {catalog?.promotion.percentOff > 0 && (
          <p className={styles.promo}>
            <SparkleIcon size={11} /> {catalog.promotion.label} this month
          </p>
        )}

        <nav aria-label="Main">
          <ol className={styles.links}>
            {LINKS.map((item, index) => (
              <li key={item.to} style={{ '--i': index }}>
                <NavLink to={item.to} end={item.end} className={({ isActive }) => cn(styles.link, isActive && styles.active)} onClick={onClose}>
                  <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.label}>{item.label}</span>
                  {item.highlight && <span className={styles.tag}>Your photo</span>}
                  <ArrowRightIcon size={20} className={styles.arrow} />
                </NavLink>
              </li>
            ))}
          </ol>
        </nav>

        <Link to={ROUTES.customFrames} className={styles.feature} style={{ '--i': LINKS.length }} onClick={onClose}>
          <img src="/images/hero/vinyl-dance.jpg" alt="" className={styles.featureImage} />
          <span>
            <strong>Frame your own photo</strong>
            <span>Upload it, try all five sizes, then order.</span>
          </span>
        </Link>

        <nav aria-label="Support" className={styles.support} style={{ '--i': LINKS.length + 1 }}>
          <p className={styles.supportTitle}>Support</p>
          <ul className={styles.supportGrid}>
            {SUPPORT_NAV.map((item) => {
              const Icon = NAV_ICONS[item.icon];
              const LinkTag = item.to.includes('#') ? HashLink : Link;
              return (
                <li key={item.to}>
                  <LinkTag to={item.to} onClick={onClose}>
                    <Icon size={18} />
                    {item.label}
                  </LinkTag>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.foot} style={{ '--i': LINKS.length + 2 }}>
          <ul className={styles.utility}>
            <li>
              <Link to={ROUTES.account} onClick={onClose}>
                <UserIcon size={17} /> Account
              </Link>
            </li>
            {UTILITY_NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} onClick={onClose}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.whatsapp}>
            <WhatsAppIcon size={20} />
            <span>
              <strong>Chat on WhatsApp</strong>
              <span>
                {SITE.phone.display} · {SITE.hours}
              </span>
            </span>
          </a>
        </div>
      </div>
    </dialog>
  );
}
