import { WhatsAppIcon } from '@/components/icons';
import { SITE } from '@/config/site';
import styles from './WhatsAppButton.module.css';

/** Floating "Chat with us" link, fixed to the bottom-right corner. */
export function WhatsAppButton({ href = SITE.whatsappUrl }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" className={styles.button}>
      <WhatsAppIcon size={22} />
      <span className={styles.label} aria-hidden="true">
        Chat with us
      </span>
    </a>
  );
}
