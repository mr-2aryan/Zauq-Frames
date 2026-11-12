import { CustomFrameFaq, CustomHero, FrameBuilderSection, FrameCta, HowItWorks, Occasions, SizesToScale } from '@/features/custom-frames';

/** /custom-frames — upload a photo, preview it framed, and add it to the cart. */
export default function CustomFramesPage() {
  return (
    <>
      <title>Custom Photo Frames Online in Pakistan | Zauq Frames</title>
      <meta
        name="description"
        content="Turn a photo, calligraphy piece or personal memory into a custom framed wall piece — cut and hand-finished to order in Pakistan, delivered nationwide."
      />
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
