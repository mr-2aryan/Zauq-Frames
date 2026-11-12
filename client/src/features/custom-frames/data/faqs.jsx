import { Link } from 'react-router';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { formatSizeLabel } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';
import { PHOTO_RULES } from './content.js';

/** "a, b and c" — matches the house style (no Oxford comma). */
const joinWithAnd = (parts) => (parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`);

/** Builds the pricing answer from live catalogue data so it never goes stale. */
function getPricingAnswer(catalog) {
  if (!catalog) {
    return 'Prices depend on the size you choose and include a black frame — pick a size in the builder above to see yours. Delivery is a flat rate anywhere in Pakistan.';
  }
  const { sizes, currency, finish, deliveryFee, promotion } = catalog;
  const prices = sizes.map((size) => `${formatPrice(size.salePrice, currency)} for ${formatSizeLabel(size, { unit: true })}`);
  const promo = promotion.percentOff > 0 ? ` These prices include ${promotion.label.toLowerCase()}.` : '';
  return `${joinWithAnd(prices)}, including a ${finish} frame.${promo} Delivery is a flat ${formatPrice(deliveryFee, currency)} anywhere in Pakistan.`;
}

/**
 * @param {import('@/services/framesApi').FrameCatalog | null} catalog
 * @returns {Array<{ question: string, answer: import('react').ReactNode }>}
 */
export function getCustomFrameFaqs(catalog) {
  return [
    {
      question: 'What photo should I upload?',
      answer: `A clear JPG or PNG up to ${PHOTO_RULES.maxMb} MB. The higher the resolution, the sharper the print. We check every file and contact you before printing if anything needs attention.`,
    },
    { question: 'How much does a custom photo frame cost?', answer: getPricingAnswer(catalog) },
    { question: 'How long does a custom frame take?', answer: `Custom and made-to-order frames take roughly ${SITE.leadTime}, depending on the order.` },
    {
      question: 'Can I return a custom frame?',
      answer: (
        <>
          Custom and personalised frames aren’t eligible for change-of-mind returns, but if one arrives damaged or different from your
          order, we’ll put it right. See <Link to={ROUTES.returns}>Returns &amp; Exchanges</Link>.
        </>
      ),
    },
  ];
}
