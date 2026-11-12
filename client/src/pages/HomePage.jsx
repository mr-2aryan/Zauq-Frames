import { TrustStrip } from '@/components/common';
import { Section } from '@/components/ui';
import { BusinessSection, CategoryGrid, CustomTeaser, FeaturedProducts, HomeHero } from '@/features/home';
import { useCollections } from '@/features/products';

/** / — hero, categories, featured pieces, custom frames and business. */
export default function HomePage() {
  // Shared by the category tiles and the featured-piece filters.
  const collectionsQuery = useCollections();

  return (
    <>
      <title>Zauq Frames — Framed wall art & custom frames in Pakistan</title>
      <meta
        name="description"
        content="Islamic calligraphy, modern prints and custom photo frames — printed in high quality, framed by hand in Rawalpindi and delivered across Pakistan."
      />
      <HomeHero />
      <CategoryGrid collectionsQuery={collectionsQuery} />
      <FeaturedProducts collections={collectionsQuery.data} />
      <CustomTeaser />
      <BusinessSection />
      <Section aria-label="Why shop with Zauq">
        <TrustStrip />
      </Section>
    </>
  );
}
