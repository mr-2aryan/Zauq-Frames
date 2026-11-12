import { useId, useState } from 'react';
import { Button } from '@/components/ui';
import styles from './CheckoutForm.module.css';

const FIELDS = [
  { name: 'name', label: 'Full name', autoComplete: 'name', required: true },
  { name: 'phone', label: 'Phone / WhatsApp', autoComplete: 'tel', type: 'tel', required: true, placeholder: '0323 5992853' },
  { name: 'email', label: 'Email (optional)', autoComplete: 'email', type: 'email' },
  { name: 'address', label: 'Delivery address', autoComplete: 'street-address', required: true, multiline: true },
  { name: 'city', label: 'City', autoComplete: 'address-level2', required: true },
  { name: 'notes', label: 'Order notes (optional)', multiline: true, placeholder: 'Delivery instructions, gift message…' },
];

/**
 * Customer details for an order.
 * @param {{ onSubmit: (customer: Record<string, string>) => void, submitting: boolean, fieldErrors: Record<string, string>, error?: string, totalLabel: string }} props
 */
export function CheckoutForm({ onSubmit, submitting, fieldErrors, error, totalLabel }) {
  const baseId = useId();
  const [values, setValues] = useState(() => Object.fromEntries(FIELDS.map((field) => [field.name, ''])));

  const handleSubmit = (event) => {
    event.preventDefault();
    const customer = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]));
    if (!customer.email) delete customer.email;
    if (!customer.notes) delete customer.notes;
    onSubmit(customer);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.fields}>
        {FIELDS.map((field) => {
          const id = `${baseId}-${field.name}`;
          const errorId = `${id}-error`;
          const message = fieldErrors[field.name];
          const Control = field.multiline ? 'textarea' : 'input';
          return (
            <div key={field.name} className={field.multiline || field.name === 'name' ? styles.full : undefined}>
              <label htmlFor={id} className={styles.label}>
                {field.label}
              </label>
              <Control
                id={id}
                name={field.name}
                type={field.multiline ? undefined : (field.type ?? 'text')}
                rows={field.multiline ? 3 : undefined}
                required={field.required}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                value={values[field.name]}
                onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                aria-invalid={Boolean(message)}
                aria-describedby={message ? errorId : undefined}
                className={styles.input}
              />
              {message && (
                <p id={errorId} className={styles.fieldError}>
                  {message}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      <Button type="submit" size="lg" block disabled={submitting} aria-busy={submitting}>
        {submitting ? 'Placing order…' : `Place order · ${totalLabel}`}
      </Button>
      <p className={styles.note}>We’ll call or WhatsApp you to confirm your order and payment before we start framing.</p>
    </form>
  );
}
