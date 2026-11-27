import { useId, useState } from 'react';
import { CheckCircleIcon, StarIcon } from '@/components/icons';
import { Badge, Button, StatusMessage } from '@/components/ui';
import { postReview } from '@/services/reviewsApi';
import { cn } from '@/utils/cn';
import styles from './ProductReviews.module.css';

const EMPTY_FORM = { rating: 0, name: '', city: '', text: '', orderId: '' };
const MAX_TEXT = 1000;

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** Read-only stars, e.g. for a 4.5 average. */
function Stars({ rating, size = 18 }) {
  return (
    <span className={styles.stars} role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon key={star} size={size} filled={star <= Math.round(rating)} />
      ))}
    </span>
  );
}

/** 1–5 star picker: real radio buttons, previewing the hovered rating. */
function RatingInput({ value, onChange, error }) {
  const name = useId();
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;
  const labels = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

  return (
    <fieldset className={styles.ratingField}>
      <legend className={styles.label}>Your rating</legend>
      <div className={styles.ratingInput} onMouseLeave={() => setHovered(0)}>
        {labels.map((label, index) => {
          const star = index + 1;
          return (
            <label key={star} className={cn(styles.ratingStar, star <= shown && styles.ratingOn)} onMouseEnter={() => setHovered(star)}>
              <input type="radio" name={name} value={star} checked={value === star} onChange={() => onChange(star)} className="sr-only" aria-label={`${star} star${star > 1 ? 's' : ''} — ${label}`} />
              <StarIcon size={30} filled={star <= shown} />
            </label>
          );
        })}
        <span className={styles.ratingWord}>{shown ? labels[shown - 1] : 'Choose a rating'}</span>
      </div>
      {error && <p className={styles.fieldError}>{error}</p>}
    </fieldset>
  );
}

function ReviewForm({ slug, productName, onPosted, onCancel }) {
  const id = useId();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSending(true);
    setMessage('');
    try {
      await postReview(slug, { ...form, rating: form.rating || undefined });
      setForm(EMPTY_FORM);
      setErrors({});
      onPosted();
    } catch (error) {
      const byField = {};
      (error.details ?? []).forEach(({ field, message: text }) => {
        byField[field] = text;
      });
      setErrors(byField);
      setMessage(Object.keys(byField).length ? '' : error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h3 className={styles.formTitle}>Review {productName}</h3>
      <RatingInput value={form.rating} onChange={(rating) => setForm((current) => ({ ...current, rating }))} error={errors.rating} />

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={`${id}-name`} className={styles.label}>
            Your name
          </label>
          <input id={`${id}-name`} className={styles.input} value={form.name} onChange={set('name')} autoComplete="given-name" aria-invalid={Boolean(errors.name)} />
          {errors.name && <p className={styles.fieldError}>{errors.name}</p>}
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-city`} className={styles.label}>
            City <span className={styles.optional}>(optional)</span>
          </label>
          <input id={`${id}-city`} className={styles.input} value={form.city} onChange={set('city')} autoComplete="address-level2" />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-text`} className={styles.label}>
          Your review
        </label>
        <textarea
          id={`${id}-text`}
          className={cn(styles.input, styles.textarea)}
          value={form.text}
          onChange={set('text')}
          maxLength={MAX_TEXT}
          rows={4}
          placeholder="How does it look on your wall? How was the delivery?"
          aria-invalid={Boolean(errors.text)}
        />
        <span className={styles.counter}>
          {form.text.length} / {MAX_TEXT}
        </span>
        {errors.text && <p className={styles.fieldError}>{errors.text}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-order`} className={styles.label}>
          Order number <span className={styles.optional}>(optional — adds a “Verified buyer” badge)</span>
        </label>
        <input id={`${id}-order`} className={styles.input} value={form.orderId} onChange={set('orderId')} placeholder="e.g. ZQ-A45545E9DD" />
      </div>

      {message && (
        <p className={styles.fieldError} role="alert">
          {message}
        </p>
      )}
      <div className={styles.formActions}>
        <Button type="submit" size="lg" disabled={isSending}>
          {isSending ? 'Posting…' : 'Post review'}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/**
 * Reviews for one piece: average and breakdown, the reviews themselves, and a
 * form anyone can use. Reviews with a matching order number are marked verified.
 * @param {{ product: import('@/services/productsApi').Product, query: ReturnType<typeof import('../../hooks/useProducts.js').useProductReviews> }} props
 */
export function ProductReviews({ product, query }) {
  const [writing, setWriting] = useState(false);
  const [thanks, setThanks] = useState(false);
  const { status, data, error, reload } = query;

  if (status !== 'success') {
    return <StatusMessage status={status} message={status === 'loading' ? 'Loading reviews…' : error?.message} onRetry={reload} />;
  }

  const handlePosted = () => {
    setWriting(false);
    setThanks(true);
    reload();
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.summary}>
        {data.count ? (
          <>
            <p className={styles.average}>{data.average.toFixed(1)}</p>
            <Stars rating={data.average} size={22} />
            <p className={styles.based}>
              Based on {data.count} {data.count === 1 ? 'review' : 'reviews'}
            </p>
            <ul className={styles.breakdown}>
              {data.breakdown.map(({ stars, count }) => (
                <li key={stars}>
                  <span>{stars}★</span>
                  <span className={styles.bar}>
                    <span style={{ width: `${(count / data.count) * 100}%` }}></span>
                  </span>
                  <span>{count}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <Stars rating={0} size={22} />
            <p className={styles.noneTitle}>No reviews yet</p>
            <p className={styles.based}>Bought {product.name}? Tell others how it looks on your wall.</p>
          </>
        )}
        {!writing && (
          <Button variant="outline" block onClick={() => setWriting(true)}>
            Write a review
          </Button>
        )}
      </aside>

      <div className={styles.main}>
        {thanks && !writing && (
          <p className={styles.thanks} role="status">
            <CheckCircleIcon size={18} /> Thank you — your review will appear here once we’ve checked it.
          </p>
        )}
        {writing && <ReviewForm slug={product.slug} productName={product.name} onPosted={handlePosted} onCancel={() => setWriting(false)} />}

        {data.count > 0 && (
          <ul className={styles.list}>
            {data.items.map((review) => (
              <li key={review.id} className={styles.review}>
                <div className={styles.reviewHead}>
                  <Stars rating={review.rating} />
                  {review.verified && (
                    <Badge tone="tint" className={styles.verified}>
                      <CheckCircleIcon size={13} /> Verified buyer
                    </Badge>
                  )}
                </div>
                <p className={styles.reviewText}>{review.text}</p>
                <p className={styles.reviewMeta}>
                  <strong>{review.name}</strong>
                  {review.city && ` · ${review.city}`} · {formatDate(review.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
        {!data.count && !writing && (
          <div className={styles.empty}>
            <p>Be the first to review this piece.</p>
          </div>
        )}
      </div>
    </div>
  );
}
