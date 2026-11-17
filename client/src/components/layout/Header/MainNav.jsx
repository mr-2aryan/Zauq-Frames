import { useEffect, useId, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import { HashLink } from '@/components/common';
import { ChevronDownIcon } from '@/components/icons';
import { MAIN_NAV } from '@/config/navigation';
import { cn } from '@/utils/cn';
import styles from './MainNav.module.css';
import { NAV_ICONS } from './navIcons.js';

function NavItem({ item, onNavigate }) {
  const Icon = NAV_ICONS[item.icon];
  const className = cn(styles.link, item.highlight && styles.highlight);
  const content = (
    <>
      {Icon && <Icon size={18} />}
      {item.label}
    </>
  );

  // In-page anchors are never "the current page".
  if (item.to.includes('#')) {
    return (
      <HashLink to={item.to} className={className} onClick={onNavigate}>
        {content}
      </HashLink>
    );
  }

  return (
    <NavLink to={item.to} end={item.end} className={({ isActive }) => cn(className, isActive && styles.active)} onClick={onNavigate}>
      {content}
    </NavLink>
  );
}

/**
 * A nav item that opens a panel of links: on hover with a mouse, or by click,
 * Enter or Space. Esc, a click outside or moving focus away closes it.
 */
function NavDropdown({ item }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const closeTimer = useRef(0);
  const panelId = useId();
  const { pathname } = useLocation();
  const current = item.children.some((child) => child.to === pathname);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const hoverOpen = (event) => {
    if (event.pointerType !== 'mouse') return;
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hoverClose = (event) => {
    if (event.pointerType !== 'mouse') return;
    // A short grace period, so crossing the gap to the panel doesn't close it.
    closeTimer.current = window.setTimeout(() => setOpen(false), 180);
  };

  return (
    <div
      ref={rootRef}
      className={styles.dropdown}
      onPointerEnter={hoverOpen}
      onPointerLeave={hoverClose}
      onBlur={(event) => {
        if (!rootRef.current.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={cn(styles.link, styles.trigger, open && styles.open, current && styles.active)}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {item.label}
        <ChevronDownIcon size={16} className={styles.chevron} />
      </button>

      <div id={panelId} className={cn(styles.panel, open && styles.panelOpen)} inert={!open}>
        <ul className={styles.menu}>
          {item.children.map((child) => {
            const Icon = NAV_ICONS[child.icon];
            const LinkTag = child.to.includes('#') ? HashLink : NavLink;
            return (
              <li key={child.to}>
                <LinkTag to={child.to} className={styles.menuItem} onClick={() => setOpen(false)}>
                  {Icon && <Icon size={17} />}
                  {child.label}
                </LinkTag>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/**
 * Primary navigation: a category row on desktop, a list in the mobile menu.
 * The active page gets `aria-current="page"`.
 * @param {{ layout?: 'row' | 'column', onNavigate?: () => void, className?: string }} props
 */
export function MainNav({ layout = 'row', onNavigate, className }) {
  return (
    <nav aria-label="Main" className={cn(styles.nav, styles[layout], className)}>
      <ul className={styles.list}>
        {MAIN_NAV.map((item, index) => (
          <li key={item.label} className={cn(index > 0 && item.group !== MAIN_NAV[index - 1].group && styles.groupStart)}>
            {item.children ? <NavDropdown item={item} /> : <NavItem item={item} onNavigate={onNavigate} />}
          </li>
        ))}
      </ul>
    </nav>
  );
}
