import { useId, useState } from 'react';
import { subscribeToNewsletter } from '@/services/newsletterApi';
import styles from './NewsletterForm.module.css';

/** Email signup in the footer. */
export function NewsletterForm() {
  const id = useId();
  const messageId = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    setError('');
    try {
      await subscribeToNewsletter(email);
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor={id} className={styles.label}>
        Get new pieces first
      </label>
      <div className={styles.row}>
        <input
          id={id}
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status !== 'submitting') setStatus('idle');
          }}
          aria-invalid={status === 'error'}
          aria-describedby={messageId}
          className={styles.input}
        />
        <button type="submit" className={styles.button} disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Joining…' : 'Join'}
        </button>
      </div>
      <p id={messageId} className={styles.message} aria-live="polite">
        {status === 'error' && error}
        {status === 'success' && 'Thank you — you’re on the list.'}
      </p>
    </form>
  );
}
