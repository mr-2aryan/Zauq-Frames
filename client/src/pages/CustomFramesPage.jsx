import { usePageHead } from '@/config/seo';
import { CustomFrameFaq, CustomHero, FrameBuilderSection, FrameCta, HowItWorks, Occasions, SizesToScale } from '@/features/custom-frames';

/** /custom-frames — upload a photo, preview it framed, and add it to the cart. */
export default function CustomFramesPage() {
  const head = usePageHead('customFrames');
  return (
    <>
      <title>{head.title}</title>
      <meta name="description" content={head.description} />
      <CustomHero />
      <FrameBuilderSection />
      <HowItWorks />
      <SizesToScale />
      <Occasions />
      <CustomFrameFaq />
      <FrameCta />
    </>
  );
}
