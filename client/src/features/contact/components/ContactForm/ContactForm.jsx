import { useId, useState } from 'react';
import { CheckIcon } from '@/components/icons';
import { Button } from '@/components/ui';
import { SITE } from '@/config/site';
import { cn } from '@/utils/cn';
import { sendContactMessage } from '@/services/contactApi';
import styles from './ContactForm.module.css';

/** What the message is about; `value`s match the server's CONTACT_TOPICS. */
const TOPICS = [
  { value: 'order', label: 'An order' },
  { value: 'custom', label: 'Custom frame' },
  { value: 'sizes', label: 'Sizes & prices' },
  { value: 'business', label: 'Business / bulk' },
  { value: 'other', label: 'Something else' },
];

const EMPTY = { topic: 'order', name: '', phone: '', email: '', orderId: '', message: '' };
const MAX_MESSAGE = 2000;

/**
 * The contact form: topic chips, details, message; the server keeps it for the team.
 * Pass `topic` and `onTopicChange` to choose the topic from outside (e.g. the hero's hotspots).
 * @param {{ topic?: string, onTopicChange?: (topic: string) => void, id?: string }} props
 */
export function ContactForm({ topic: topicProp, onTopicChange, id: formId }) {
  const id = useId();
  const [form, setForm] = useState(EMPTY);
  const topic = topicProp ?? form.topic;
  const setTopic = (value) => (onTopicChange ? onTopicChange(value) : setForm((current) => ({ ...current, topic: value })));
  const [state, setState] = useState({ status: 'idle', errors: {}, message: '', sent: null });

  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const fieldError = (field) => state.errors[field];

  const submit = async (event) => {
    event.preventDefault();
    setState((current) => ({ ...current, status: 'sending', errors: {}, message: '' }));
    try {
      const { orderId, ...rest } = form;
      const sent = await sendContactMessage({ ...rest, topic, ...(topic === 'order' && orderId.trim() ? { orderId } : {}) });
      setState({ status: 'sent', errors: {}, message: '', sent: { ...sent, firstName: form.name.trim().split(' ')[0] } });
    } catch (error) {
      const errors = Object.fromEntries((Array.isArray(error.details) ? error.details : []).map((detail) => [detail.field, detail.message]));
      setState({ status: 'error', errors, message: error.message, sent: null });
    }
  };

  if (state.status === 'sent') {
    return (
      <div className={cn(styles.card, styles.done)} role="status">
        <span className={styles.doneIcon} aria-hidden="true">
          <CheckIcon size={28} />
        </span>
        <h2 className={styles.doneTitle}>Message sent</h2>
        <p className={styles.doneText}>
          Thanks, {state.sent.firstName}. We’ll get back to you on WhatsApp or by email, {SITE.hours}.
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            setForm(EMPTY);
            onTopicChange?.(EMPTY.topic);
            setState({ status: 'idle', errors: {}, message: '', sent: null });
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form id={formId} className={styles.card} onSubmit={submit} noValidate aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className={styles.title}>
        Send us a message
      </h2>

      <fieldset className={styles.topics}>
        <legend className={styles.label}>What’s it about?</legend>
        <div className={styles.chips}>
          {TOPICS.map((option) => (
            <label key={option.value} className={cn(styles.chip, topic === option.value && styles.chipActive)}>
              <input type="radio" name={`${id}-topic`} value={option.value} checked={topic === option.value} onChange={() => setTopic(option.value)} className="sr-only" />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.row}>
        <Field id={`${id}-name`} label="Your name" error={fieldError('name')}>
          <input id={`${id}-name`} className={styles.input} value={form.name} onChange={set('name')} autoComplete="name" required />
        </Field>
        <Field id={`${id}-phone`} label="Phone or WhatsApp" error={fieldError('phone')}>
          <input id={`${id}-phone`} className={styles.input} type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="03xx xxxxxxx" required />
        </Field>
      </div>

      <div className={styles.row}>
        <Field id={`${id}-email`} label="Email" hint="Optional" error={fieldError('email')}>
          <input id={`${id}-email`} className={styles.input} type="email" value={form.email} onChange={set('email')} autoComplete="email" />
        </Field>
        {topic === 'order' && (
          <Field id={`${id}-order`} label="Order number" hint="If you have one" error={fieldError('orderId')}>
            <input
              id={`${id}-order`}
              className={styles.input}
              value={form.orderId}
              onChange={(event) => setForm((current) => ({ ...current, orderId: event.target.value.toUpperCase() }))}
              placeholder="ZQ-A45545E9DD"
              spellCheck={false}
            />
          </Field>
        )}
      </div>

      <Field id={`${id}-message`} label="Message" error={fieldError('message')} counter={`${form.message.length} / ${MAX_MESSAGE}`}>
        <textarea
          id={`${id}-message`}
          className={cn(styles.input, styles.textarea)}
          value={form.message}
          onChange={set('message')}
          maxLength={MAX_MESSAGE}
          rows={5}
          placeholder="Tell us what you’re looking for — sizes, a photo you’d like framed, or your order details."
          required
        />
      </Field>

      {state.status === 'error' && !Object.keys(state.errors).length && (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" block disabled={state.status === 'sending'}>
        {state.status === 'sending' ? 'Sending…' : 'Send message'}
      </Button>
      <p className={styles.note}>We reply on WhatsApp or by email, {SITE.hours}.</p>
    </form>
  );
}

/** A labelled field with an optional hint, character count and error. */
function Field({ id, label, hint, error, counter, children }) {
  return (
    <div className={cn(styles.field, error && styles.invalid)}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {hint && <span className={styles.hint}>{hint}</span>}
        {counter && <span className={styles.counter}>{counter}</span>}
      </label>
      {children}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
