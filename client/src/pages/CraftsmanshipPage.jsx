import { FaqList, PageHero } from '@/components/common';
import { BoxIcon, BrushIcon, CheckCircleIcon, HangIcon, ImageIcon, RulerIcon, WhatsAppIcon } from '@/components/icons';
import { CheckList, CtaBand, FeatureGrid, InfoSection, SplitBlock, StepList } from '@/components/info';
import { PackageBox, Workbench } from '@/components/illustrations';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE, whatsappLink } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { formatSizeCm, formatSizeLabel } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';
import styles from './CraftsmanshipPage.module.css';

/** /craftsmanship — how a Zauq frame is made, step by step, and the five sizes. */
export default function CraftsmanshipPage() {
  const { catalog } = useCatalog();

  const faqs = [
    { question: 'Is every frame made to order?', answer: 'Yes. Nothing is pre-made: your piece is printed and framed by hand after we confirm your order with you.' },
    { question: 'What colour is the frame?', answer: 'Every piece and every custom photo comes in a black frame — a clean edge that suits calligraphy, modern prints and photographs alike.' },
    { question: 'Does it come ready to hang?', answer: 'Yes. The hanging hardware is fitted before it leaves the studio, so it can go straight onto the wall.' },
    {
      question: 'What if my photo isn’t sharp enough?',
      answer: 'We check every custom photo before printing. If anything needs attention — resolution, cropping or colour — we contact you before we print.',
    },
  ];

  return (
    <>
      <title>{`Craftsmanship | ${SITE.name}`}</title>
      <meta name="description" content={`How every Zauq frame is made: printed in high quality, framed by hand in ${SITE.address}, checked, packed securely and delivered ready to hang.`} />

      <PageHero
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Craftsmanship' }]}
        kicker="Craftsmanship"
        title="Made by hand,"
        titleLight="made for you."
        lead={`Every Zauq frame starts the day you order it. It’s printed in high quality, framed by hand in our ${SITE.address} studio, checked, and packed to travel — then delivered ready to hang.`}
        actions={
          <Button to={ROUTES.shop} size="lg">
            See the collection
          </Button>
        }
        media={<Workbench />}
      />

      <InfoSection kicker="The process" title="Six steps from order to your door" lead={`About ${SITE.leadTime} in all. Here’s what happens in that time.`}>
        <StepList
          steps={[
            { meta: 'Step one', title: 'We confirm your order', text: 'We call or WhatsApp you to check the piece, the size, your address and how you’d like to pay. Nothing is made until it’s confirmed.' },
            { meta: 'Step two', title: 'We print your piece', text: 'The artwork — or your photo — is printed in high quality at the size you chose.' },
            { meta: 'Step three', title: 'We frame it by hand', text: 'The print is set in its black frame by hand, square and clean at every corner.' },
            { meta: 'Step four', title: 'We finish and check', text: 'The hanging hardware is fitted and the finished frame is checked over before it’s approved to leave.' },
            { meta: 'Step five', title: 'We pack it securely', text: 'Each frame is wrapped and boxed to travel safely across Pakistan.' },
            { meta: 'Step six', title: 'Our courier delivers', text: `Shipping takes ${SITE.shippingTime}. It reaches your door ready to hang.` },
          ]}
        />
      </InfoSection>

      <InfoSection tone="surface" kicker="Quality" title="What goes into every frame">
        <FeatureGrid
          columns={3}
          items={[
            { Icon: ImageIcon, title: 'High-quality print', text: 'Rich colour and crisp detail, whether it’s fine calligraphy, a sepia landmark or your own photograph.' },
            { Icon: BrushIcon, title: 'Framed by hand', text: 'Each frame is assembled by hand in our studio rather than on a production line.' },
            { Icon: RulerIcon, title: 'Five true sizes', text: 'The same five sizes for every piece, from a desk-sized 8 × 10 to a statement 24 × 36 in.' },
            { Icon: HangIcon, title: 'Ready to hang', text: 'Hardware fitted before dispatch — no trip to the hardware shop.' },
            { Icon: CheckCircleIcon, title: 'Checked before it leaves', text: 'Every finished frame is looked over before it’s packed.' },
            { Icon: BoxIcon, title: 'Packed to travel', text: 'Wrapped and boxed so it survives the journey to any city in Pakistan.' },
          ]}
        />
      </InfoSection>

      <InfoSection kicker="Sizes" title="One price list for every piece" lead="Every artwork and every custom photo comes in all five sizes. Heritage pieces are drawn in landscape, so their sizes read the other way round — 24 × 18 instead of 18 × 24.">
        {catalog ? (
          <div className={styles.tableWrap} data-reveal="fade-up">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Size</th>
                  <th scope="col">In centimetres</th>
                  <th scope="col">Suits</th>
                  <th scope="col">Price</th>
                </tr>
              </thead>
              <tbody>
                {catalog.sizes.map((size) => (
                  <tr key={size.id} className={size.id === '18x24' ? styles.premium : undefined}>
                    <th scope="row">
                      {formatSizeLabel(size, { unit: true })}
                      {size.id === '18x24' && <span className={styles.tag}>Premium</span>}
                    </th>
                    <td>{formatSizeCm(size)}</td>
                    <td>{size.description}</td>
                    <td className={styles.price}>{formatPrice(size.salePrice, catalog.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.loading}>Loading sizes…</p>
        )}
      </InfoSection>

      <InfoSection tone="surface">
        <SplitBlock kicker="Custom frames" title="Your photo, treated like art" media={<PackageBox />} reverse>
          <p>
            Upload a photo on our custom frames page, preview it in all five sizes and drag it to choose the crop. When your order comes in, we check the file before
            anything is printed.
          </p>
          <CheckList
            items={[
              'We look at resolution, cropping and colour on every photo.',
              'If anything needs attention, we contact you before printing.',
              'Your photo is framed in the same black frame, by the same hands, as every piece in the shop.',
            ]}
          />
          <p>
            <Button to={ROUTES.customFrames}>Frame your photo</Button>
          </p>
        </SplitBlock>
      </InfoSection>

      <InfoSection kicker="Questions" title="About how we make frames">
        <div className={styles.faq}>
          <FaqList items={faqs} />
        </div>
      </InfoSection>

      <CtaBand
        title="Ready when you are"
        text="Choose a piece and a size — we’ll take it from there."
        actions={
          <>
            <Button to={ROUTES.shop} variant="light" size="lg">
              Shop the collection
            </Button>
            <Button href={whatsappLink('Hi Zauq, I have a question about your frames.')} target="_blank" rel="noopener noreferrer" variant="secondary" size="lg">
              <WhatsAppIcon size={18} /> Ask us anything
            </Button>
          </>
        }
      />
    </>
  );
}
