import { useEffect, useId, useRef, useState } from 'react';
import { BagIcon, CheckIcon, UploadIcon } from '@/components/icons';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/formatPrice';
import { GALLERY } from './gallery.js';
import { SamplePhoto } from './SamplePhotos.jsx';
import styles from './PhotoToFrame.module.css';

/**
 * The demo, one photo at a time: picked on the phone, it flies into the frame,
 * the frame grows to a bigger size, a mat may go in, and it's added to the cart.
 * `start` and `end` are frame sizes in inches (width × height, as they hang).
 */
const SAMPLES = [
  // Every gallery photo in turn, between them every size, both orientations, with and without a mat.
  { name: 'sunset', start: [12, 16], end: [18, 24], mat: true },
  { name: 'lake', start: [20, 16], end: [24, 18], mat: false },
  { name: 'flowers', start: [8, 10], end: [12, 16], mat: true },
  { name: 'dunes', start: [16, 12], end: [36, 24], mat: true },
  { name: 'skyline', start: [20, 16], end: [36, 24], mat: false },
  { name: 'forest', start: [16, 20], end: [24, 36], mat: false },
  { name: 'snow', start: [10, 8], end: [20, 16], mat: true },
  { name: 'beach', start: [18, 24], end: [36, 48], mat: false },
  { name: 'autumn', start: [24, 18], end: [48, 36], mat: true },
];
/** When each step starts within a photo's turn, in ms; a turn is CYCLE_MS long. */
const STEPS = { fly: 900, placed: 1900, resize: 3200, mat: 4600, added: 6100, clear: 8600 };
const CYCLE_MS = 9400;
const ORDER = ['pick', 'fly', 'placed', 'resize', 'mat', 'added', 'clear'];

/** Where the frame hangs (its centre, in % of the scene) and how big a size looks there. */
const FRAME_X = 64;
const FRAME_Y = 37;
const MOULDING = 2.2;
const frameBox = ([w, h]) => {
  const long = 22 + Math.max(w, h) * 0.78;
  return w >= h ? { w: long, h: (long * h) / w } : { w: (long * w) / h, h: long };
};
/** The phone's gallery tiles (3 × 3), in % of the scene. */
const TILE = 8.2;
const tileBox = (index) => ({ x: 4.7 + (index % 3) * (TILE + 1), y: 52 + Math.floor(index / 3) * (TILE + 1), w: TILE, h: TILE });
const centre = (box) => ({ x: box.x + box.w / 2, y: box.y + box.h / 2 });

/**
 * "From your phone to your wall": a demo of framing a photo. Its frame is also a
 * real drop zone — once the visitor picks a photo the demo stops and their
 * photo is shown framed instead.
 * @param {{
 *   inputId: string,
 *   previewUrl: string | null,
 *   dragging: boolean,
 *   dropHandlers: Record<string, (event: DragEvent) => void>,
 *   sizes?: Array<{ id: string, salePrice: number }>,
 *   currency?: string,
 * }} props
 */
export function PhotoToFrame({ inputId, previewUrl, dragging, dropHandlers, sizes = [], currency = 'PKR' }) {
  const id = useId().replace(/:/g, '');
  const rootRef = useRef(null);
  const [still] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [onScreen, setOnScreen] = useState(true);
  const [turn, setTurn] = useState(0);
  const [step, setStep] = useState(still ? 'added' : 'pick');
  const running = !still && onScreen && !previewUrl;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  // One photo's turn: each step on its own timer, then the next photo.
  useEffect(() => {
    if (!running) return undefined;
    const timers = [
      window.setTimeout(() => setStep('pick'), 0),
      ...Object.entries(STEPS).map(([name, at]) => window.setTimeout(() => setStep(name), at)),
      window.setTimeout(() => setTurn((value) => value + 1), CYCLE_MS),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [turn, running]);

  const sample = SAMPLES[turn % SAMPLES.length];
  const reached = (name) => ORDER.indexOf(step) >= ORDER.indexOf(name);
  const own = Boolean(previewUrl);

  // The frame: the visitor's photo at 18 × 24, or the demo's photo at its current size.
  const size = own ? [18, 24] : reached('resize') ? sample.end : sample.start;
  const [w, h] = size;
  const box = frameBox(size);
  const mat = !own && sample.mat && reached('mat') && !reached('clear');
  const showSample = !own && reached('placed') && !reached('clear');
  const inner = { x: FRAME_X - box.w / 2 + MOULDING, y: FRAME_Y - box.h / 2 + MOULDING, w: box.w - MOULDING * 2, h: box.h - MOULDING * 2 };
  const tile = tileBox(GALLERY.indexOf(sample.name));
  const flyer = reached('fly') ? inner : tile;
  const from = centre(tile);
  const to = { x: FRAME_X, y: FRAME_Y };
  // Sizes are listed portrait-first (24 × 36 hangs as 36 × 24 in landscape).
  const price = sizes.find((option) => option.id === `${Math.min(w, h)}x${Math.max(w, h)}`)?.salePrice;
  const added = !own && reached('added') && !reached('clear');

  return (
    <div ref={rootRef} className={styles.scene}>
      {/* The phone and its photos. */}
      <div className={cn(styles.phone, reached('fly') && !reached('placed') && styles.phoneSent)} aria-hidden="true">
        <div className={styles.status}>
          <span>9:41</span>
          <span className={styles.statusIcons}>
            <i />
            <i />
            <b />
          </span>
        </div>
        <div className={styles.phoneTop}>
          <strong>Your photos</strong>
          <span>Pick one to frame</span>
        </div>
        <div className={cn(styles.phoneButton, !own && step === 'pick' && styles.phoneButtonPress)}>
          <UploadIcon size={12} /> Frame it
        </div>
      </div>
      {GALLERY.map((name, index) => {
        const t = tileBox(index);
        const picked = !own && name === sample.name && !reached('clear');
        return (
          <span
            key={name}
            className={cn(styles.tile, picked && styles.tilePicked)}
            style={{ left: `${t.x}%`, top: `${t.y}%`, width: `${t.w}%`, height: `${t.h}%` }}
            aria-hidden="true"
          >
            <SamplePhoto name={name} id={`${id}t${index}`} className={styles.fill} />
            {picked && <CheckIcon size={10} className={styles.tileCheck} />}
          </span>
        );
      })}

      {/* The photo's path from the phone to the frame, drawn as it flies. */}
      {!own && !still && reached('fly') && !reached('resize') && (
        <svg key={`trail-${turn}`} className={styles.trail} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d={`M${from.x} ${from.y} Q ${(from.x + to.x) / 2 - 6} ${Math.min(from.y, to.y) - 18} ${to.x} ${to.y}`} />
        </svg>
      )}
      {!own && !still && reached('pick') && !reached('placed') && (
        <span
          key={`fly-${turn}`}
          className={cn(styles.flyer, reached('fly') && styles.flying)}
          style={{ left: `${flyer.x}%`, top: `${flyer.y}%`, width: `${flyer.w}%`, height: `${flyer.h}%` }}
          aria-hidden="true"
        >
          <SamplePhoto name={sample.name} id={`${id}f`} className={styles.fill} />
        </span>
      )}

      {/* The frame on the wall, under a picture light. It's also where the visitor
          can drop or pick their own photo. */}
      <div className={styles.frame} style={{ width: `${box.w}%`, height: `${box.h}%`, left: `${FRAME_X}%`, top: `${FRAME_Y}%` }} {...dropHandlers}>
        <span className={styles.lamp} aria-hidden="true" />
        <label htmlFor={inputId} className={cn(styles.slot, mat && styles.matted, dragging && styles.dragging)}>
          {own ? (
            <img key={previewUrl} src={previewUrl} alt="Your photo, framed" className={styles.picture} />
          ) : (
            <span className={cn(styles.picture, styles.sample, showSample && styles.sampleShown)}>
              <SamplePhoto name={sample.name} id={`${id}p`} className={styles.fill} />
            </span>
          )}
          {!own && !showSample && (
            <span className={styles.empty}>
              <UploadIcon size={20} />
              <span>Your photo here</span>
            </span>
          )}
          <span className={styles.tryOwn}>{own ? 'Change photo' : 'Try it with your photo'}</span>
        </label>
        {/* Its size, measured. */}
        <span className={styles.measureW} aria-hidden="true">
          <span key={`w${w}`}>{w} in</span>
        </span>
        <span className={styles.measureH} aria-hidden="true">
          <span key={`h${h}`}>{h} in</span>
        </span>
      </div>

      {/* The order, as it would be in the builder below. */}
      {!own && (
        <div className={styles.order} aria-hidden="true">
          <span className={styles.orderThumb}>{showSample && <SamplePhoto name={sample.name} id={`${id}o`} className={styles.fill} />}</span>
          <span className={styles.orderText}>
            <strong>Custom frame</strong>
            <span key={`${w}x${h}-${mat}`} className={styles.orderMeta}>
              {w} × {h} in · {w > h ? 'Landscape' : 'Portrait'} · {mat ? 'White mat' : 'No mat'}
            </span>
          </span>
          {price && (
            <strong key={price} className={styles.orderPrice}>
              {formatPrice(price, currency)}
            </strong>
          )}
          <span className={cn(styles.orderButton, added && styles.orderAdded)}>
            {added ? (
              <>
                <CheckIcon size={14} /> Added to cart
              </>
            ) : (
              <>
                <BagIcon size={14} /> Add to cart
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
