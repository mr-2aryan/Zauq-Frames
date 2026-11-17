import { CategoryGrid, CustomTeaser, FeaturedProducts, FrameSizes, HomeHero, Testimonials } from '@/features/home';
import { useCollections } from '@/features/products';

/** / — hero, categories, featured pieces, custom frames, frame sizes and reviews. */
export default function HomePage() {
  // Shared by the hero wall, the category tiles and the featured-piece filters.
  const collectionsQuery = useCollections();

  return (
    <>
      <title>Zauq Frames — Framed wall art & custom frames in Pakistan</title>
      <meta
        name="description"
        content="Islamic calligraphy, modern prints and custom photo frames — printed in high quality, framed by hand in Rawalpindi and delivered across Pakistan."
      />
      <HomeHero collections={collectionsQuery.data} />
      <CategoryGrid collectionsQuery={collectionsQuery} />
      <FeaturedProducts collections={collectionsQuery.data} />
      <CustomTeaser />
      <FrameSizes />
      <Testimonials />
    </>
  );
}
