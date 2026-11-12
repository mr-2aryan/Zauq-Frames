import { cn } from '@/utils/cn';
import styles from './SectionHeader.module.css';

/**
 * Section title with an optional line of description and an action on the right.
 * @param {{ id?: string, title: import('react').ReactNode, description?: import('react').ReactNode, action?: import('react').ReactNode, as?: string, className?: string }} props
 */
export function SectionHeader({ id, title, description, action, as: Tag = 'h2', className }) {
  return (
    <div className={cn(styles.header, className)}>
      <div>
        <Tag id={id} className={styles.title}>
          {title}
        </Tag>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
