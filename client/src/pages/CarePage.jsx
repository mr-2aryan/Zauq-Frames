import { FaqList, PageHero } from '@/components/common';
import { BoxIcon, ClockIcon, HangIcon, RulerIcon, SparkleIcon, WhatsAppIcon } from '@/components/icons';
import { CheckList, CtaBand, FeatureGrid, InfoSection, SplitBlock, StepList } from '@/components/info';
import { CareCloth, FramedWall } from '@/components/illustrations';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE, whatsappLink } from '@/config/site';
import styles from './InfoPage.module.css';

/** Small inline icons this page needs that the icon set doesn't have. */
const SunIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
  </svg>
);
const DropIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3c-4 5-6 8.2-6 11a6 6 0 0 0 12 0c0-2.8-2-6-6-11z" />
  </svg>
);

/** /help/care — keeping a framed print looking its best, and hanging it well. */
export default function CarePage() {
  const faqs = [
    { question: 'How do I clean my frame?', answer: 'Dust it gently with a soft, dry cloth. Don’t spray cleaners or water onto the frame or the print.' },
    { question: 'Where shouldn’t I hang it?', answer: 'Avoid strong direct sunlight, which can fade colours over time, and damp walls or steamy rooms such as bathrooms.' },
    { question: 'What fixing should I use?', answer: 'Use a fixing suited to your wall and the size of the frame, and make sure it’s secure before hanging. Larger sizes are heavier, so choose accordingly.' },
    { question: 'How should I store a frame I’m not using?', answer: 'Wrap it, then store it upright in a dry place, away from heat and damp, with nothing heavy leaning on it.' },
  ];

  return (
    <>
      <title>{`Care guide | ${SITE.name}`}</title>
      <meta name="description" content="How to clean, hang and look after a framed print so it stays beautiful for years: simple care tips from Zauq Frames." />

      <PageHero
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Care guide' }]}
        kicker="Care guide"
        title="Keep it looking"
        titleLight="like the day it arrived."
        lead="A framed print needs very little — a gentle dust, a good spot on the wall and a secure fixing. Here’s everything worth knowing."
        actions={
          <Button href={whatsappLink('Hi Zauq, I have a question about caring for my frame.')} target="_blank" rel="noopener noreferrer" size="lg">
            <WhatsAppIcon size={18} /> Ask us a question
          </Button>
        }
        media={<CareCloth />}
      />

      <InfoSection kicker="Everyday care" title="Six habits for a lasting frame">
        <FeatureGrid
          columns={3}
          items={[
            { Icon: SparkleIcon, title: 'Dust gently', text: 'A soft, dry cloth every so often is all it needs. Work lightly across the frame and the front.' },
            { Icon: DropIcon, title: 'No sprays', text: 'Never spray cleaners, water or polish onto the frame or the print — moisture can mark and damage it.' },
            { Icon: SunIcon, title: 'Mind the sun', text: 'Strong direct sunlight fades colours over time. Choose a wall that doesn’t take the full afternoon sun.' },
            { Icon: ClockIcon, title: 'Avoid damp', text: 'Keep frames off damp walls and out of steamy rooms like bathrooms, where moisture can get in.' },
            { Icon: HangIcon, title: 'Hang securely', text: 'Use a fixing suited to your wall and the frame’s size, and check it’s firm before you let go.' },
            { Icon: BoxIcon, title: 'Store it well', text: 'Not hanging it yet? Keep it wrapped, upright and somewhere dry, with nothing heavy against it.' },
          ]}
        />
      </InfoSection>

      <InfoSection tone="surface">
        <SplitBlock kicker="Cleaning" title="The right way to dust a frame" media={<CareCloth />}>
          <StepList
            steps={[
              { title: 'Take it down if you can', text: 'Lay it flat on a soft, clean surface so you can work without pressing it against the wall.' },
              { title: 'Use a soft, dry cloth', text: 'Wipe gently along the frame and across the front in light strokes.' },
              { title: 'Skip the sprays', text: 'No cleaners, water or polish — on the frame or the print.' },
              { title: 'Re-hang it level', text: 'Check the fixing is still firm, then straighten the frame.' },
            ]}
          />
        </SplitBlock>
      </InfoSection>

      <InfoSection>
        <SplitBlock kicker="Hanging" title="Hang it straight and secure" media={<FramedWall />} reverse>
          <p>Your frame arrives with the hanging hardware already fitted. Before you pick up a drill:</p>
          <CheckList
            items={[
              'Choose the spot: away from direct sun and damp, and where it can be seen comfortably.',
              'Hold it up first — or tape a sheet of paper the same size to the wall — to check the position.',
              'Mark the fixing point lightly with a pencil.',
              'Use a fixing suited to your wall and the frame’s size, then hang and level it.',
            ]}
          />
        </SplitBlock>
      </InfoSection>

      <InfoSection tone="surface" kicker="Sizes" title="A note on larger frames">
        <div className={styles.cards}>
          <div className={styles.card} data-reveal="fade-up">
            <RulerIcon size={26} />
            <h3>8 × 10 and 12 × 16 in</h3>
            <p>Light and easy to place — on a shelf, a desk or a single fixing on the wall.</p>
          </div>
          <div className={styles.card} data-reveal="fade-up" style={{ '--reveal-delay': '60ms' }}>
            <RulerIcon size={26} />
            <h3>16 × 20 and 18 × 24 in</h3>
            <p>Feature-wall sizes. Use a secure fixing and check the frame sits level.</p>
          </div>
          <div className={styles.card} data-reveal="fade-up" style={{ '--reveal-delay': '120ms' }}>
            <RulerIcon size={26} />
            <h3>24 × 36 in</h3>
            <p>Our largest size and the heaviest. Choose a strong fixing for your wall type, and hang it with a second pair of hands.</p>
          </div>
        </div>
      </InfoSection>

      <InfoSection kicker="Questions" title="Care FAQs">
        <div className={styles.faq}>
          <FaqList items={faqs} />
        </div>
      </InfoSection>

      <CtaBand
        title="Ready for another wall?"
        text="Every piece comes ready to hang, in five sizes."
        actions={
          <>
            <Button to={ROUTES.shop} variant="light" size="lg">
              Shop the collection
            </Button>
            <Button to={ROUTES.customFrames} variant="secondary" size="lg">
              Frame your photo
            </Button>
          </>
        }
      />
    </>
  );
}
