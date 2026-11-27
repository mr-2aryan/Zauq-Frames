import { CategoryGrid, CustomTeaser, Experience, FeaturedProducts, FrameSizes, Testimonials } from '@/features/home';
import { usePageHead } from '@/config/seo';
import { useCollections } from '@/features/products';

/** / — the 3D opening and its "how it's made" story, then categories, featured pieces, custom frames, sizes and reviews. */
export default function HomePage() {
  // Shared by the opening, the category tiles and the featured-piece filters.
  const collectionsQuery = useCollections();
  const head = usePageHead('home');

  return (
    <>
      <title>{head.title}</title>
      <meta name="description" content={head.description} />
      <Experience collections={collectionsQuery.data} />
      <CategoryGrid collectionsQuery={collectionsQuery} />
      <FeaturedProducts collections={collectionsQuery.data} />
      <CustomTeaser />
      <FrameSizes />
      <Testimonials />
    </>
  );
}
