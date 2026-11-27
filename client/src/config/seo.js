import { useCatalog } from '@/context/catalog/useCatalog';
import { formatPrice } from '@/utils/formatPrice';

/**
 * Search titles and descriptions of the main pages. They match what the server
 * puts in the page before the app loads (server/src/modules/seo/seo.js, PAGES),
 * so search engines see the same title either way. Prices come from the catalogue.
 */
const PAGES = {
  home: {
    title: () => 'Framed Wall Art & Custom Photo Frames in Pakistan | Zauq Frames',
    description: (min, fee) =>
      `Islamic calligraphy, modern prints, posters and custom photo frames, made to order in Rawalpindi. Six sizes from ${min}. ${fee} delivery anywhere in Pakistan, cash on delivery.`,
    fallback: 'Islamic calligraphy, modern prints, posters and custom photo frames, made to order in Rawalpindi and delivered anywhere in Pakistan, cash on delivery.',
  },
  shop: {
    title: (min) => `Shop Framed Wall Art in Pakistan${min ? ` – From ${min}` : ''} | Zauq Frames`,
    description: (min) =>
      `Browse framed Islamic calligraphy, modern wall art, posters and heritage prints. Black frame, free white mat, six sizes from ${min}, delivered anywhere in Pakistan.`,
    fallback: 'Browse framed Islamic calligraphy, modern wall art, posters and heritage prints. Black frame, free white mat, six sizes, delivered anywhere in Pakistan.',
  },
  customFrames: {
    title: (min) => `Custom Photo Frames in Pakistan${min ? ` – From ${min}` : ''} | Zauq Frames`,
    description: (_min, fee) =>
      `Upload your photo and we print and frame it by hand in Rawalpindi. Six sizes from 8×10 to 36×48 in, portrait or landscape, free white mat. ${fee} delivery, cash on delivery.`,
    fallback: 'Upload your photo and we print and frame it by hand in Rawalpindi. Six sizes from 8×10 to 36×48 in, portrait or landscape, free white mat. Cash on delivery.',
  },
  sizes: {
    title: () => 'Frame Sizes & Prices in Pakistan | Zauq Frames',
    description: (min) => `All six frame sizes from 8×10 to 36×48 in, with prices from ${min}, centimetres and where each size works best.`,
    fallback: 'All six frame sizes from 8×10 to 36×48 in, with prices, centimetres and where each size works best.',
  },
};

/** `{ title, description }` for one of the main pages. */
export function usePageHead(page) {
  const { catalog } = useCatalog();
  const head = PAGES[page];
  if (!catalog) return { title: head.title(null), description: head.fallback };
  const min = formatPrice(Math.min(...catalog.sizes.map((size) => size.salePrice)), catalog.currency);
  const fee = formatPrice(catalog.deliveryFee, catalog.currency);
  return { title: head.title(min), description: head.description(min, fee) };
}
