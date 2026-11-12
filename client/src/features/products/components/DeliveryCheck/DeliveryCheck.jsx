import { useId, useState } from 'react';
import { SITE } from '@/config/site';
import { formatPrice } from '@/utils/formatPrice';
import styles from './DeliveryCheck.module.css';

/**
 * "Check delivery to your city". Delivery is a flat rate anywhere in Pakistan,
 * so this confirms the fee and lead time for the city entered.
 * @param {{ deliveryFee: number, currency: string }} props
 */
export function DeliveryCheck({ deliveryFee, currency }) {
  const id = useId();
  const [city, setCity] = useState('');
  const [checkedCity, setCheckedCity] = useState('');
  const fee = formatPrice(deliveryFee, currency);

  const handleSubmit = (event) => {
    event.preventDefault();
    setCheckedCity(city.trim());
  };

  return (
    <form className={styles.box} onSubmit={handleSubmit}>
      <label htmlFor={id} className={styles.label}>
        Check delivery to your city
      </label>
      <div className={styles.row}>
        <input id={id} type="text" autoComplete="address-level2" placeholder="e.g. Lahore" value={city} onChange={(event) => setCity(event.target.value)} className={styles.input} />
        <button type="submit" className={styles.button}>
          Check
        </button>
      </div>
      <p className={styles.result} aria-live="polite">
        {checkedCity
          ? `Yes — we deliver to ${checkedCity} for a flat ${fee}. Made to order in ${SITE.leadTime}, then dispatched.`
          : `Made to order in ${SITE.leadTime} · flat ${fee} delivery anywhere in Pakistan.`}
      </p>
    </form>
  );
}
