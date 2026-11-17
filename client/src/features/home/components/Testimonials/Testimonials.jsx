import { useId } from 'react';
import { Link } from 'react-router';
import { Badge, Section, SectionHeader } from '@/components/ui';
import { productPath, ROUTES } from '@/config/routes';
import { TESTIMONIALS } from '../../data/testimonials.js';
import styles from './Testimonials.module.css';

/** Samples are for laying out the section while developing; the live site shows real reviews only. */
const reviews = TESTIMONIALS.filter((review) => !review.sample || import.meta.env.DEV);

/** Customer reviews, each linked to the piece they bought. Hidden when there are none. */
export function Testimonials() {
  const headingId = useId();
  if (!reviews.length) return null;

  return (
    <Section aria-labelledby={headingId}>
      <SectionHeader id={headingId} title="From our customers’ walls" description="What people say once their frames are up." />
      <ul className={styles.grid}>
        {reviews.map((review, index) => (
          <li key={`${review.name}-${index}`} className={styles.card} data-reveal="fade-up" style={{ '--reveal-delay': `${index * 90}ms` }}>
            <svg className={styles.mark} viewBox="0 0 32 24" aria-hidden="true">
              <path d="M0 24V14C0 6 4 1.5 12 0l1.5 3.5C8.5 5 6.5 8 6.5 11H12v13H0Zm19 0V14c0-8 4-12.5 12-14l1 3.5c-5 1.5-7 4.5-7 7.5H31v13H19Z" />
            </svg>
            {review.sample && (
              <Badge tone="sale" className={styles.sample}>
                Sample
              </Badge>
            )}
            <blockquote className={styles.quote}>
              <p>{review.quote}</p>
            </blockquote>
            <footer className={styles.footer}>
              <span className={styles.avatar} aria-hidden="true">
                {review.name.charAt(0)}
              </span>
              <span>
                <span className={styles.name}>{review.name}</span>
                <span className={styles.meta}>
                  {review.city}
                  {' · '}
                  {review.piece ? (
                    <Link to={productPath(review.piece.slug)}>{review.piece.name}</Link>
                  ) : (
                    <Link to={ROUTES.customFrames}>Custom frame</Link>
                  )}
                </span>
              </span>
            </footer>
          </li>
        ))}
      </ul>
    </Section>
  );
}
