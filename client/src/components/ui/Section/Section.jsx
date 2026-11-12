import { cn } from '@/utils/cn';
import { Container } from '../Container/Container.jsx';
import styles from './Section.module.css';

/**
 * A page section inside the centred container.
 * Sections stack with space above each one (`spacing="top"`); the last one on
 * a page usually uses `"both"` so the footer has room.
 *
 * @param {{ spacing?: 'top' | 'both' | 'none', className?: string } & Record<string, any>} props
 */
export function Section({ as: Tag = 'section', spacing = 'top', className, children, ...rest }) {
  return (
    <Tag className={cn(styles[spacing], className)} {...rest}>
      <Container>{children}</Container>
    </Tag>
  );
}
