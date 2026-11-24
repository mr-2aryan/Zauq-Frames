import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRightIcon, UploadIcon } from '@/components/icons';
import { Button, Container } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { useCatalog } from '@/context/catalog/useCatalog';
import { cn } from '@/utils/cn';
import { formatSizeLabel } from '@/utils/frames';
import { formatPrice } from '@/utils/formatPrice';
import { PIECES, VIEW, VIEW_HEIGHT } from './pieces.js';
import styles from './Experience.module.css';

const CHAPTER_COUNT = 6;
const AUTO_ADVANCE_MS = 5200;
/** Below this width the copy sits on top and the frames below (matches the CSS). */
const COMPACT_QUERY = '(max-width: 860px)';
/** Room kept at the bottom of a small screen for the giant word and the controls. */
const COMPACT_FOOT = 118;
/**
 * Small screens, in the story: room kept above the frame, under the text (so the
 * last line never sits on the edge of the next section), between the frame and
 * its text, and the least height the frame gets.
 */
const STORY_TOP = 14;
const STORY_BOTTOM = 46;
const STORY_GAP = 20;
const STORY_MIN_BAND = 110;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const COUNT_UP_MS = 800;

/**
 * A figure that counts up to its value once, when it first shows.
 * @param {{ value: number }} props
 */
function CountUp({ value }) {
  const [still] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (still) return undefined;
    let raf = 0;
    const startedAt = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - startedAt) / COUNT_UP_MS);
      setProgress(1 - (1 - t) ** 3);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [still]);

  return Math.round(value * (still ? 1 : progress));
}

/**
 * The home page's opening: five 3D frames (one per category) that swap places
 * and recolour the page, then — as you scroll — the frame in front turns to
 * show how every piece is made: printed, framed by hand, ready to hang, boxed.
 *
 * The 3D scene loads on demand. Without WebGL, or when the visitor prefers
 * reduced motion, the same content shows as a plain hero and a row of steps.
 *
 * @param {{ collections?: import('@/services/productsApi').Collection[] | null }} props
 */
export function Experience({ collections }) {
  const headingId = useId();
  const navigate = useNavigate();
  const { catalog } = useCatalog();
  const [mode, setMode] = useState(() => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'static' : 'immersive'));
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);

  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const chaptersRef = useRef(null);
  const backdropRef = useRef(null);
  const controlsRef = useRef(null);
  const hintRef = useRef(null);
  const chapterRefs = useRef([]);
  const numberRefs = useRef([]);
  const sceneRef = useRef(null);
  const progressRef = useRef(0);
  const activeRef = useRef(0);
  const layoutRef = useRef({ compact: false });

  const piece = PIECES[active];
  const immersive = mode === 'immersive';
  const count = collections?.find((collection) => collection.slug === piece.key)?.productCount;
  const designs = collections?.reduce((sum, collection) => sum + (collection.productCount ?? 0), 0) ?? 0;
  const delivery = catalog ? formatPrice(catalog.deliveryFee, catalog.currency) : null;

  const sizeCount = catalog?.sizes.length ?? 5;
  const chapters = [
    {
      title: 'Printed in high quality',
      text: 'Your artwork is printed in high quality, in the size you choose: edge to edge, or inside a white mat.',
      points: [
        catalog ? `${sizeCount} sizes, from ${formatSizeLabel(catalog.sizes[0])} to ${formatSizeLabel(catalog.sizes.at(-1), { unit: true })}` : 'Six sizes for every piece',
        'Portrait or landscape, to suit the artwork',
        'A piece from the shop, or your own photo',
      ],
      link: { label: 'Compare the sizes', to: ROUTES.sizes },
    },
    {
      title: 'Framed by hand',
      text: 'Each print is set in a slim black frame and finished by hand in Rawalpindi.',
      points: ['Made to order — nothing sits in a warehouse', 'One frame style that suits every room', 'We confirm your order by call or WhatsApp before making it'],
      link: { label: 'How we make them', to: ROUTES.craftsmanship },
    },
    {
      title: 'Ready to hang',
      text: 'Turn it over: two hanging hooks are already fitted, one on each side. Unbox it, pick your spot and hang it.',
      points: ['Arrives framed — nothing to assemble', 'Two hanging hooks fitted at the back', 'Wipe with a soft, dry cloth to keep it fresh'],
      link: { label: 'How to hang a frame straight', to: `${ROUTES.blog}/how-to-hang-a-frame-straight` },
    },
    {
      title: 'Packed securely',
      text: 'Each frame goes into a carton made to its size, sealed all round with our printed tape.',
      points: ['A slim carton made to the size of your frame', 'Sealed with Zauq printed tape'],
      link: { label: 'Shipping & delivery', to: ROUTES.shipping },
    },
    {
      title: 'On its way to you',
      text: 'A courier picks it up and brings it to your door, in any city in Pakistan.',
      points: [delivery ? `Flat ${delivery} delivery, however many frames` : 'One flat delivery fee per order', `At your door in ${SITE.leadTime}`, 'Track your order online'],
      link: { label: 'Track your order', to: ROUTES.trackOrder },
    },
    {
      title: 'Delivered, with a smile',
      text: 'Unbox it, hang it and enjoy it. Pay the way that suits you.',
      points: ['Cash on delivery, bank transfer, JazzCash or Easypaisa', 'Arrives damaged? We put it right'],
      link: { label: 'Returns & refunds', to: ROUTES.returns },
      actions: true,
    },
  ];

  const choose = (index) => {
    setPaused(true);
    setActive(index);
  };

  useEffect(() => {
    activeRef.current = active;
    sceneRef.current?.setActive(active);
  }, [active]);

  // Small screens: measure the room left under the copy, and fit the frames (3D and
  // the flat stand-in) into exactly that space. In the story every chapter is a
  // centred pair: the frame, as large as that chapter's text allows, then the text.
  const { aspect } = piece;
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    const hero = heroRef.current;
    const chapterNodes = chapterRefs.current.slice(0, CHAPTER_COUNT);
    const numberNodes = numberRefs.current.slice(0, CHAPTER_COUNT);
    const vars = ['--cy', '--wy', '--k'];
    const clear = () => {
      chapterNodes.forEach((node) => node?.style.removeProperty('--top'));
      numberNodes.forEach((node) => node?.style.removeProperty('--sy'));
    };

    const measure = () => {
      const compact = window.matchMedia(COMPACT_QUERY).matches;
      // How far the 3D canvas reaches above and below the stage (see "bleed" in the CSS).
      const canvas = canvasRef.current;
      const bleedTop = canvas ? Math.max(0, -canvas.offsetTop) : 0;
      const bleedBottom = canvas ? Math.max(0, canvas.offsetHeight - stage.offsetHeight - bleedTop) : 0;
      if (!compact) {
        vars.forEach((name) => wrapper.style.removeProperty(name));
        clear();
        layoutRef.current = { compact: false, bleedTop, bleedBottom };
      } else {
        const stageHeight = Math.min(stage.offsetHeight, window.innerHeight);
        const lastLine = hero.lastElementChild;
        const heroTop = lastLine.offsetTop + lastLine.offsetHeight + 12;
        const heroBottom = Math.max(heroTop + 120, stageHeight - COMPACT_FOOT);
        // The same fit the 3D scene works out, for the flat stand-in frame.
        const fit = clamp(Math.min(((heroBottom - heroTop) / stageHeight) * 1.24, (stage.offsetWidth / stageHeight) * 1.34), 0.3, 0.9);
        wrapper.style.setProperty('--cy', `${(heroTop + heroBottom) / 2}px`);
        wrapper.style.setProperty('--wy', `${stageHeight - 92}px`);
        wrapper.style.setProperty('--k', String(fit));

        let story;
        if (immersive) {
          // With the header gone the story has the screen from its top (the canvas reaches
          // up there) to the bottom of the stage, which is then the bottom of the screen.
          const room = bleedTop + Math.min(stageHeight, window.innerHeight - bleedTop);
          // The frame at its largest, in pixels: limited by the screen's width and height (as in scene.js).
          const unit = Math.min(stage.offsetWidth * VIEW.perWidth, ((stage.offsetHeight + bleedTop + bleedBottom) * VIEW.maxScale) / VIEW_HEIGHT);
          const largest = (aspect >= 1 ? VIEW.long / aspect : VIEW.long) * VIEW.zoom * unit;
          story = chapterNodes.map((node, index) => {
            const text = node.offsetHeight;
            const band = clamp(room - STORY_TOP - STORY_BOTTOM - STORY_GAP - text, STORY_MIN_BAND, Math.max(STORY_MIN_BAND, largest));
            // Centred as a pair, unless that would leave too little under the text. From the stage top.
            const left = room - band - STORY_GAP - text;
            const top = Math.max(STORY_TOP, Math.min(left / 2, left - STORY_BOTTOM)) - bleedTop;
            node.style.setProperty('--top', `${Math.round(top + band + STORY_GAP)}px`);
            numberNodes[index]?.style.setProperty('--sy', `${Math.round(top + band / 2)}px`);
            return { top, bottom: top + band };
          });
        } else {
          clear();
        }
        layoutRef.current = { compact: true, bleedTop, bleedBottom, heroTop, heroBottom, story };
      }
      sceneRef.current?.setLayout(layoutRef.current);
    };

    const observer = new ResizeObserver(measure);
    [stage, hero, ...chapterNodes].forEach((node) => node && observer.observe(node));
    window.addEventListener('resize', measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [immersive, aspect]);

  // The 3D scene: loaded on demand.
  useEffect(() => {
    if (!immersive) return undefined;
    let cancelled = false;
    let scene = null;

    // The pictures start downloading alongside the 3D code, not after it.
    PIECES.forEach((item) => {
      if (!item.image) return;
      const picture = new Image();
      picture.src = item.image;
    });

    import('./scene.js')
      .then(({ createScene }) => {
        if (cancelled) return;
        scene = createScene({
          canvas: canvasRef.current,
          pieces: PIECES,
          active: activeRef.current,
          layout: layoutRef.current,
          onSelect: (index) => {
            setPaused(true);
            setActive(index);
          },
          onOpen: () => {
            const current = PIECES[activeRef.current];
            navigate(current.image ? current.secondary.to : current.primary.to);
          },
          onReady: () => setReady(true),
          onLost: () => setMode('static'),
        });
        sceneRef.current = scene;
      })
      // No WebGL (or the 3D code failed to load): show the plain version instead.
      .catch(() => {
        if (!cancelled) setMode('static');
      });

    return () => {
      cancelled = true;
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [immersive, navigate]);

  // One loop: read the scroll position, ease it, move the text layers and draw the scene.
  useEffect(() => {
    if (!immersive) return undefined;
    // Held here, so a frame that runs just after the page is left still has its elements.
    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    const hero = heroRef.current;
    const backdrop = backdropRef.current;
    const controls = controlsRef.current;
    const hint = hintRef.current;
    const chapterNodes = chapterRefs.current.slice();
    const numberNodes = numberRefs.current.slice();
    let raf = 0;
    let last = performance.now();
    let visible = true;
    let smooth = 0;
    let first = true;
    let heroShown = true;
    let immersed = false;
    // Read once and on resize, not every frame.
    let stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
    let stageHeight = stage.offsetHeight || 1;
    const onResize = () => {
      stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
      stageHeight = stage.offsetHeight || 1;
    };
    window.addEventListener('resize', onResize);
    // While the story plays, the site header slides away (see Header.module.css).
    const setImmersed = (value) => {
      if (value === immersed) return;
      immersed = value;
      document.documentElement.toggleAttribute('data-immersed', value);
    };
    // Until the story has played out, the floating WhatsApp button stays out of its way
    // (see WhatsAppButton.module.css); it appears as the next section comes in.
    let inStory = false;
    const setInStory = (value) => {
      if (value === inStory) return;
      inStory = value;
      document.documentElement.toggleAttribute('data-story', value);
    };
    const storyOnScreen = (rect) => rect.top < window.innerHeight && rect.bottom > window.innerHeight - 24;
    setInStory(storyOnScreen(wrapper.getBoundingClientRect()));
    let live = false;

    const apply = (progress) => {
      const { compact } = layoutRef.current;
      const heroOpacity = 1 - smoothstep(0.05, 0.4, progress);
      hero.style.opacity = heroOpacity;
      hero.style.transform = `translate3d(0, ${-progress * 60}px, 0)`;
      backdrop.style.opacity = heroOpacity;
      controls.style.opacity = heroOpacity;
      hint.style.opacity = heroOpacity;
      const shown = heroOpacity > 0.5;
      if (shown !== heroShown) {
        heroShown = shown;
        hero.inert = !shown;
        controls.inert = !shown;
      }
      for (let i = 0; i < CHAPTER_COUNT; i += 1) {
        const distance = progress - (i + 1);
        const away = Math.abs(distance);
        // Small screens: the text sits right under the frame. It is gone before the frame
        // changes size for the next chapter, and it only ever moves away from the frame.
        const opacity = 1 - (compact ? smoothstep(0.1, 0.28, away) : smoothstep(0.22, 0.5, away));
        const chapter = chapterNodes[i];
        const number = numberNodes[i];
        if (chapter) {
          chapter.style.opacity = opacity;
          chapter.style.transform = `translate3d(0, ${compact ? away * 56 : -distance * 70}px, 0)`;
          chapter.inert = opacity < 0.5;
        }
        if (number) {
          number.style.opacity = opacity;
          number.style.transform = `translate3d(-50%, calc(-50% + ${-distance * 150}px), 0)`;
        }
      }
    };

    const tick = (now) => {
      raf = 0;
      if (!visible || document.hidden) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const rect = wrapper.getBoundingClientRect();
      const target = clamp((stickyTop - rect.top) / stageHeight, 0, CHAPTER_COUNT);
      smooth = first ? target : smooth + (target - smooth) * (1 - Math.exp(-8 * dt));
      first = false;
      progressRef.current = smooth;
      // From the first chapter until the story scrolls away.
      setImmersed(smooth > 0.3 && rect.bottom > window.innerHeight * 0.75);
      setInStory(storyOnScreen(rect));
      apply(smooth);
      // Laid out for where the page is: now the stage may fade in (see the CSS).
      if (!live) {
        live = true;
        wrapper.toggleAttribute('data-live', true);
      }
      try {
        sceneRef.current?.update(smooth, dt);
      } catch {
        // Whatever went wrong in the 3D scene, the page carries on in its plain version.
        setMode('static');
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) {
        setImmersed(false);
        setInStory(false);
      }
      start();
    });
    observer.observe(wrapper);
    document.addEventListener('visibilitychange', start);
    start();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener('visibilitychange', start);
      window.removeEventListener('resize', onResize);
      setImmersed(false);
      setInStory(false);
    };
  }, [immersive]);

  // Until the visitor picks a frame themselves, the next one comes forward every few seconds.
  useEffect(() => {
    if (!immersive || paused) return undefined;
    const timer = window.setInterval(() => {
      if (document.hidden || progressRef.current > 0.15) return;
      setActive((index) => (index + 1) % PIECES.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [immersive, paused]);

  return (
    <section
      ref={wrapperRef}
      aria-labelledby={headingId}
      className={cn(styles.experience, immersive ? styles.immersive : styles.static)}
      style={{ '--len': piece.word.length, '--screens': CHAPTER_COUNT + 1 }}
    >
      <div ref={stageRef} className={styles.stage}>
        {/* Behind the frames: soft rings and a giant word for the piece in front. */}
        <div ref={backdropRef} className={styles.backdrop} aria-hidden="true">
          <span className={styles.rings} />
          <span key={piece.key} className={styles.word}>
            {piece.word}
          </span>
        </div>
        <div className={styles.numbers} aria-hidden="true">
          {chapters.map((chapter, index) => (
            <span
              key={chapter.title}
              ref={(node) => {
                numberRefs.current[index] = node;
              }}
              className={styles.number}
            >
              0{index + 1}
            </span>
          ))}
        </div>

        {immersive && <canvas ref={canvasRef} className={cn(styles.canvas, ready && styles.canvasReady)} aria-hidden="true" />}

        {/* A flat stand-in for the 3D frame: shown while it loads, and when there's no 3D. */}
        <div className={cn(styles.poster, immersive && ready && styles.posterHidden)} aria-hidden="true">
          <span key={piece.key} className={styles.posterFrame} style={{ aspectRatio: piece.aspect, '--h': piece.aspect >= 1 ? 0.375 : 0.5 }}>
            {piece.image ? <img src={piece.image} alt="" /> : <span className={styles.posterCustom}>Your photo here</span>}
          </span>
        </div>

        <Container className={styles.overlay}>
          <div ref={heroRef} className={styles.hero}>
            <h1 id={headingId} className={styles.kicker}>
              Framed wall art · made to order in Pakistan
            </h1>
            <p className={styles.display}>
              Taste, <span className={styles.light}>properly</span> framed.
            </p>
            <p className={styles.lead}>Every piece is printed, framed by hand in Rawalpindi and delivered across Pakistan.</p>
            {catalog && (
              <dl className={styles.stats}>
                {designs > 0 && (
                  <div className={styles.stat}>
                    <dt>Designs</dt>
                    <dd>
                      <CountUp value={designs} />
                    </dd>
                  </div>
                )}
                <div className={styles.stat}>
                  <dt>Frame sizes</dt>
                  <dd>
                    <CountUp value={catalog.sizes.length} />
                  </dd>
                </div>
                <div className={styles.stat}>
                  <dt>Day delivery</dt>
                  <dd>
                    {SITE.leadDays.min}–{SITE.leadDays.max}
                  </dd>
                </div>
              </dl>
            )}
            <div className={styles.actions}>
              <Button to={piece.primary.to} size="lg" className={styles.cta}>
                {piece.primary.label} <ArrowRightIcon size={18} />
              </Button>
              {/* The piece in front, and the way to it. */}
              <Link to={piece.secondary.to} className={styles.now} aria-label={`${piece.secondary.label} (now showing, ${active + 1} of ${PIECES.length})`}>
                <span key={piece.key} className={styles.nowThumb} style={{ aspectRatio: piece.aspect }}>
                  {piece.image ? <img src={piece.image} alt="" /> : <UploadIcon size={16} />}
                </span>
                <span className={styles.nowText}>
                  <span className={styles.nowLabel}>
                    Now showing · 0{active + 1} / 0{PIECES.length}
                  </span>
                  <strong className={styles.nowPiece}>{piece.piece}</strong>
                  <span className={styles.nowMeta}>
                    {piece.label}
                    {typeof count === 'number' && count > 0 ? ` · ${count} ${count === 1 ? 'piece' : 'pieces'}` : ''}
                  </span>
                </span>
                <ArrowRightIcon size={16} className={styles.nowGo} />
              </Link>
            </div>
          </div>

          <ol ref={chaptersRef} className={styles.chapters} aria-label="How every frame is made">
            {chapters.map((chapter, index) => (
              <li
                key={chapter.title}
                ref={(node) => {
                  chapterRefs.current[index] = node;
                }}
                className={styles.chapter}
              >
                <span className={styles.chapterNo}>
                  0{index + 1} <span>/ 0{chapters.length}</span>
                </span>
                <h2 className={styles.chapterTitle}>{chapter.title}</h2>
                <p className={styles.chapterText}>{chapter.text}</p>
                <ul className={styles.points}>
                  {chapter.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <Link to={chapter.link.to} className={styles.chapterLink}>
                  {chapter.link.label} <ArrowRightIcon size={16} />
                </Link>
                {chapter.actions && (
                  <div className={styles.actions}>
                    <Button to={ROUTES.shop} size="lg" className={styles.cta}>
                      Shop the collection <ArrowRightIcon size={18} />
                    </Button>
                    <Link to={ROUTES.customFrames} className={styles.textLink}>
                      Frame your own photo
                    </Link>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </Container>

        <div ref={controlsRef} className={styles.controls}>
          <button type="button" className={styles.arrow} aria-label="Previous frame" onClick={() => choose((active + PIECES.length - 1) % PIECES.length)}>
            <ArrowRightIcon size={18} className={styles.flip} />
          </button>
          <ol className={styles.dots}>
            {PIECES.map((item, index) => (
              <li key={item.key}>
                <button
                  type="button"
                  className={cn(styles.dot, index === active && styles.dotOn)}
                  aria-label={`Show ${item.label}`}
                  aria-current={index === active ? 'true' : undefined}
                  onClick={() => choose(index)}
                />
              </li>
            ))}
          </ol>
          <button type="button" className={styles.arrow} aria-label="Next frame" onClick={() => choose((active + 1) % PIECES.length)}>
            <ArrowRightIcon size={18} />
          </button>
        </div>

        <p ref={hintRef} className={styles.hint} aria-hidden="true">
          <span className={styles.mouse} /> Scroll to see how it’s made
        </p>
      </div>
    </section>
  );
}
