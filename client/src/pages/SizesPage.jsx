import { Link } from 'react-router';
import { FaqList, PageHero } from '@/components/common';
import { BagIcon, HangIcon, ImageIcon, OfficeIcon, RulerIcon, UserIcon } from '@/components/icons';
import { CtaBand, FeatureGrid, InfoSection, SplitBlock, StepList } from '@/components/info';
import { SizesWall } from '@/components/illustrations';
import { Button, StatusMessage } from '@/components/ui';
import { collectionPath, ROUTES } from '@/config/routes';
import { usePageHead } from '@/config/seo';
import { whatsappLink } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { formatSizeCm, formatSizeLabel } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';
import styles from './SizesPage.module.css';

const PREMIUM_SIZE_ID = '18x24';

/** /sizes — the frame sizes compared, with how to choose one. */
export default function SizesPage() {
  const { status, catalog, error, reload } = useCatalog();
  const head = usePageHead('sizes');
  const sizes = catalog?.sizes ?? [];
  const price = (size) => formatPrice(size.salePrice, catalog.currency);

  const faqs = [
    { question: 'Does every piece come in every size?', answer: `Yes. Every artwork in the shop — and every custom photo frame — comes in all ${sizes.length || 'six'} sizes.` },
    {
      question: 'Is the price the same for every design?',
      answer: 'Yes. The price depends only on the size you choose, so a calligraphy piece, a modern print and your own photo cost the same in the same size.',
    },
    { question: 'How are sizes written?', answer: 'Width × height in inches, with centimetres alongside — 18 × 24 in is 18 inches wide and 24 inches tall. Landscape pieces turn it round: 24 × 18 in.' },
    { question: 'Can I order the same piece in two sizes?', answer: 'Yes — choose a size and add it to your cart, then choose the other size and add it again. Each size is its own line in your cart.' },
    { question: 'Do frames arrive ready to hang?', answer: 'Yes. Every frame is printed, framed by hand and arrives with its hanging hardware already fitted.' },
    {
      question: 'Not sure which size?',
      answer: (
        <>
          Send us a photo of your wall and its width on <a href={whatsappLink('Hi Zauq, could you help me choose a frame size for my wall?')}>WhatsApp</a> and we’ll suggest a size or a set.
        </>
      ),
    },
  ];

  return (
    <>
      <title>{head.title}</title>
      <meta name="description" content={head.description} />

      <PageHero
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Frame sizes' }]}
        kicker="Frame sizes"
        title={
          <>
            Six sizes,
            <br />
          </>
        }
        titleLight="one for every wall."
        lead="Every piece in the shop — and every custom photo frame — comes in all six sizes, from a desk-sized 8 × 10 in to a 36 × 48 in centrepiece. Here’s how they compare, and how to choose."
        actions={
          <>
            <Button to={ROUTES.shop}>Shop all frames</Button>
            <Button to={ROUTES.customFrames} variant="secondary">
              Frame your photo
            </Button>
          </>
        }
        media={sizes.length ? <SizesWall bare sizes={sizes} premiumId={PREMIUM_SIZE_ID} /> : null}
        room
      />

      {status !== 'success' ? (
        <InfoSection>
          <StatusMessage status={status} message={status === 'loading' ? 'Loading sizes…' : error?.message} onRetry={reload} />
        </InfoSection>
      ) : (
        <>
          <InfoSection kicker="At a glance" title="All six sizes and prices" lead={`One price list for every design. ${catalog.promotion.percentOff > 0 ? `Prices include ${catalog.promotion.label.toLowerCase()}.` : ''}`}>
            <div className={styles.tableWrap} data-reveal="fade-up">
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Size</th>
                    <th scope="col">Centimetres</th>
                    <th scope="col">Best for</th>
                    <th scope="col">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) => (
                    <tr key={size.id} className={size.id === PREMIUM_SIZE_ID ? styles.premium : undefined}>
                      <th scope="row">
                        {formatSizeLabel(size, { unit: true })}
                        {size.id === PREMIUM_SIZE_ID && <span className={styles.tag}>Premium</span>}
                      </th>
                      <td>{formatSizeCm(size)}</td>
                      <td>{size.description}</td>
                      <td>
                        <strong>{price(size)}</strong>
                        {size.salePrice < size.price && <s>{formatPrice(size.price, catalog.currency)}</s>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </InfoSection>

          <InfoSection tone="surface" kicker="Choosing a size" title="Four steps to the right size" lead="A little measuring now saves a frame that looks lost — or crowded — on the wall.">
            <StepList
              steps={[
                {
                  title: 'Measure the space',
                  text: 'Measure the width of the wall you’re filling — or of the sofa, bed or sideboard the frame will hang above. That width matters more than the height of the wall.',
                },
                {
                  title: 'Aim for about two-thirds',
                  text: 'A common rule of thumb: art over furniture looks best at around two-thirds of the furniture’s width. One large frame, a pair or a row of three can all add up to that width.',
                },
                {
                  title: 'Hang at eye level',
                  text: 'Galleries hang the centre of a picture around 145–150 cm from the floor. Over furniture, leave roughly a hand’s width between its top and the bottom of the frame.',
                },
                {
                  title: 'Try it on the wall',
                  text: 'Cut a sheet of paper or tape out the outline at the size you’re considering, live with it for a day, then order. Our sizes in centimetres are in the table above.',
                },
              ]}
            />
          </InfoSection>

          <InfoSection kicker="Size by room" title="What works where">
            <FeatureGrid
              columns={3}
              items={[
                { Icon: HangIcon, title: 'Living room', text: 'Above a sofa: one 24 × 36 in statement piece, or a row of two or three 18 × 24 in frames. On a large, open wall, a single 36 × 48 in piece can anchor the whole room.' },
                { Icon: UserIcon, title: 'Bedroom', text: 'Above the bed, a pair of 16 × 20 or 18 × 24 in frames; beside it, a 12 × 16 in on the bedside wall.' },
                { Icon: OfficeIcon, title: 'Office & reception', text: 'An 18 × 24, 24 × 36 or 36 × 48 in piece holds its own on a large wall — and reads from across the room.' },
                { Icon: RulerIcon, title: 'Hallway & stairs', text: 'Narrow walls suit 12 × 16 in frames, or a run of 8 × 10 in pieces climbing with the stairs.' },
                { Icon: BagIcon, title: 'Desks & shelves', text: 'The 8 × 10 in size leans on a shelf or sits on a desk without taking over.' },
                { Icon: ImageIcon, title: 'Gallery walls', text: 'Mix sizes around one larger anchor — say a 24 × 36 in in the middle with 8 × 10 to 18 × 24 in pieces around it.' },
              ]}
            />
          </InfoSection>

          <InfoSection tone="surface">
            <SplitBlock
              kicker="Orientation"
              title="Portrait or landscape?"
              media={
                <div className={styles.orientations} aria-hidden="true">
                  <span className={styles.portrait}>
                    <span>18 × 24</span>
                  </span>
                  <span className={styles.landscape}>
                    <span>24 × 18</span>
                  </span>
                </div>
              }
            >
              <p>Most pieces in the shop are composed in portrait — taller than they are wide. Our Heritage Pakistan drawings are landscape, so their sizes read the other way round: 24 × 18 in instead of 18 × 24 in.</p>
              <p>
                With a <Link to={ROUTES.customFrames}>custom photo frame</Link> you choose: pick portrait or landscape in the builder and see your photo framed both ways before you order.
              </p>
              <p>
                Browse the landscape pieces in <Link to={collectionPath('heritage-pakistan')}>Heritage Pakistan</Link>.
              </p>
            </SplitBlock>
          </InfoSection>

          <InfoSection kicker="Questions" title="About sizes">
            <div className={styles.faq}>
              <FaqList items={faqs} />
            </div>
          </InfoSection>
        </>
      )}

      <CtaBand
        title="Found your size?"
        text="Every piece comes in all six — choose one in the shop, or frame your own photo."
        actions={
          <>
            <Button to={ROUTES.shop} variant="light">
              Shop all frames
            </Button>
            <Button href={whatsappLink('Hi Zauq, could you help me choose a frame size?')} target="_blank" rel="noopener noreferrer" variant="secondary">
              Ask on WhatsApp
            </Button>
          </>
        }
      />
    </>
  );
}
