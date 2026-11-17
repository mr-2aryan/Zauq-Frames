import { useMemo } from 'react';
import { getShopFaqs } from '../../data/faqs.jsx';
import { FaqSection } from '../FaqSection/FaqSection.jsx';

/**
 * What people ask before ordering, at the foot of the shop.
 * @param {{ catalog: import('@/services/framesApi').FrameCatalog, headingLevel?: 1 | 2 }} props
 */
export function ShopFaq({ catalog, headingLevel }) {
  const items = useMemo(() => getShopFaqs(catalog), [catalog]);

  return (
    <FaqSection
      title="Good to know"
      titleLight="before you order"
      text="Sizes, prices, delivery and payment — what people ask us first."
      whatsappMessage="Hi Zauq, I have a question about your frames."
      items={items}
      headingLevel={headingLevel}
    />
  );
}
