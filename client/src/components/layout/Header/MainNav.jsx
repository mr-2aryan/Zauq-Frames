import { Link, NavLink } from 'react-router';
import { MAIN_NAV } from '@/config/navigation';
import { cn } from '@/utils/cn';
import styles from './MainNav.module.css';

/**
 * Primary navigation. The active page gets `aria-current="page"`.
 * @param {{ layout?: 'row' | 'column', onNavigate?: () => void, className?: string }} props
 */
export function MainNav({ layout = 'row', onNavigate, className }) {
  return (
    <nav aria-label="Main" className={cn(styles.nav, styles[layout], className)}>
      {MAIN_NAV.map((item) =>
        item.to.includes('#') ? (
          // In-page anchors are never "the current page".
          <Link key={item.to} to={item.to} className={styles.link} onClick={onNavigate}>
            {item.label}
          </Link>
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => cn(styles.link, isActive && styles.active)}
            onClick={onNavigate}
          >
            {item.label}
          </NavLink>
        ),
      )}
    </nav>
  );
}
