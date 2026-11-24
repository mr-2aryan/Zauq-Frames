import { Link } from 'react-router';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { formatSizeLabel, orientSize } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';

/** "a, b and c" — the house style (no Oxford comma). */
const joinWithAnd = (parts) => (parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`);

/*
 * FAQs are built from the live catalogue so prices and sizes never go stale,
 * and only state what the shop already promises.
 */

/** "8 × 10 in is Rs 1,500, …" plus the promotion, if one is running. */
function pricesAnswer({ sizes, currency, finish, promotion }) {
  const prices = sizes.map((size) => `${formatSizeLabel(size, { unit: true })} is ${formatPrice(size.salePrice, currency)}`);
  return `${joinWithAnd(prices)}, each with a ${finish} frame.${promotion.percentOff > 0 ? ` These prices include ${promotion.label.toLowerCase()}.` : ''}`;
}

/** The size range, plus the premium size when the catalogue has it. */
function sizeRange(sizes) {
  const premium = sizes.find((size) => size.id === '18x24');
  return `from ${formatSizeLabel(sizes[0], { unit: true })} for desks and shelves to ${formatSizeLabel(sizes.at(-1), { unit: true })} for spacious walls.${
    premium ? ` ${formatSizeLabel(premium, { unit: true })} is our premium statement size for feature walls.` : ''
  }`;
}

/** Questions that read the same on the shop and on every piece. */
function commonFaqs({ finish, deliveryFee, currency }) {
  return {
    delivery: {
      question: 'How long does delivery take?',
      answer: `About ${SITE.leadTime} from the day you order to your door: we make your frame first, then shipping takes ${SITE.shippingTime}. Delivery is a flat ${formatPrice(deliveryFee, currency)} to any city in Pakistan.`,
    },
    mat: {
      question: 'Can I add a mat?',
      answer: 'Yes. Every frame comes edge to edge, or with a white mat (a white border between the frame and the picture) if you prefer. Choose it when you pick your size; the mat is free.',
    },
    readyToHang: {
      question: 'Does it come ready to hang?',
      answer: `Yes. Every piece is printed in high quality, set in a ${finish} frame and arrives with the hanging hardware already fitted.`,
    },
    damaged: {
      question: 'What if it arrives damaged?',
      answer: (
        <>
          We pack every frame securely. If yours arrives damaged or different from your order, we’ll put it right — message us on WhatsApp at{' '}
          {SITE.phone.display}. See <Link to={ROUTES.returns}>returns &amp; exchanges</Link>.
        </>
      ),
    },
    payment: {
      question: 'How do I pay?',
      answer: 'Place your order on the site and we’ll call or WhatsApp you to confirm the details and payment before we start making it.',
    },
    ownPhoto: {
      question: 'Can I frame my own photo instead?',
      answer: (
        <>
          Yes — upload any photo on <Link to={ROUTES.customFrames}>Custom frames</Link>, see it framed in every size and order it the same way.
        </>
      ),
    },
  };
}

/**
 * Questions shown on every product page.
 * @param {import('@/services/productsApi').Product} product
 * @param {import('@/services/framesApi').FrameCatalog} catalog
 * @returns {Array<{ question: string, answer: import('react').ReactNode }>}
 */
export function getProductFaqs(product, catalog) {
  const common = commonFaqs(catalog);
  const sizes = catalog.sizes.map((size) => orientSize(size, product.orientation));
  return [
    {
      question: 'Which size should I choose?',
      answer: `${product.name} comes in ${sizes.length} sizes, ${sizeRange(sizes)} The Size guide tab above lists every size in centimetres with what it suits.`,
    },
    { question: `How much does ${product.name} cost?`, answer: pricesAnswer({ ...catalog, sizes }) },
    common.mat,
    common.delivery,
    common.readyToHang,
    common.damaged,
    common.payment,
    common.ownPhoto,
  ];
}

/**
 * Questions shown at the foot of the shop.
 * @param {import('@/services/framesApi').FrameCatalog} catalog
 * @returns {Array<{ question: string, answer: import('react').ReactNode }>}
 */
export function getShopFaqs(catalog) {
  const common = commonFaqs(catalog);
  return [
    {
      question: 'What sizes do the frames come in?',
      answer: `Every piece comes in all ${catalog.sizes.length} sizes, ${sizeRange(catalog.sizes)} Each product page has a size guide in centimetres.`,
    },
    { question: 'How much does a frame cost?', answer: pricesAnswer(catalog) },
    common.mat,
    common.delivery,
    {
      question: 'Do I pay delivery on every frame?',
      answer: `No. Delivery is one flat ${formatPrice(catalog.deliveryFee, catalog.currency)} per order, however many frames are in it.`,
    },
    common.readyToHang,
    common.damaged,
    common.payment,
    common.ownPhoto,
  ];
}
