import { Link } from 'react-router';
import { FaqList, PageHero } from '@/components/common';
import { BagIcon, HangIcon, ImageIcon, OfficeIcon, RulerIcon, UserIcon } from '@/components/icons';
import { CtaBand, FeatureGrid, InfoSection, SplitBlock, StepList } from '@/components/info';
import { Button, StatusMessage } from '@/components/ui';
import { collectionPath, ROUTES } from '@/config/routes';
import { SITE, whatsappLink } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { formatSizeCm, formatSizeLabel } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';
import styles from './SizesPage.module.css';

const PREMIUM_SIZE_ID = '18x24';

/** The five frames drawn to scale (bottoms level) above a three-seater sofa. */
function SizesToScaleArt({ sizes }) {
  const scale = 4; // px per inch
  const gap = 16;
  const baseline = 200;
  const widths = sizes.map((size) => size.width * scale);
  const total = widths.reduce((sum, width) => sum + width, 0) + gap * (sizes.length - 1);
  // Left edge of each frame, side by side with a gap, centred as a group.
  const lefts = widths.reduce((acc, width, index) => [...acc, index === 0 ? (420 - total) / 2 : acc[index - 1] + widths[index - 1] + gap], []);
  const sofaWidth = 84 * scale;
  const sofaX = (420 - sofaWidth) / 2;

  return (
    <svg viewBox="0 0 420 390" role="img" aria-label="The five frame sizes drawn to scale above a three-seater sofa" className={styles.art}>
      {sizes.map((size, index) => {
        const w = widths[index];
        const h = size.height * scale;
        const frameX = lefts[index];
        const premium = size.id === PREMIUM_SIZE_ID;
        return (
          <g key={size.id}>
            <rect x={frameX + 2} y={baseline - h + 4} width={w} height={h} fill="rgba(28,31,23,0.12)" rx="1" />
            <rect x={frameX} y={baseline - h} width={w} height={h} fill="#17190f" rx="1" />
            <rect x={frameX + 3} y={baseline - h + 3} width={w - 6} height={h - 6} fill="#ffffff" />
            <rect x={frameX + 7} y={baseline - h + 7} width={w - 14} height={h - 14} fill={premium ? '#3E4A1F' : '#DCE3C3'} />
            <text x={frameX + w / 2} y={baseline + 16} textAnchor="middle" fontSize="10" fontWeight="800" fill={premium ? '#3E4A1F' : '#1C1F17'}>
              {size.width}×{size.height}
            </text>
          </g>
        );
      })}
      {/* An 84 in (213 cm) three-seater, for scale. */}
      <g fill="#c9cfb3">
        <rect x={sofaX} y="250" width={sofaWidth} height="62" rx="12" />
        <rect x={sofaX - 6} y="276" width="34" height="82" rx="10" fill="#b9c0a1" />
        <rect x={sofaX + sofaWidth - 28} y="276" width="34" height="82" rx="10" fill="#b9c0a1" />
        <rect x={sofaX + 24} y="300" width={sofaWidth - 48} height="44" rx="8" fill="#d6dbc2" />
        <rect x={sofaX + 8} y="352" width="8" height="16" rx="2" fill="#7c6a4f" />
        <rect x={sofaX + sofaWidth - 16} y="352" width="8" height="16" rx="2" fill="#7c6a4f" />
      </g>
      <text x="210" y="386" textAnchor="middle" fontSize="10" fill="#5B5F51">
        To scale above an 84 in (213 cm) three-seater sofa
      </text>
    </svg>
  );
}

/** /sizes — the five frame sizes compared, with how to choose one. */
export default function SizesPage() {
  const { status, catalog, error, reload } = useCatalog();
  const sizes = catalog?.sizes ?? [];
  const price = (size) => formatPrice(size.salePrice, catalog.currency);

  const faqs = [
    { question: 'Does every piece come in every size?', answer: `Yes. Every artwork in the shop — and every custom photo frame — comes in all ${sizes.length || 'five'} sizes.` },
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
      <title>{`Frame sizes & prices | ${SITE.name}`}</title>
      <meta
        name="description"
        content="Compare Zauq Frames' five sizes — 8 × 10 to 24 × 36 in — with centimetres, prices and how to choose the right size for your wall, room and furniture."
      />

      <PageHero
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Frame sizes' }]}
        kicker="Frame sizes"
        title={
          <>
            Five sizes,
            <br />
          </>
        }
        titleLight="one for every wall."
        lead="Every piece in the shop — and every custom photo frame — comes in all five sizes, from a desk-sized 8 × 10 in to a 24 × 36 in statement piece. Here’s how they compare, and how to choose."
        actions={
          <>
            <Button to={ROUTES.shop}>Shop all frames</Button>
            <Button to={ROUTES.customFrames} variant="secondary">
              Frame your photo
            </Button>
          </>
        }
        media={sizes.length ? <SizesToScaleArt sizes={sizes} /> : null}
      />

      {status !== 'success' ? (
        <InfoSection>
          <StatusMessage status={status} message={status === 'loading' ? 'Loading sizes…' : error?.message} onRetry={reload} />
        </InfoSection>
      ) : (
        <>
          <InfoSection kicker="At a glance" title="All five sizes and prices" lead={`One price list for every design. ${catalog.promotion.percentOff > 0 ? `Prices include ${catalog.promotion.label.toLowerCase()}.` : ''}`}>
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
                { Icon: HangIcon, title: 'Living room', text: 'Above a sofa: one 24 × 36 in statement piece, or a row of two or three 18 × 24 in frames.' },
                { Icon: UserIcon, title: 'Bedroom', text: 'Above the bed, a pair of 16 × 20 or 18 × 24 in frames; beside it, a 12 × 16 in on the bedside wall.' },
                { Icon: OfficeIcon, title: 'Office & reception', text: 'An 18 × 24 or 24 × 36 in piece holds its own on a large wall — and reads from across the room.' },
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
        text="Every piece comes in all five — choose one in the shop, or frame your own photo."
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
