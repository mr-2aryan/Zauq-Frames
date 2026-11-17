import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FilterIcon } from '@/components/icons';
import { cn } from '@/utils/cn';
import styles from './FilterTab.module.css';

/**
 * A tab on the left edge of the screen that slides out while `target` (a list
 * of products) is on screen, and opens the filter drawer. Rendered into <body>
 * so no animated ancestor can unpin it.
 * @param {{
 *   target: import('react').RefObject<HTMLElement | null>,
 *   onClick: () => void,
 *   expanded: boolean,
 *   count?: number,
 * }} props
 */
export function FilterTab({ target, onClick, expanded, count = 0 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = target.current;
    if (!node) return undefined;
    // Shown while the list crosses the middle of the screen.
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '-35% 0px -35% 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [target]);

  return createPortal(
    <button
      type="button"
      className={cn(styles.tab, visible && styles.visible)}
      onClick={onClick}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      inert={!visible}
    >
      <span className={styles.icon} aria-hidden="true">
        <FilterIcon size={18} />
      </span>
      <span className={styles.label}>Filters</span>
      {count > 0 && (
        <span className={styles.count}>
          {count}
          <span className="sr-only"> active</span>
        </span>
      )}
    </button>,
    document.body,
  );
}
