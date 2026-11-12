import { cn } from '@/utils/cn';
import styles from './Panel.module.css';

/**
 * Rounded block of colour — the main surface of the design.
 * @param {{ tone?: 'tint' | 'surface' | 'dark' | 'outline', radius?: 'lg' | 'xl', className?: string } & Record<string, any>} props
 */
export function Panel({ as: Tag = 'div', tone = 'tint', radius = 'xl', className, children, ...rest }) {
  return (
    <Tag className={cn(styles.panel, styles[tone], styles[radius], className)} {...rest}>
      {children}
    </Tag>
  );
}
