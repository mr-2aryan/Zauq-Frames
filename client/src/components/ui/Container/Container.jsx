import { cn } from '@/utils/cn';
import styles from './Container.module.css';

/** Centres content at the 1440px design width with responsive side gutters. */
export function Container({ as: Tag = 'div', className, children, ...rest }) {
  return (
    <Tag className={cn(styles.container, className)} {...rest}>
      {children}
    </Tag>
  );
}
