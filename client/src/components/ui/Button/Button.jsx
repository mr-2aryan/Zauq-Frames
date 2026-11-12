import { Link } from 'react-router';
import { cn } from '@/utils/cn';
import styles from './Button.module.css';

/**
 * Pill button. Renders a router `<Link>` when `to` is set, an `<a>` when
 * `href` is set, and a `<button>` otherwise.
 *
 * @param {{
 *   variant?: 'primary' | 'secondary' | 'outline' | 'dark' | 'light' | 'ghost',
 *   size?: 'sm' | 'md' | 'lg',
 *   block?: boolean,
 *   to?: string,
 *   href?: string,
 *   type?: 'button' | 'submit' | 'reset',
 * } & Record<string, any>} props
 */
export function Button({ variant = 'primary', size = 'md', block = false, to, href, type = 'button', className, children, ...rest }) {
  const classes = cn(styles.button, styles[variant], styles[size], block && styles.block, className);

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
