import { CategoryGrid, CustomTeaser, Experience, FeaturedProducts, FrameSizes, Testimonials } from '@/features/home';
import { useCollections } from '@/features/products';

/** / — the 3D opening and its "how it's made" story, then categories, featured pieces, custom frames, sizes and reviews. */
export default function HomePage() {
  // Shared by the opening, the category tiles and the featured-piece filters.
  const collectionsQuery = useCollections();

  return (
    <>
      <title>Zauq Frames — Framed wall art & custom frames in Pakistan</title>
      <meta
        name="description"
        content="Islamic calligraphy, modern prints and custom photo frames — printed in high quality, framed by hand in Rawalpindi and delivered across Pakistan."
      />
      <Experience collections={collectionsQuery.data} />
      <CategoryGrid collectionsQuery={collectionsQuery} />
      <FeaturedProducts collections={collectionsQuery.data} />
      <CustomTeaser />
      <FrameSizes />
      <Testimonials />
    </>
  );
}
