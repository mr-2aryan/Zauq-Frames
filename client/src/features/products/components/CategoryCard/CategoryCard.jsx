import { Link } from 'react-router';
import styles from './CategoryCard.module.css';

/**
 * Photo tile linking to a collection.
 * @param {{ to: string, title: string, meta: string, image: string } & Record<string, unknown>} props Other props go on the link.
 */
export function CategoryCard({ to, title, meta, image, ...rest }) {
  return (
    <Link to={to} className={styles.card} {...rest}>
      <img src={image} alt="" loading="lazy" className={styles.image} />
      <span className={styles.caption}>
        <span className={styles.title}>{title}</span>
        <span className={styles.meta}>{meta}</span>
      </span>
    </Link>
  );
}
