/**
 * The 3D part of the home hero, in plain three.js: five frames built in code
 * (bevelled black moulding, the artwork, a backing board with two golden
 * D-ring hooks and the logo sticker), a carousel layout for the hero and a
 * scroll-driven "how it's made" sequence for the frame in front, which ends
 * with the frame packed in its carton, sealed with our printed tape, then driven to
 * the customer's door (delivery.js). Loaded on demand (see Experience.jsx), so
 * three.js never weighs on other pages.
 *
 * The component owns the animation loop and calls `update(progress, dt)` every
 * frame; `progress` runs 0 (hero) → 6 (last chapter).
 */
import {
  AdditiveBlending,
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Path,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Raycaster,
  RepeatWrapping,
  Scene,
  Shape,
  SRGBColorSpace,
  TextureLoader,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { createDelivery, DELIVERY_TILT, DELIVERY_YAW, PARCEL_HEIGHT } from './delivery.js';
import { VIEW, VIEW_HEIGHT } from './pieces.js';

const FOV = VIEW.fov;
const CAMERA_Z = VIEW.distance;
/** Long side of a frame, moulding width and depth, in world units. */
const LONG = VIEW.long;
const MOULDING = 0.048;
const DEPTH = 0.066;
const BEVEL = 0.009;
/** The long side of a frame stands for 24 inches (our largest frames are 24 in on that side). */
const INCH = LONG / 24;
/** The hooks are drawn a little larger than life, so they read on screen. */
const HOOK_SCALE = 1.3;
/** The carton is made to the frame: a slim sleeve, barely bigger all round, and only as deep as it needs. */
const CARTON_MARGIN = 0.11;
const CARTON_DEPTH = 0.13;
/** The printed packing tape is three inches wide; its logo repeats every six. */
const TAPE_WIDTH = 3 * INCH;
const TAPE_REPEAT = TAPE_WIDTH * 2;
/** The most pixels drawn per frame: sharp, yet light enough for a modest GPU to keep pace. */
const PIXEL_BUDGET = 3_600_000;
/**
 * Sharper artwork: mipmapping blends in the next smaller copy of a picture as it
 * shrinks on screen, which softens it; this bias leans towards the sharper copy.
 */
const ART_SHARPEN_BIAS = -0.6;
/** The site's olive (the specks), and the soft olive a print shows until its picture has loaded. */
const OLIVE = 0x3e4a1f;
const WAITING_ART = 0xc9d2ad;
const LOGO_FONT = '"Bricolage Grotesque", Urbanist, system-ui, sans-serif';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};
/** Frame-rate independent easing towards a target. */
const damp = (current, target, lambda, dt) => lerp(current, target, 1 - Math.exp(-lambda * dt));

/** Where the frames sit in the hero, relative to the group's centre. Slot 0 is the one in front. */
const SLOTS = {
  wide: [
    { x: 0, y: 0, z: 0, s: 1, rz: 0, ry: 0 },
    { x: -1.48, y: 0.94, z: -0.7, s: 0.42, rz: 0.2, ry: 0.45 },
    { x: 1.56, y: 0.84, z: -0.7, s: 0.42, rz: -0.16, ry: -0.4 },
    { x: -1.36, y: -0.98, z: -0.5, s: 0.42, rz: -0.14, ry: 0.35 },
    { x: 1.44, y: -1.02, z: -0.5, s: 0.42, rz: 0.18, ry: -0.45 },
  ],
  compact: [
    { x: 0, y: 0, z: 0, s: 1, rz: 0, ry: 0 },
    { x: -1.3, y: 1.22, z: -0.6, s: 0.4, rz: 0.2, ry: 0.4 },
    { x: 1.32, y: 1.12, z: -0.6, s: 0.4, rz: -0.16, ry: -0.4 },
    { x: -1.26, y: -1.2, z: -0.5, s: 0.4, rz: -0.14, ry: 0.35 },
    { x: 1.3, y: -1.26, z: -0.5, s: 0.4, rz: 0.18, ry: -0.4 },
  ],
};

/**
 * The front frame through the story: hero, then chapters 1–6 (print, side, back,
 * boxed, on its way, delivered). In the last two it turns to face the way the
 * delivery scene is seen.
 */
const STORY = {
  rotY: [0, -0.38, -1.12, -Math.PI - 0.3, -Math.PI * 2 + 0.44, -Math.PI * 2 + DELIVERY_YAW, -Math.PI * 2 + DELIVERY_YAW],
  rotX: [0, 0.04, 0.1, -0.06, 0.1, DELIVERY_TILT, DELIVERY_TILT],
  scale: [1, VIEW.zoom, 1.02, 1.02, 0.97, 0.97, 0.97],
};

/** Eased progress (0–1) of the move from story state `k` to `k + 1`. */
const segment = (progress, k) => smoothstep(0.15, 0.85, clamp(progress - k, 0, 1));
const along = (values, progress) => values.slice(1).reduce((sum, value, k) => sum + (value - values[k]) * segment(progress, k), values[0]);

function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** The "your photo here" artwork for the custom frame. */
function drawCustomArt(ctx, w, h) {
  ctx.fillStyle = '#EEF1E2';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(62, 74, 31, 0.07)';
  ctx.lineWidth = 16;
  for (let x = -h; x < w; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + h, h);
    ctx.stroke();
  }
  ctx.setLineDash([16, 12]);
  ctx.strokeStyle = 'rgba(62, 74, 31, 0.4)';
  ctx.lineWidth = 3;
  ctx.strokeRect(34, 34, w - 68, h - 68);
  ctx.setLineDash([]);

  const cx = w / 2;
  const cy = h / 2 - 50;
  ctx.fillStyle = '#3E4A1F';
  ctx.beginPath();
  ctx.arc(cx, cy, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy + 20);
  ctx.lineTo(cx, cy - 20);
  ctx.moveTo(cx - 16, cy - 4);
  ctx.lineTo(cx, cy - 20);
  ctx.lineTo(cx + 16, cy - 4);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#1C1F17';
  ctx.font = '800 44px Urbanist, system-ui, sans-serif';
  ctx.fillText('Your photo here', cx, cy + 122);
  ctx.fillStyle = '#4A4E40';
  ctx.font = '500 24px Urbanist, system-ui, sans-serif';
  ctx.fillText('Upload · preview · order', cx, cy + 162);
}

/** One line of letter-spaced text, centred on `cx` (canvas letter-spacing isn't everywhere yet). */
function spacedText(ctx, text, cx, baseline, spacing) {
  const letters = [...text];
  const widths = letters.map((letter) => ctx.measureText(letter).width);
  let x = cx - (widths.reduce((sum, width) => sum + width, 0) + spacing * (letters.length - 1)) / 2;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  letters.forEach((letter, index) => {
    ctx.fillText(letter, x, baseline);
    x += widths[index] + spacing;
  });
}

/**
 * The Zauq wordmark, as in the site header (see Logo.module.css): ZAUQ over
 * PREMIUM FRAMES, one colour, centred on (cx, cy). `size` is the ZAUQ font size.
 */
function drawLogo(ctx, cx, cy, size, color) {
  ctx.fillStyle = color;
  ctx.font = `800 ${size}px ${LOGO_FONT}`;
  spacedText(ctx, 'ZAUQ', cx, cy + size * 0.21, size * 0.14);
  const small = size * 0.205;
  ctx.font = `600 ${small}px ${LOGO_FONT}`;
  spacedText(ctx, 'PREMIUM FRAMES', cx, cy + size * 0.52, small * 0.42);
}

/** A speckled board or card surface. */
function drawGrain(ctx, w, h, base, count) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < count; i += 1) {
    ctx.fillStyle = `rgba(${Math.random() > 0.5 ? '255,240,215' : '40,28,16'}, ${0.02 + Math.random() * 0.05})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 4, 1 + Math.random() * 2);
  }
}

/**
 * The back of a frame: a brown backing board with one sticker the size of a
 * business card (3.5 × 2 in), carrying the logo and nothing else.
 */
function drawBack(ctx, w, h) {
  drawGrain(ctx, w, h, '#75604a', 1600);
  // The frame shown stands for a mid-sized one: about 13 inches across its short side.
  const inch = Math.min(w, h) / 13;
  const sw = 3.5 * inch;
  const sh = 2 * inch;
  const sx = (w - sw) / 2;
  const sy = h * 0.64 - sh / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(30, 20, 10, 0.4)';
  ctx.shadowBlur = inch * 0.14;
  ctx.shadowOffsetY = inch * 0.05;
  ctx.fillStyle = '#fbf8f1';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(sx, sy, sw, sh, inch * 0.1);
  else ctx.rect(sx, sy, sw, sh);
  ctx.fill();
  ctx.restore();
  drawLogo(ctx, w / 2, sy + sh / 2, sh * 0.36, '#17190f');
}

/** Plain kraft cardboard: its flutes faintly showing through, a little darker where it folds. */
function drawKraft(ctx, w, h) {
  drawGrain(ctx, w, h, '#bb915a', Math.round((w * h) / 240));
  for (let x = 0; x < w; x += 7) {
    ctx.fillStyle = `rgba(70, 45, 15, ${0.02 + Math.random() * 0.035})`;
    ctx.fillRect(x, 0, 2, h);
  }
  const shade = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.75);
  shade.addColorStop(0, 'rgba(60, 35, 10, 0)');
  shade.addColorStop(1, 'rgba(60, 35, 10, 0.16)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(55, 35, 12, 0.28)';
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, w - 3, h - 3);
}

/** Clear packing tape: barely there, brighter along its edges, with a few streaks of shine. */
function drawTape(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255, 250, 236, 0.3)';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 9; i += 1) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.05 + Math.random() * 0.16})`;
    ctx.fillRect(Math.random() * w, Math.random() * h, w * (0.2 + Math.random() * 0.5), 1 + Math.random() * 2);
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillRect(0, 0, w, 2);
  ctx.fillRect(0, h - 2, w, 2);
}

/** One repeat of our packing tape: clear, with the logo printed on it in black. */
function drawLogoTape(ctx, w, h) {
  drawTape(ctx, w, h);
  drawLogo(ctx, w / 2, h / 2, h * 0.47, '#0d0d0b');
}

/** A soft round dot for the drifting specks. */
function drawDot(ctx, w) {
  const gradient = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, w);
}

/** Crop a texture to cover a plane of the given aspect (like CSS object-fit: cover). */
function coverTexture(texture, planeAspect) {
  const image = texture.image;
  if (!image?.width) return;
  const imageAspect = image.width / image.height;
  if (imageAspect > planeAspect) {
    texture.repeat.set(planeAspect / imageAspect, 1);
    texture.offset.set((1 - planeAspect / imageAspect) / 2, 0);
  } else {
    texture.repeat.set(1, imageAspect / planeAspect);
    texture.offset.set(0, (1 - imageAspect / planeAspect) / 2);
  }
}

/**
 * @typedef {{
 *   compact: boolean,
 *   bleedTop?: number,
 *   bleedBottom?: number,
 *   heroTop?: number,
 *   heroBottom?: number,
 *   story?: ReadonlyArray<{ top: number, bottom: number }>,
 * }} Layout
 * `compact` is the small-screen layout. The bleeds are how far the canvas reaches
 * above and below the stage, in pixels. The rest are pixels from the top of the
 * stage: the free band for the hero's frames, and — one per chapter — the band
 * the frame gets above that chapter's text.
 */

/**
 * @param {{
 *   canvas: HTMLCanvasElement,
 *   pieces: ReadonlyArray<{ image: string | null, aspect: number }>,
 *   active: number,
 *   layout: Layout,
 *   onSelect: (index: number) => void,
 *   onOpen: () => void,
 *   onReady: () => void,
 *   onLost?: () => void,
 * }} options `onLost` is called if the browser takes the 3D context away.
 */
export function createScene({ canvas, pieces, active: initialActive, layout: initialLayout, onSelect, onOpen, onReady, onLost }) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 50);
  camera.position.set(0, 0, CAMERA_Z);

  scene.add(new AmbientLight(0xffffff, 1.5));
  const key = new DirectionalLight(0xffffff, 2.4);
  key.position.set(-3, 4, 6);
  const fill = new DirectionalLight(0xfff1dd, 0.9);
  fill.position.set(4, -1.5, 5);
  scene.add(key, fill);

  const disposables = [];
  const track = (item) => {
    disposables.push(item);
    return item;
  };

  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  const loader = new TextureLoader();

  const mouldingMaterial = track(new MeshStandardMaterial({ color: 0x17190f, roughness: 0.42, metalness: 0.15 }));
  // Glass: black and additive, so only its soft highlight shows — and only faintly.
  const glassMaterial = track(
    new MeshStandardMaterial({ color: 0x000000, roughness: 0.3, metalness: 0, transparent: true, opacity: 0.3, blending: AdditiveBlending, depthWrite: false }),
  );

  // Hanging hooks, as fitted in the workshop: golden D-ring clips, standing upright on
  // the side rails. A strap with a rounded end is screwed to the moulding; its rolled
  // top holds a D-shaped ring that points up. Drawn a little larger than life (HOOK_SCALE).
  const hookMaterial = track(new MeshStandardMaterial({ color: 0xe0b450, roughness: 0.34, metalness: 0.7 }));
  const screwMaterial = track(new MeshStandardMaterial({ color: 0xa97c26, roughness: 0.45, metalness: 0.7 }));
  const STRAP_W = 0.03;
  const STRAP_L = 0.084;
  const strapShape = new Shape();
  strapShape.moveTo(-STRAP_W / 2, STRAP_L / 2 - 0.012);
  strapShape.lineTo(-STRAP_W / 2, -STRAP_L / 2 + STRAP_W / 2);
  strapShape.absarc(0, -STRAP_L / 2 + STRAP_W / 2, STRAP_W / 2, Math.PI, Math.PI * 2, false);
  strapShape.lineTo(STRAP_W / 2, STRAP_L / 2 - 0.012);
  strapShape.lineTo(0.009, STRAP_L / 2);
  strapShape.lineTo(-0.009, STRAP_L / 2);
  strapShape.closePath();
  const screwHole = new Path();
  screwHole.absarc(0, -STRAP_L / 2 + STRAP_W / 2 + 0.003, 0.0078, 0, Math.PI * 2, true);
  strapShape.holes.push(screwHole);
  const strapGeometry = track(new ExtrudeGeometry(strapShape, { depth: 0.004, bevelEnabled: false, curveSegments: 10 }));
  strapGeometry.translate(0, 0, -0.004);
  const barrelGeometry = track(new CylinderGeometry(0.0072, 0.0072, 0.02, 12));
  const screwGeometry = track(new CylinderGeometry(0.0074, 0.0074, 0.005, 14));
  // The ring: a short straight bar through the rolled top, flaring into a round bow above it.
  const ringGeometry = track(
    new TubeGeometry(
      new CatmullRomCurve3(
        [
          [-0.009, 0],
          [0.009, 0],
          [0.019, 0.012],
          [0.023, 0.034],
          [0.018, 0.056],
          [0, 0.068],
          [-0.018, 0.056],
          [-0.023, 0.034],
          [-0.019, 0.012],
        ].map(([x, y]) => new Vector3(x, y, 0)),
        true,
      ),
      72,
      0.0048,
      8,
      true,
    ),
  );
  /** One hook, upright on the back of a side rail: its origin is the middle of the strap. */
  const makeHook = () => {
    const hook = new Group();
    const strap = new Mesh(strapGeometry, hookMaterial);
    const screw = new Mesh(screwGeometry, screwMaterial);
    screw.rotation.x = Math.PI / 2;
    screw.position.set(0, -STRAP_L / 2 + STRAP_W / 2 + 0.003, -0.003);
    const barrel = new Mesh(barrelGeometry, hookMaterial);
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(0, STRAP_L / 2 + 0.003, -0.007);
    // The ring hangs in the rolled top and lifts a touch off the frame.
    const ring = new Mesh(ringGeometry, hookMaterial);
    ring.position.copy(barrel.position);
    ring.rotation.x = -0.06;
    hook.add(strap, screw, barrel, ring);
    hook.scale.setScalar(HOOK_SCALE);
    return hook;
  };

  // The carton of the last chapter: plain kraft card, sealed with our clear tape — the
  // logo is printed on the tape, in black — which catches the light.
  const kraftMaterial = track(new MeshStandardMaterial({ map: track(canvasTexture(512, 512, drawKraft)), roughness: 0.96, metalness: 0, transparent: true, opacity: 0 }));
  const makeTapeMaterial = (map) => track(new MeshStandardMaterial({ map, color: 0xffffff, roughness: 0.12, metalness: 0, transparent: true, opacity: 0, depthWrite: false }));
  const tapeMaterials = [makeTapeMaterial(track(canvasTexture(128, 128, drawTape)))];
  const hiddenMaterial = track(new MeshBasicMaterial({ visible: false }));
  /** Textures that carry the logo: redrawn once its font has loaded. */
  const logoTextures = [];

  let active = initialActive;
  let layout = initialLayout;
  let ready = false;
  let disposed = false;

  /** One frame: holder (place, size, lean) → spinner (turn) → the parts. */
  const frames = pieces.map((piece, index) => {
    const w = piece.aspect >= 1 ? LONG : LONG * piece.aspect;
    const h = piece.aspect >= 1 ? LONG / piece.aspect : LONG;
    const innerW = w - MOULDING * 2 + 0.02;
    const innerH = h - MOULDING * 2 + 0.02;

    const outline = new Shape();
    outline.moveTo(-w / 2, -h / 2);
    outline.lineTo(w / 2, -h / 2);
    outline.lineTo(w / 2, h / 2);
    outline.lineTo(-w / 2, h / 2);
    outline.closePath();
    const opening = new Path();
    const ox = w / 2 - MOULDING;
    const oy = h / 2 - MOULDING;
    opening.moveTo(-ox, -oy);
    opening.lineTo(-ox, oy);
    opening.lineTo(ox, oy);
    opening.lineTo(ox, -oy);
    opening.closePath();
    outline.holes.push(opening);
    const mouldingGeometry = track(new ExtrudeGeometry(outline, { depth: DEPTH, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL, bevelSegments: 3 }));
    mouldingGeometry.translate(0, 0, -DEPTH / 2);

    // The print keeps its exact colours (unlit); a faint glare is added by the glass over it.
    const artMaterial = track(new MeshBasicMaterial({ color: 0xffffff }));
    artMaterial.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <map_fragment>',
        `#ifdef USE_MAP
          diffuseColor *= texture2D( map, vMapUv, ${ART_SHARPEN_BIAS.toFixed(2)} );
        #endif`,
      );
    };
    artMaterial.customProgramCacheKey = () => 'zauq-art';
    const setArt = (texture) => {
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = maxAnisotropy;
      coverTexture(texture, innerW / innerH);
      artMaterial.map = track(texture);
      artMaterial.needsUpdate = true;
    };
    const frameState = { loaded: false };
    const markLoaded = () => {
      frameState.loaded = true;
    };
    if (piece.image) {
      artMaterial.color.set(WAITING_ART);
      loader.load(
        piece.image,
        (texture) => {
          if (disposed) return texture.dispose();
          artMaterial.color.set(0xffffff);
          setArt(texture);
          markLoaded();
          return undefined;
        },
        undefined,
        markLoaded,
      );
    } else {
      const texture = canvasTexture(600, 800, drawCustomArt);
      setArt(texture);
      markLoaded();
      // Redraw once the site's fonts are in, so the label matches the page.
      document.fonts?.ready.then(() => {
        if (disposed) return;
        drawCustomArt(texture.image.getContext('2d'), 600, 800);
        texture.needsUpdate = true;
      });
    }

    const artGeometry = track(new PlaneGeometry(innerW, innerH));
    const art = new Mesh(artGeometry, artMaterial);
    art.position.z = DEPTH / 2 - 0.03;
    const glass = new Mesh(artGeometry, glassMaterial);
    glass.position.z = DEPTH / 2 - 0.026;

    const backTexture = track(canvasTexture(Math.round(w * 600), Math.round(h * 600), drawBack));
    backTexture.anisotropy = maxAnisotropy;
    logoTextures.push([backTexture, drawBack]);
    const back = new Mesh(track(new PlaneGeometry(innerW, innerH)), track(new MeshStandardMaterial({ map: backTexture, roughness: 0.92, metalness: 0 })));
    back.rotation.y = Math.PI;
    back.position.z = -DEPTH / 2 + 0.016;

    // Two hooks on the back of the moulding: one upright on each side rail, halfway up
    // the top half of the frame (the same on portrait and landscape frames). They sit at
    // the rail's inner edge, so the ring never shows past the frame.
    const hooks = [-1, 1].map((side) => {
      const hook = makeHook();
      hook.position.set(side * (w / 2 - 0.037), h / 4 - 0.04, -DEPTH / 2 - BEVEL);
      return hook;
    });

    // The carton that closes around the frame in the last chapter: plain kraft card made
    // to the frame's size, sealed by two bands of our printed tape wrapped right round.
    const cartonW = w + CARTON_MARGIN;
    const cartonH = h + CARTON_MARGIN;
    const carton = new Mesh(track(new BoxGeometry(cartonW, cartonH, CARTON_DEPTH)), kraftMaterial);
    carton.renderOrder = 1;
    // The logo repeats along the tape a whole number of times, so it sits evenly on the carton.
    const printTexture = track(canvasTexture(320, 160, drawLogoTape));
    printTexture.wrapS = RepeatWrapping;
    printTexture.repeat.set(Math.max(1, Math.round(cartonW / TAPE_REPEAT)), 1);
    printTexture.anisotropy = maxAnisotropy;
    logoTextures.push([printTexture, drawLogoTape]);
    const printMaterial = makeTapeMaterial(printTexture);
    tapeMaterials.push(printMaterial);
    const tapeGeometry = track(new BoxGeometry(cartonW + 0.014, TAPE_WIDTH, CARTON_DEPTH + 0.014));
    const tapes = [0.22, 0.78].map((at) => {
      const tape = new Mesh(tapeGeometry, [tapeMaterials[0], tapeMaterials[0], hiddenMaterial, hiddenMaterial, printMaterial, printMaterial]);
      tape.position.y = cartonH * (0.5 - at);
      tape.renderOrder = 2;
      return tape;
    });
    const box = new Group();
    box.add(carton, ...tapes);
    // Decoration only: it never takes clicks.
    box.children.forEach((child) => {
      child.raycast = () => {};
    });
    box.visible = false;

    const spinner = new Group();
    spinner.add(new Mesh(mouldingGeometry, mouldingMaterial), art, glass, back, ...hooks, box);
    const holder = new Group();
    holder.add(spinner);
    holder.userData.index = index;
    scene.add(holder);

    return { holder, spinner, box, tapes, frameState, w, h, x: 0, y: 0, z: -2, s: 0.001, rz: 0, ry: 0, rx: 0, spin: 0, placed: false };
  });

  // The logo uses the site's logo font: redraw the sticker and the tape once it is in.
  if (document.fonts?.load) {
    Promise.all([document.fonts.load(`800 40px ${LOGO_FONT}`), document.fonts.load(`600 12px ${LOGO_FONT}`)])
      .then(() => {
        if (disposed) return;
        logoTextures.forEach(([texture, draw]) => {
          draw(texture.image.getContext('2d'), texture.image.width, texture.image.height);
          texture.needsUpdate = true;
        });
      })
      .catch(() => {});
  }

  // The delivery: the van, the street, the house and the customer (chapters 5 and 6).
  const delivery = createDelivery({ track });
  scene.add(delivery.group);
  const parcelLocal = new Vector3();
  const parcelWorld = new Vector3();

  // Soft olive specks drifting up through the scene.
  const SPECKS = 46;
  const speckPositions = new Float32Array(SPECKS * 3);
  const speckSpeeds = new Float32Array(SPECKS);
  for (let i = 0; i < SPECKS; i += 1) {
    speckPositions[i * 3] = (Math.random() - 0.5) * 12;
    speckPositions[i * 3 + 1] = (Math.random() - 0.5) * 5;
    speckPositions[i * 3 + 2] = -3 + Math.random() * 3.6;
    speckSpeeds[i] = 0.05 + Math.random() * 0.12;
  }
  const speckGeometry = track(new BufferGeometry());
  speckGeometry.setAttribute('position', new BufferAttribute(speckPositions, 3));
  const speckMaterial = track(
    new PointsMaterial({ size: 0.09, map: track(canvasTexture(64, 64, drawDot)), color: OLIVE, transparent: true, opacity: 0.5, depthWrite: false }),
  );
  scene.add(new Points(speckGeometry, speckMaterial));

  // Size and layout
  let worldW = 1;
  const worldH = VIEW_HEIGHT;
  /** Lowered once, a little, only on a device that clearly can't keep the animation smooth. */
  let quality = 1;
  let pace = 1 / 60;
  let settled = 0;
  function resize() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    // As sharp as the screen, within the pixel budget, less whatever a slow device gave up.
    const budget = Math.sqrt(PIXEL_BUDGET / (width * height));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, layout.compact ? 1.5 : 2, budget) * quality);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    worldW = worldH * camera.aspect;
  }
  resize();

  // Everything is prepared up front (shaders compiled, the carton's textures uploaded),
  // so nothing has to be built mid-scroll when the carton first appears.
  renderer.compile(scene, camera);
  [kraftMaterial, ...tapeMaterials].forEach((material) => renderer.initTexture(material.map));
  delivery.group.traverse((child) => {
    if (child.material?.map) renderer.initTexture(child.material.map);
  });

  // If the browser takes the 3D context away, the page falls back to its plain version.
  const onContextLost = () => {
    if (!disposed) onLost?.();
  };
  canvas.addEventListener('webglcontextlost', onContextLost);

  // Pointer: a gentle tilt, hover and click
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const raycaster = new Raycaster();
  const ndc = new Vector2();
  let storyProgress = 0;

  const frameAt = (event) => {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(
      frames.map((frame) => frame.holder),
      true,
    )[0];
    let node = hit?.object;
    while (node && node.userData.index === undefined) node = node.parent;
    return node ? node.userData.index : -1;
  };
  const onPointerMove = (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
    if (event.pointerType === 'mouse' && event.target === canvas) {
      canvas.style.cursor = storyProgress < 0.3 && frameAt(event) >= 0 ? 'pointer' : '';
    }
  };
  const onClick = (event) => {
    if (storyProgress > 0.3) return;
    const index = frameAt(event);
    if (index < 0) return;
    if (index === active) onOpen();
    else onSelect(index);
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  canvas.addEventListener('click', onClick);

  let time = 0;

  /** Advance and draw one frame. `progress` is the scroll position: 0 hero → 6 last chapter. */
  function update(progress, dt) {
    if (disposed) return;
    time += dt;
    storyProgress = progress;
    pointer.sx = damp(pointer.sx, pointer.x, 4, dt);
    pointer.sy = damp(pointer.sy, pointer.y, 4, dt);

    const { compact } = layout;
    const slots = compact ? SLOTS.compact : SLOTS.wide;
    const leave = segment(progress, 0); // 0 in the hero → 1 once the story has begun

    // Wide screens: the frames sit to the right of the copy. Small screens: they fit
    // exactly into the space measured under the copy (hero) or above the text (story).
    // The canvas is taller than the stage: it reaches above (and, on wide screens, below)
    // it, the room the story gains once the header has gone. Positions (`px`) are from the stage top.
    const canvasH = canvas.clientHeight || 1;
    const bleedTop = layout.bleedTop ?? 0;
    const stageH = Math.max(1, canvasH - bleedTop - (layout.bleedBottom ?? 0));
    const worldY = (px) => (0.5 - (px + bleedTop) / canvasH) * worldH;
    const worldLength = (px) => (px / canvasH) * worldH;
    // Sizes given in world units keep to the stage, not to the taller canvas.
    let groupScale = clamp(worldH / 4, 0.8, 1) * (stageH / canvasH);
    let heroX = worldW * 0.21;
    let heroY = -worldH * 0.02;
    let storyX = worldW * 0.2;
    let storyY = 0;
    let storyBase = groupScale;
    let bandTop = 14;
    let bandBottom = stageH * 0.5;
    if (compact) {
      const top = layout.heroTop ?? stageH * 0.45;
      const bottom = Math.max(top + 120, layout.heroBottom ?? stageH - 118);
      groupScale = clamp(Math.min(worldLength(bottom - top) / 3.24, worldW / 3), 0.3, 0.9);
      heroX = 0;
      heroY = worldY((top + bottom) / 2);

      // The story: each chapter gives the frame its own band, above that chapter's text.
      const bands = layout.story;
      if (bands?.length) {
        const at = clamp(progress - 1, 0, bands.length - 1);
        const from = Math.min(Math.floor(at), bands.length - 1);
        const to = Math.min(from + 1, bands.length - 1);
        // It moves to the next band in the gap between the two texts (see apply() in Experience.jsx).
        const t = smoothstep(0.3, 0.7, at - from);
        bandTop = lerp(bands[from].top, bands[to].top, t);
        bandBottom = lerp(bands[from].bottom, bands[to].bottom, t);
      }
      storyBase = clamp(Math.min(worldLength(bandBottom - bandTop) / (frames[active].h * VIEW.zoom), worldW * VIEW.perWidth), 0.3, VIEW.maxScale);
      storyX = 0;
      storyY = worldY((bandTop + bandBottom) / 2);
    }
    const storyScale = storyBase * along(STORY.scale, progress);
    const boxed = segment(progress, 3);

    // The delivery (chapters 5 and 6), fitted into the same space as the story's frame:
    // beside the text on wide screens, in the chapter's band on small ones.
    delivery.update(progress, time, dt);
    const delivering = delivery.group.visible;
    if (delivering) {
      const view = delivery.view(progress);
      const areaW = compact ? worldW * 0.94 : worldW * 0.46;
      const areaH = compact ? worldLength(bandBottom - bandTop) : worldH * 0.55 * (stageH / canvasH);
      const fit = Math.min(areaW / view.width, areaH / view.height);
      delivery.group.scale.setScalar(fit);
      delivery.group.rotation.set(DELIVERY_TILT, DELIVERY_YAW, 0);
      delivery.group.position.set(storyX - view.center * Math.cos(DELIVERY_YAW) * fit, storyY - (view.height / 2) * fit, 0);
      delivery.group.updateMatrixWorld();
    }

    frames.forEach((frame, index) => {
      const isActive = index === active;
      const slot = slots[isActive ? 0 : ((index - active + frames.length) % frames.length) || 1];
      const bob = Math.sin(time * 0.8 + index * 1.7) * 0.06 * (isActive ? 1 - leave * 0.6 : 1);

      let tx = heroX + slot.x * groupScale;
      let ty = heroY + slot.y * groupScale + bob;
      let tz = slot.z;
      let ts = slot.s * groupScale;
      let trz = slot.rz + Math.sin(time * 0.6 + index) * 0.03;
      let try_ = slot.ry + pointer.sx * (isActive ? 0.32 : 0.16);
      let trx = pointer.sy * (isActive ? 0.16 : 0.08);

      if (isActive) {
        tx = lerp(tx, storyX, leave);
        ty = lerp(ty, storyY + bob, leave);
        ts = lerp(ts, storyScale, leave);
        trz *= 1 - leave;
        try_ = try_ * (1 - leave * 0.75) + along(STORY.rotY, progress);
        trx = trx * (1 - leave * 0.75) + along(STORY.rotX, progress);

        // From the box onwards: it shrinks into the street as the camera pulls back,
        // goes into the van, rides along hidden, and comes out to the customer.
        if (delivering) {
          const { mix, hidden } = delivery.parcel(progress, parcelLocal);
          parcelWorld.copy(parcelLocal);
          delivery.group.localToWorld(parcelWorld);
          tx = lerp(tx, parcelWorld.x, mix);
          ty = lerp(ty, parcelWorld.y, mix);
          tz = lerp(tz, parcelWorld.z, mix);
          ts = hidden ? 0 : lerp(ts, (PARCEL_HEIGHT * delivery.group.scale.x) / (frame.h + CARTON_MARGIN), mix);
          try_ = lerp(try_, along(STORY.rotY, progress), mix);
          trx = lerp(trx, along(STORY.rotX, progress), mix);
        }
      } else {
        // The others drift outwards and away as the story starts.
        tx = heroX + slot.x * groupScale * (1 + leave * 1.6);
        ty = heroY + slot.y * groupScale * (1 + leave * 1.6) + bob;
        ts *= 1 - leave;
      }

      if (!frame.placed) {
        // First frame: start in place (slightly small), so nothing flies in from the origin.
        Object.assign(frame, { x: tx, y: ty, z: tz, s: ts * 0.86, rz: trz, ry: try_, rx: trx, placed: true });
      }
      // In the story on a small screen the frame keeps close step with the scroll, so it
      // is never still on its way while the next text arrives under it.
      // In the delivery it keeps closer still, so it stays in the van and in the customer's hands.
      const follow = isActive && delivering ? 16 : compact && isActive && leave > 0.5 ? 10 : 5;
      const glide = isActive && delivering ? 16 : 5;
      frame.x = damp(frame.x, tx, glide, dt);
      frame.y = damp(frame.y, ty, follow, dt);
      frame.z = damp(frame.z, tz, glide, dt);
      frame.s = damp(frame.s, ts, follow, dt);
      frame.rz = damp(frame.rz, trz, 5, dt);
      frame.ry = damp(frame.ry, try_, 6, dt);
      frame.rx = damp(frame.rx, trx, 6, dt);
      frame.spin = damp(frame.spin, 0, 3.2, dt);

      frame.holder.position.set(frame.x, frame.y, frame.z);
      frame.holder.scale.setScalar(Math.max(frame.s, 0.0001));
      frame.holder.rotation.z = frame.rz;
      frame.holder.visible = frame.s > 0.01;
      frame.spinner.rotation.set(frame.rx, frame.ry + frame.spin, 0);

      // The carton settles over the frame, then the tape is wrapped round it.
      frame.box.visible = isActive && boxed > 0.01;
      if (frame.box.visible) {
        frame.box.scale.setScalar(lerp(1.06, 1, smoothstep(0.1, 0.7, boxed)));
        const wrap = Math.max(smoothstep(0.55, 0.95, boxed), 0.001);
        frame.tapes.forEach((tape) => tape.scale.set(wrap, 1, 1));
      }
    });
    kraftMaterial.opacity = smoothstep(0.1, 0.55, boxed);
    const tapeOpacity = smoothstep(0.55, 0.9, boxed);
    tapeMaterials.forEach((material) => {
      material.opacity = tapeOpacity;
    });

    for (let i = 0; i < SPECKS; i += 1) {
      speckPositions[i * 3 + 1] += speckSpeeds[i] * dt;
      if (speckPositions[i * 3 + 1] > 2.6) speckPositions[i * 3 + 1] = -2.6;
    }
    speckGeometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);

    // Shown only once every picture is in, so nothing pops in afterwards. The entrance:
    // the frames start a little small and grow into place as the canvas fades in.
    if (!ready && frames.every((frame) => frame.frameState.loaded)) {
      ready = true;
      if (progress < 0.3) {
        frames.forEach((frame) => {
          frame.s *= 0.84;
        });
      }
      onReady();
    }

    // Keep it smooth: if frames keep arriving slowly, draw fewer pixels from here on.
    if (ready) {
      pace = lerp(pace, dt, 0.06);
      settled += 1;
      // About 3 s of under ~22 frames a second, after the first 3 s (when loading is done).
      if (time > 3 && settled > 180 && pace > 0.045 && quality === 1) {
        quality = 0.85;
        settled = 0;
        pace = 1 / 60;
        resize();
      }
    }
  }

  return {
    update,
    resize,
    /** Bring another frame to the front (it turns once on its way in). */
    setActive(index) {
      if (index === active) return;
      active = index;
      frames[index].spin = -Math.PI * 2;
    },
    /** Where the frames may sit, measured by the page (see the Layout type). */
    setLayout(next) {
      layout = next;
      resize();
    },
    dispose() {
      disposed = true;
      window.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.style.cursor = '';
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
    },
  };
}
