import { Fragment } from 'react';
import { Link } from 'react-router';
import styles from './Breadcrumbs.module.css';

/**
 * @param {{ items: Array<{ label: string, to?: string }> }} props The last item is the current page.
 */
export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className={styles.nav}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Fragment key={`${item.label}-${index}`}>
            {isLast || !item.to ? (
              <span className={isLast ? styles.current : undefined} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            ) : (
              <Link to={item.to} className={styles.link}>
                {item.label}
              </Link>
            )}
            {!isLast && (
              <span aria-hidden="true" className={styles.separator}>
                ›
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
