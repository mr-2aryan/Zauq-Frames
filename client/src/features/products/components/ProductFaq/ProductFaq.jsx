import { useMemo } from 'react';
import { getProductFaqs } from '../../data/faqs.jsx';
import { FaqSection } from '../FaqSection/FaqSection.jsx';

/**
 * Common questions about a piece, with a WhatsApp prompt for anything else.
 * @param {{ product: import('@/services/productsApi').Product, catalog: import('@/services/framesApi').FrameCatalog }} props
 */
export function ProductFaq({ product, catalog }) {
  const items = useMemo(() => getProductFaqs(product, catalog), [product, catalog]);

  return (
    <FaqSection
      title="Questions about"
      titleLight="this piece"
      text="Sizes, delivery and what arrives in the box — answered."
      whatsappMessage={`Hi Zauq, I have a question about ${product.name}.`}
      items={items}
    />
  );
}
