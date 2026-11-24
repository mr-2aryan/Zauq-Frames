/**
 * The last two chapters of the home story, in plain three.js: a delivery van
 * backs up, the packed frame goes into it, the van drives off, pulls up at a
 * house where the customer is waiting outside to receive it — happily.
 *
 * Built from simple shapes in the site's colours. Everything is a function of
 * the scroll position (`progress`, 4 → 6), so scrolling back plays it in
 * reverse; only the idle loops (wheels and road while driving, the customer's
 * hop and hearts) also use time.
 *
 * Local units: the ground is y = 0, the road runs along x, the house stands
 * behind it (−z). The van is 2 long and faces −x (its rear doors are at +x).
 */
import {
  BoxGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
  Shape,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
} from 'three';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};
const easeOut = (t) => 1 - (1 - t) ** 3;

/** The scene is seen from a little to the right and above. */
export const DELIVERY_YAW = -0.42;
export const DELIVERY_TILT = 0.14;
/** Height of the packed frame here (the customer is about 0.95 tall, the van 1.25). */
export const PARCEL_HEIGHT = 0.36;

const WHEEL_R = 0.2;
const HOUSE_X = 1.6;
/** The street's middle: a little right of the van, under the whole scene. */
const ROAD_X = 0.8;
const PICKUP = new Vector3(1.55, PARCEL_HEIGHT / 2, 0.16);
const REAR_DOOR = new Vector3(1.25, 0.6, 0);
const IN_VAN = new Vector3(0.55, 0.6, 0);

/**
 * What to frame on screen, by phase: the centre (x), width and height of the
 * part of the scene that should fit the space beside the story's text.
 */
const VIEWS = {
  load: { center: 0.42, width: 3.4, height: 1.5 },
  drive: { center: 0, width: 3, height: 1.45 },
  delivered: { center: 0.74, width: 4.6, height: 2.2 },
};

function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/** A soft round shadow, for under the van, the house and the customer. */
function drawShadow(ctx, w, h) {
  const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  gradient.addColorStop(0, 'rgba(30, 30, 20, 0.42)');
  gradient.addColorStop(1, 'rgba(30, 30, 20, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

/** Fades a strip in at its left end and out at its right, so it has no hard ends. */
function fadeEnds(ctx, w, h) {
  ctx.globalCompositeOperation = 'destination-in';
  const gradient = ctx.createLinearGradient(0, 0, w, 0);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.18, 'rgba(0,0,0,1)');
  gradient.addColorStop(0.82, 'rgba(0,0,0,1)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
}

function drawRoad(ctx, w, h) {
  ctx.fillStyle = '#6a6f5d';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillRect(0, 3, w, 3);
  ctx.fillRect(0, h - 6, w, 3);
  fadeEnds(ctx, w, h);
}

function drawPavement(ctx, w, h) {
  ctx.fillStyle = '#d9d6c8';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(120, 110, 90, 0.25)';
  for (let x = 0; x < w; x += 32) ctx.fillRect(x, 0, 2, h);
  fadeEnds(ctx, w, h);
}

function drawDash(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#f5f2e6';
  ctx.fillRect(w * 0.15, 0, w * 0.5, h);
}

/** Opaque in the middle, clear at both ends (an alpha map for the dashes). */
function drawFade(ctx, w, h) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  fadeEnds(ctx, w, h);
}

function drawLawn(ctx, w, h) {
  const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  gradient.addColorStop(0, 'rgba(173, 190, 128, 1)');
  gradient.addColorStop(0.7, 'rgba(173, 190, 128, 0.9)');
  gradient.addColorStop(1, 'rgba(173, 190, 128, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

/** Letter-spaced text, centred on `cx`. */
function spaced(ctx, text, cx, y, spacing) {
  const letters = [...text];
  const widths = letters.map((letter) => ctx.measureText(letter).width);
  let x = cx - (widths.reduce((sum, width) => sum + width, 0) + spacing * (letters.length - 1)) / 2;
  ctx.textAlign = 'left';
  letters.forEach((letter, index) => {
    ctx.fillText(letter, x, y);
    x += widths[index] + spacing;
  });
}

/** The van's livery: ZAUQ / PREMIUM FRAMES / zauqframes.com, in white. */
function drawVanLogo(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#ffffff';
  const font = '"Bricolage Grotesque", Urbanist, system-ui, sans-serif';
  ctx.font = `800 ${h * 0.42}px ${font}`;
  spaced(ctx, 'ZAUQ', w / 2, h * 0.5, h * 0.07);
  ctx.font = `700 ${h * 0.1}px ${font}`;
  spaced(ctx, 'PREMIUM FRAMES', w / 2, h * 0.68, h * 0.045);
  ctx.fillRect(w * 0.34, h * 0.77, w * 0.32, Math.max(2, h * 0.008));
  ctx.font = `600 ${h * 0.085}px Urbanist, system-ui, sans-serif`;
  spaced(ctx, 'zauqframes.com', w / 2, h * 0.9, h * 0.012);
}

function drawHeart(ctx, w) {
  ctx.clearRect(0, 0, w, w);
  ctx.fillStyle = '#e8435f';
  const s = w / 32;
  ctx.translate(w * 0.04, w * 0.04);
  ctx.scale(0.92, 0.92);
  ctx.beginPath();
  ctx.moveTo(16 * s, 28 * s);
  ctx.bezierCurveTo(4 * s, 20 * s, 2 * s, 12 * s, 6 * s, 7 * s);
  ctx.bezierCurveTo(10 * s, 2 * s, 15 * s, 4 * s, 16 * s, 9 * s);
  ctx.bezierCurveTo(17 * s, 4 * s, 22 * s, 2 * s, 26 * s, 7 * s);
  ctx.bezierCurveTo(30 * s, 12 * s, 28 * s, 20 * s, 16 * s, 28 * s);
  ctx.closePath();
  ctx.lineWidth = 2.4 * s;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  ctx.fill();
}

/**
 * @param {{ track: <T>(item: T) => T }} options `track` registers anything that must be disposed.
 */
export function createDelivery({ track }) {
  const group = new Group();
  group.visible = false;

  const standard = (color, extra = {}) => track(new MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...extra }));
  const basic = (color, extra = {}) => track(new MeshBasicMaterial({ color, ...extra }));
  const mesh = (geometry, material, x = 0, y = 0, z = 0) => {
    const item = new Mesh(track(geometry), material);
    item.position.set(x, y, z);
    return item;
  };
  const flat = (item) => {
    item.rotation.x = -Math.PI / 2;
    return item;
  };

  const shadowTexture = track(canvasTexture(128, 128, drawShadow));
  const shadowMaterial = basic(0xffffff, { map: shadowTexture, transparent: true, depthWrite: false });
  const shadow = (w, d, x = 0, z = 0) => flat(mesh(new PlaneGeometry(w, d), shadowMaterial, x, 0.004, z));

  // ---------- The street ----------
  const fadeTexture = track(canvasTexture(512, 8, drawFade));
  const roadMaterial = basic(0xffffff, { map: track(canvasTexture(1024, 64, drawRoad)), transparent: true, depthWrite: false });
  // The street is only as long as the scene needs, so it never runs under the story's text.
  const road = flat(mesh(new PlaneGeometry(7, 1.1), roadMaterial, ROAD_X, 0, 0));
  const dashTexture = track(canvasTexture(64, 8, drawDash));
  dashTexture.wrapS = RepeatWrapping;
  dashTexture.repeat.set(7, 1);
  const dashMaterial = basic(0xffffff, { map: dashTexture, alphaMap: fadeTexture, transparent: true, depthWrite: false });
  const dashes = flat(mesh(new PlaneGeometry(7, 0.05), dashMaterial, ROAD_X, 0.002, 0));
  const pavementMaterial = basic(0xffffff, { map: track(canvasTexture(1024, 32, drawPavement)), transparent: true, depthWrite: false });
  const pavement = flat(mesh(new PlaneGeometry(7, 0.28), pavementMaterial, ROAD_X, 0.001, -0.7));
  group.add(road, dashes, pavement);

  // Trees passing behind while the van drives: a near row and a slower far row, for
  // depth — rounded trees and conifers. Each has its own materials, so it fades in and
  // out at the edges of the street instead of popping.
  const canopyGeometry = track(new SphereGeometry(1, 20, 16));
  const trunkGeometry = track(new CylinderGeometry(0.03, 0.055, 0.42, 10));
  const coneGeometry = track(new ConeGeometry(1, 1, 16));
  const fading = (color) => standard(color, { transparent: true, roughness: 0.9 });
  const trees = [];
  [false, true].forEach((far) => {
    [0, 1, 2, 3].forEach((index) => {
      const tree = new Group();
      const trunk = new Mesh(trunkGeometry, fading(0x6b4a2f));
      trunk.position.y = 0.21;
      tree.add(trunk);
      const materials = [trunk.material];
      if ((index + (far ? 1 : 0)) % 3 === 2) {
        // A conifer: three stacked cones.
        const needles = fading(0x3f5a2e);
        const tips = fading(0x557a3a);
        materials.push(needles, tips);
        [
          [0.38, 0.28, 0.34, needles],
          [0.6, 0.22, 0.3, tips],
          [0.8, 0.15, 0.26, needles],
        ].forEach(([y, r, height, material]) => {
          const cone = new Mesh(coneGeometry, material);
          cone.position.y = y;
          cone.scale.set(r, height, r);
          tree.add(cone);
        });
      } else {
        // A rounded tree: a darker underside, lighter crown and a highlight.
        const shade = fading(0x5d7a33);
        const leaves = fading(index % 2 ? 0x7f9a45 : 0x739140);
        const light = fading(0x9bb65c);
        materials.push(shade, leaves, light);
        [
          [0, 0.55, 0, 0.25, shade],
          [0.12, 0.68, 0.06, 0.19, leaves],
          [-0.13, 0.66, 0.04, 0.18, leaves],
          [0.02, 0.8, 0.03, 0.16, leaves],
          [-0.05, 0.84, 0.11, 0.08, light],
        ].forEach(([x, y, z, r, material]) => {
          const blob = new Mesh(canopyGeometry, material);
          blob.position.set(x, y, z);
          blob.scale.set(r, r * 0.92, r);
          tree.add(blob);
        });
      }
      tree.scale.setScalar(far ? 0.72 : 1 + (index % 2) * 0.14);
      tree.position.z = far ? -1.75 : -1.05;
      tree.userData = { base: index * 2.1 - (far ? 2.1 : 3.15), far, materials };
      group.add(tree);
      trees.push(tree);
    });
  });

  // Soft clouds drifting overhead.
  const clouds = [0, 1, 2].map((index) => {
    const cloud = new Group();
    const material = standard(0xffffff, { transparent: true, roughness: 1, emissive: 0xffffff, emissiveIntensity: 0.25 });
    [
      [0, 0, 0.22],
      [0.22, -0.03, 0.16],
      [-0.2, -0.04, 0.15],
    ].forEach(([x, y, r]) => {
      const puff = new Mesh(canopyGeometry, material);
      puff.position.set(x, y, 0);
      puff.scale.set(r, r * 0.7, r * 0.7);
      cloud.add(puff);
    });
    cloud.userData = { base: index * 2.6 - 2.4, height: 1.62 + (index % 2) * 0.2, material };
    cloud.position.z = -2.3;
    group.add(cloud);
    return cloud;
  });

  // ---------- The van: olive, with white trim and the Zauq livery ----------
  const van = new Group();
  const body = new Group();
  van.add(body);
  const olive = standard(0x3e4a1f, { roughness: 0.42, metalness: 0.15 });
  const white = standard(0xf6f4ec, { roughness: 0.45 });
  const glass = standard(0x1f2a2a, { roughness: 0.15, metalness: 0.4 });
  const dark = standard(0x23261d, { roughness: 0.8 });
  const rubber = standard(0x1b1d17, { roughness: 0.9 });
  const steel = standard(0xe7e7e1, { roughness: 0.3, metalness: 0.55 });

  const profile = new Shape();
  profile.moveTo(1.02, 0.2);
  profile.lineTo(1.02, 1.18);
  profile.lineTo(-0.3, 1.18);
  profile.lineTo(-0.66, 0.84);
  profile.lineTo(-0.98, 0.72);
  profile.lineTo(-1.0, 0.2);
  profile.closePath();
  const bodyGeometry = new ExtrudeGeometry(profile, { depth: 0.84, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 4 });
  bodyGeometry.translate(0, 0, -0.42);
  body.add(mesh(bodyGeometry, olive));
  // White: a band right round the van, a fine pinstripe and the roof of the cargo box.
  body.add(mesh(new BoxGeometry(2.12, 0.08, 0.94), white, 0.01, 0.36, 0));
  body.add(mesh(new BoxGeometry(2.12, 0.014, 0.935), white, 0.01, 0.43, 0));
  body.add(mesh(new BoxGeometry(1.34, 0.03, 0.9), white, 0.35, 1.215, 0));
  // Windscreen and side windows.
  const screen = mesh(new PlaneGeometry(0.78, 0.44), glass);
  const slopeMid = new Vector3(-0.48, 1.01, 0);
  const slopeNormal = new Vector3(-0.34, 0.36, 0).normalize();
  screen.position.copy(slopeMid).addScaledVector(slopeNormal, 0.047);
  screen.lookAt(slopeMid.clone().addScaledVector(slopeNormal, 2));
  body.add(screen);
  const sideWindow = new Shape();
  sideWindow.moveTo(-0.08, 1.12);
  sideWindow.lineTo(-0.31, 1.12);
  sideWindow.lineTo(-0.6, 0.86);
  sideWindow.lineTo(-0.08, 0.86);
  sideWindow.closePath();
  const sideWindowGeometry = track(new ExtrudeGeometry(sideWindow, { depth: 0.002, bevelEnabled: false }));
  // The livery: the Zauq logo in white on both sides of the cargo box.
  const logoTexture = track(canvasTexture(1024, 512, drawVanLogo));
  const logoMaterial = basic(0xffffff, { map: logoTexture, transparent: true, depthWrite: false });
  const seam = basic(0x262e12);
  [1, -1].forEach((side) => {
    const pane = new Mesh(sideWindowGeometry, glass);
    pane.position.z = side * 0.462;
    if (side < 0) pane.position.z -= 0.002;
    body.add(pane);
    const logo = mesh(new PlaneGeometry(1.06, 0.53), logoMaterial, 0.45, 0.8, side * 0.4635);
    if (side < 0) logo.rotation.y = Math.PI;
    body.add(logo);
    // Door seams, a handle, the mirror and an amber side light.
    body.add(mesh(new BoxGeometry(0.008, 0.62, 0.004), seam, -0.05, 0.68, side * 0.463));
    body.add(mesh(new BoxGeometry(0.008, 0.78, 0.004), seam, 0.95, 0.68, side * 0.463));
    body.add(mesh(new BoxGeometry(0.1, 0.028, 0.02), white, -0.2, 0.74, side * 0.468));
    body.add(mesh(new BoxGeometry(0.09, 0.11, 0.05), white, -0.66, 0.86, side * 0.495));
    body.add(mesh(new BoxGeometry(0.06, 0.03, 0.01), basic(0xf0a33a), -0.85, 0.47, side * 0.464));
  });
  // Front: grille, headlights; back: tail lights. Bumpers all round.
  const headlight = basic(0xfff4c9);
  const taillight = basic(0xc0392b);
  body.add(mesh(new BoxGeometry(0.02, 0.12, 0.44), dark, -1.045, 0.34, 0));
  [1, -1].forEach((side) => {
    body.add(mesh(new BoxGeometry(0.02, 0.08, 0.15), headlight, -1.045, 0.5, side * 0.31));
    body.add(mesh(new BoxGeometry(0.02, 0.15, 0.05), taillight, 1.065, 0.36, side * 0.43));
  });
  body.add(mesh(new BoxGeometry(0.07, 0.08, 0.92), dark, -1.07, 0.22, 0));
  body.add(mesh(new BoxGeometry(0.07, 0.08, 0.92), dark, 1.08, 0.22, 0));
  // The cargo opening, seen when the rear doors swing open.
  const opening = mesh(new PlaneGeometry(0.8, 0.88), basic(0x1d211a), 1.063, 0.68, 0);
  opening.rotation.y = Math.PI / 2;
  body.add(opening);
  const doorGeometry = new BoxGeometry(0.02, 0.88, 0.4);
  const doors = [1, -1].map((side) => {
    const pivot = new Group();
    pivot.position.set(1.073, 0.68, side * 0.41);
    pivot.add(mesh(doorGeometry, olive, 0.01, 0, -side * 0.2));
    pivot.add(mesh(new BoxGeometry(0.022, 0.07, 0.4), white, 0.012, -0.32, -side * 0.2));
    pivot.add(mesh(new BoxGeometry(0.02, 0.06, 0.07), white, 0.025, -0.05, -side * 0.34));
    pivot.userData.side = side;
    body.add(pivot);
    return pivot;
  });
  // Wheels: tyres, white hub caps and wheel nuts (so the turning shows), dark arches.
  const archGeometry = new CircleGeometry(0.25, 24, 0, Math.PI);
  const tireGeometry = new CylinderGeometry(WHEEL_R, WHEEL_R, 0.12, 28);
  const hubGeometry = new CylinderGeometry(0.11, 0.11, 0.128, 20);
  const nutGeometry = track(new CylinderGeometry(0.014, 0.014, 0.132, 8));
  const wheels = [];
  [-0.62, 0.62].forEach((x) => {
    [1, -1].forEach((side) => {
      const arch = mesh(archGeometry, dark, x, 0.2, side * 0.463);
      if (side < 0) arch.rotation.y = Math.PI;
      van.add(arch);
      const wheel = new Group();
      wheel.position.set(x, WHEEL_R, side * 0.43);
      const tire = mesh(tireGeometry, rubber);
      tire.rotation.x = Math.PI / 2;
      const hub = mesh(hubGeometry, steel);
      hub.rotation.x = Math.PI / 2;
      wheel.add(tire, hub);
      for (let n = 0; n < 5; n += 1) {
        const angle = (n / 5) * Math.PI * 2;
        const nut = new Mesh(nutGeometry, dark);
        nut.rotation.x = Math.PI / 2;
        nut.position.set(Math.cos(angle) * 0.055, Math.sin(angle) * 0.055, 0);
        wheel.add(nut);
      }
      van.add(wheel);
      wheels.push(wheel);
    });
  });
  van.add(shadow(2.7, 1.4));
  // Little puffs from the exhaust while it drives.
  const puffs = [0, 1, 2].map(() => {
    const puff = new Mesh(canopyGeometry, standard(0xd9dbd2, { transparent: true, roughness: 1 }));
    van.add(puff);
    return puff;
  });
  group.add(van);

  // ---------- The house ----------
  const house = new Group();
  const walls = standard(0xf4eee2, { roughness: 0.9 });
  const trim = standard(0xffffff, { roughness: 0.6 });
  const terracotta = standard(0xb4553a, { roughness: 0.7 });
  const shutter = standard(0x4f5c2a, { roughness: 0.6 });
  const plantGreen = standard(0x6f8a3a, { roughness: 0.9 });
  house.add(flat(mesh(new PlaneGeometry(2.8, 1.6), basic(0xffffff, { map: track(canvasTexture(256, 128, drawLawn)), transparent: true, depthWrite: false }), 0, 0.001, -1.3)));
  // Walls on a stone plinth.
  house.add(mesh(new BoxGeometry(1.56, 0.08, 0.96), standard(0xc9c4b4), 0, 0.04, -1.5));
  house.add(mesh(new BoxGeometry(1.5, 0.95, 0.9), walls, 0, 0.475, -1.5));
  // Roof: terracotta, with a ridge, a white trim along its front edge, and a chimney.
  const gable = new Shape();
  gable.moveTo(-0.6, 0);
  gable.lineTo(0.6, 0);
  gable.lineTo(0, 0.5);
  gable.closePath();
  const roofGeometry = new ExtrudeGeometry(gable, { depth: 1.66, bevelEnabled: false });
  roofGeometry.rotateY(Math.PI / 2);
  roofGeometry.translate(-0.83, 0.95, -1.5);
  house.add(mesh(roofGeometry, terracotta));
  house.add(mesh(new BoxGeometry(1.7, 0.045, 0.07), standard(0x8f3f2a), 0, 1.45, -1.5));
  house.add(mesh(new BoxGeometry(1.7, 0.03, 0.05), trim, 0, 0.95, -0.905));
  house.add(mesh(new BoxGeometry(0.15, 0.34, 0.15), standard(0x8f4a35), 0.44, 1.32, -1.64));
  house.add(mesh(new BoxGeometry(0.19, 0.04, 0.19), trim, 0.44, 1.5, -1.64));
  // Front door (it opens inwards): white frame, the dark hall behind, olive panels, brass knob.
  house.add(mesh(new BoxGeometry(0.4, 0.64, 0.02), trim, 0, 0.32, -1.047));
  house.add(mesh(new PlaneGeometry(0.3, 0.56), basic(0x2a241c), 0, 0.28, -1.035));
  const doorPivot = new Group();
  doorPivot.position.set(-0.15, 0, -1.03);
  doorPivot.add(mesh(new BoxGeometry(0.3, 0.56, 0.03), shutter, 0.15, 0.28, 0));
  [0.17, 0.39].forEach((y) => doorPivot.add(mesh(new BoxGeometry(0.2, 0.15, 0.01), standard(0x5d6b34), 0.15, y, 0.018)));
  doorPivot.add(mesh(new SphereGeometry(0.018, 12, 10), standard(0xd9a441, { metalness: 0.6, roughness: 0.3 }), 0.26, 0.28, 0.025));
  house.add(doorPivot);
  // A little canopy over the door, and a wall lamp beside it.
  house.add(mesh(new BoxGeometry(0.52, 0.035, 0.2), terracotta, 0, 0.7, -0.96));
  house.add(mesh(new BoxGeometry(0.06, 0.09, 0.05), dark, 0.27, 0.5, -1.03));
  house.add(mesh(new SphereGeometry(0.022, 10, 8), basic(0xffe3a0), 0.27, 0.49, -1.0));
  // Windows: white frames, olive shutters and a flower box.
  [-0.5, 0.5].forEach((x) => {
    house.add(mesh(new BoxGeometry(0.32, 0.3, 0.02), trim, x, 0.58, -1.046));
    house.add(mesh(new BoxGeometry(0.26, 0.24, 0.02), standard(0xcfe0e8, { roughness: 0.15, metalness: 0.2 }), x, 0.58, -1.04));
    house.add(mesh(new BoxGeometry(0.02, 0.24, 0.025), trim, x, 0.58, -1.036));
    house.add(mesh(new BoxGeometry(0.26, 0.02, 0.025), trim, x, 0.58, -1.036));
    [-1, 1].forEach((side) => house.add(mesh(new BoxGeometry(0.08, 0.3, 0.02), shutter, x + side * 0.21, 0.58, -1.044)));
    house.add(mesh(new BoxGeometry(0.3, 0.06, 0.07), terracotta, x, 0.41, -1.02));
    [-0.09, -0.03, 0.03, 0.09].forEach((dx, n) => house.add(mesh(new SphereGeometry(0.03, 10, 8), basic([0xe07a8f, 0xf2c14e, 0xe07a8f, 0xffffff][n]), x + dx, 0.46, -1.01)));
  });
  // A window on the side wall too.
  const sidePane = mesh(new BoxGeometry(0.02, 0.26, 0.3), standard(0xcfe0e8, { roughness: 0.15, metalness: 0.2 }), 0.752, 0.58, -1.5);
  house.add(mesh(new BoxGeometry(0.02, 0.32, 0.36), trim, 0.751, 0.58, -1.5), sidePane);
  // Step, a stone path and a white picket fence either side of it.
  house.add(mesh(new BoxGeometry(0.44, 0.05, 0.14), standard(0xd9d6c8), 0, 0.025, -0.98));
  [-0.86, -0.72, -0.58].forEach((z, n) => house.add(flat(mesh(new CircleGeometry(0.09, 16), basic(0xe1d7bf), (n - 1) * 0.03, 0.004, z))));
  [-1, 1].forEach((side) => {
    for (let n = 0; n < 6; n += 1) {
      house.add(mesh(new BoxGeometry(0.03, 0.2, 0.02), trim, side * (0.22 + n * 0.1), 0.1, -0.84));
    }
    house.add(mesh(new BoxGeometry(0.58, 0.025, 0.02), trim, side * 0.47, 0.13, -0.835));
    house.add(mesh(new BoxGeometry(0.58, 0.025, 0.02), trim, side * 0.47, 0.06, -0.835));
  });
  // Bushes and two potted plants.
  [-0.7, 0.7].forEach((x) => house.add(mesh(new SphereGeometry(0.13, 16, 12), plantGreen, x, 0.11, -0.98)));
  [-0.32, 0.32].forEach((x) => {
    house.add(mesh(new CylinderGeometry(0.06, 0.045, 0.1, 12), terracotta, x, 0.05, -0.97));
    house.add(mesh(new SphereGeometry(0.08, 12, 10), plantGreen, x, 0.15, -0.97));
  });
  house.add(shadow(2, 1.1, 0, -1.45));
  house.visible = false;
  group.add(house);

  // ---------- The customer: in a terracotta kurta ----------
  const customer = new Group();
  const figure = new Group();
  figure.scale.setScalar(1.12);
  customer.add(figure);
  const kurta = standard(0xc8643b, { roughness: 0.8 });
  const trousers = standard(0xeee6d3, { roughness: 0.85 });
  const shoes = standard(0x6b4a2f, { roughness: 0.6 });
  const skin = standard(0xb97a4e, { roughness: 0.7 });
  const skinShade = standard(0xa86c43, { roughness: 0.7 });
  const hair = standard(0x1b1612, { roughness: 0.9 });
  const ink = basic(0x15140f);
  const legs = [-0.055, 0.055].map((x) => {
    const hip = new Group();
    hip.position.set(x, 0.3, 0);
    hip.add(mesh(new CapsuleGeometry(0.045, 0.2, 4, 12), trousers, 0, -0.145, 0));
    hip.add(mesh(new BoxGeometry(0.075, 0.04, 0.13), shoes, 0, -0.28, 0.025));
    figure.add(hip);
    return hip;
  });
  // The kurta: body, its hem flaring a little, a collar and a line of buttons.
  figure.add(mesh(new CapsuleGeometry(0.11, 0.2, 8, 16), kurta, 0, 0.47, 0));
  figure.add(mesh(new CylinderGeometry(0.112, 0.135, 0.15, 18, 1, true), kurta, 0, 0.32, 0));
  figure.add(mesh(new CylinderGeometry(0.045, 0.05, 0.035, 14), standard(0x9f4a2b), 0, 0.64, 0));
  [0.58, 0.53, 0.48].forEach((y) => figure.add(mesh(new SphereGeometry(0.008, 8, 6), standard(0xe8c27a, { metalness: 0.5, roughness: 0.3 }), 0, y, 0.105)));
  figure.add(mesh(new CylinderGeometry(0.034, 0.038, 0.05, 12), skin, 0, 0.665, 0));
  const arms = [-1, 1].map((side) => {
    const shoulder = new Group();
    shoulder.position.set(side * 0.15, 0.57, 0);
    shoulder.add(mesh(new CapsuleGeometry(0.037, 0.18, 4, 12), kurta, 0, -0.11, 0));
    shoulder.add(mesh(new SphereGeometry(0.036, 12, 10), skin, 0, -0.23, 0));
    shoulder.userData.side = side;
    figure.add(shoulder);
    return shoulder;
  });
  // The head (it tilts when happy): hair with a fringe, ears, eyebrows, nose,
  // eyes that smile, rosy cheeks and a big smile.
  const head = new Group();
  head.position.y = 0.78;
  head.add(mesh(new SphereGeometry(0.112, 24, 18), skin));
  head.add(mesh(new SphereGeometry(0.118, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.48), hair, 0, 0.016, -0.014));
  const fringe = mesh(new SphereGeometry(0.06, 16, 10), hair, -0.03, 0.075, 0.07);
  fringe.scale.set(1.5, 0.5, 0.8);
  head.add(fringe);
  [-1, 1].forEach((side) => head.add(mesh(new SphereGeometry(0.024, 10, 8), skinShade, side * 0.11, -0.005, 0)));
  const eyes = [-0.038, 0.038].map((x) => {
    const eye = mesh(new SphereGeometry(0.013, 10, 8), ink, x, 0.016, 0.101);
    head.add(eye);
    const brow = mesh(new BoxGeometry(0.03, 0.007, 0.008), ink, x, 0.045, 0.098);
    brow.rotation.z = x < 0 ? 0.15 : -0.15;
    head.add(brow);
    head.add(mesh(new CircleGeometry(0.023, 16), basic(0xe27a6a, { transparent: true, opacity: 0.8 }), x * 1.75, -0.024, 0.091));
    return eye;
  });
  head.add(mesh(new SphereGeometry(0.014, 10, 8), skinShade, 0, -0.004, 0.11));
  const smile = mesh(new TorusGeometry(0.04, 0.008, 8, 20, Math.PI), ink, 0, -0.024, 0.102);
  smile.rotation.z = Math.PI;
  head.add(smile);
  figure.add(head);
  customer.add(shadow(0.5, 0.3));
  // Hearts float up when the box arrives: drawn on top of everything, so they're always seen.
  const heartMaterial = track(
    new SpriteMaterial({ map: track(canvasTexture(64, 64, (ctx, w) => drawHeart(ctx, w))), transparent: true, depthWrite: false, depthTest: false }),
  );
  const hearts = [0, 1, 2].map(() => {
    const heart = new Sprite(heartMaterial.clone());
    track(heart.material);
    heart.scale.setScalar(0.16);
    heart.renderOrder = 10;
    customer.add(heart);
    return heart;
  });
  customer.visible = false;
  group.add(customer);

  // The van's livery uses the logo font: redraw it once that has loaded.
  document.fonts?.load?.('800 40px "Bricolage Grotesque"')
    .then(() => {
      drawVanLogo(logoTexture.image.getContext('2d'), logoTexture.image.width, logoTexture.image.height);
      logoTexture.needsUpdate = true;
    })
    .catch(() => {});

  // Everything here is decoration: it never takes clicks.
  group.traverse((child) => {
    child.raycast = () => {};
  });

  let wheelAngle = 0;
  let roadTravel = 0;
  let lastVanX = null;
  const hands = new Vector3();

  /** Where the packed frame is in this scene, in its local units (see `parcel`). */
  function parcelLocal(progress, out) {
    const load = smoothstep(4.5, 4.76, progress);
    const unload = smoothstep(5.72, 5.9, progress);
    if (progress < 4.5) return out.copy(PICKUP);
    if (progress < 4.8) {
      // Up into the back of the van.
      if (load < 0.5) out.lerpVectors(PICKUP, REAR_DOOR, load * 2);
      else out.lerpVectors(REAR_DOOR, IN_VAN, (load - 0.5) * 2);
      out.y += Math.sin(Math.min(load * 2, 1) * Math.PI) * 0.18;
      return out;
    }
    if (progress < 5.72) return out.copy(IN_VAN);
    // Out of the van and into the customer's hands.
    if (unload < 0.4) out.lerpVectors(IN_VAN, REAR_DOOR, unload / 0.4);
    else out.lerpVectors(REAR_DOOR, hands, (unload - 0.4) / 0.6);
    out.y += Math.sin(clamp((unload - 0.4) / 0.6, 0, 1) * Math.PI) * 0.22;
    return out;
  }

  return {
    group,

    /** The part of the scene to fit on screen at this point of the story. */
    view(progress) {
      const toDrive = smoothstep(4.86, 5.06, progress);
      const toHouse = smoothstep(5.25, 5.62, progress);
      const pick = (key) => lerp(lerp(VIEWS.load[key], VIEWS.drive[key], toDrive), VIEWS.delivered[key], toHouse);
      return { center: pick('center'), width: pick('width'), height: pick('height') };
    },

    /**
     * The packed frame for this point of the story: how far it has moved from the
     * story (`mix`, 0 → 1), and — once here — whether it is hidden inside the van.
     * `local` receives its position in this scene's local units.
     */
    parcel(progress, local) {
      parcelLocal(progress, local);
      const mix = easeOut(smoothstep(4.04, 4.34, progress));
      const hidden = progress > 4.78 && progress < 5.73;
      return { mix, hidden };
    },

    /** Move everything for this point of the story. */
    update(progress, time, dt) {
      const on = progress > 4.02;
      group.visible = on;
      if (!on) {
        lastVanX = null;
        return;
      }

      // The street fades in as the camera pulls back.
      const street = smoothstep(4.02, 4.22, progress);
      roadMaterial.opacity = street;
      dashMaterial.opacity = street;
      pavementMaterial.opacity = street;

      // The van backs in, waits, then drives off — and later stops at the house.
      const vanX = lerp(-6.5, 0, easeOut(smoothstep(4.04, 4.4, progress)));
      van.position.x = vanX;
      const speed = smoothstep(4.88, 5.02, progress) * (1 - smoothstep(5.42, 5.62, progress));
      roadTravel += speed * dt * 1.8;
      wheelAngle += (lastVanX === null ? 0 : -(vanX - lastVanX) / WHEEL_R) + (speed * dt * 1.8) / WHEEL_R;
      lastVanX = vanX;
      wheels.forEach((wheel) => {
        wheel.rotation.z = wheelAngle;
      });
      // While driving: a gentle bounce and sway, and puffs from the exhaust.
      body.position.y = Math.sin(time * 17) * 0.006 * speed;
      van.rotation.z = Math.sin(time * 2.3) * 0.006 * speed;
      van.position.x += Math.sin(time * 0.9) * 0.035 * speed;
      puffs.forEach((puff, index) => {
        const phase = (time * 1.5 + index / 3) % 1;
        puff.position.set(1.1 + phase * 0.55, 0.16 + phase * 0.14, 0.32);
        puff.scale.setScalar(0.035 + phase * 0.09);
        puff.material.opacity = speed * (1 - phase) * 0.55;
        puff.visible = speed > 0.01;
      });
      dashTexture.offset.x = -(roadTravel % 1);

      // Rear doors: open to load, closed to drive, open again at the house.
      const open = Math.max(
        smoothstep(4.38, 4.48, progress) - smoothstep(4.78, 4.88, progress),
        smoothstep(5.62, 5.7, progress) - smoothstep(5.92, 6, progress),
      );
      doors.forEach((pivot) => {
        pivot.rotation.y = -pivot.userData.side * open * 1.9;
      });

      // The house comes into view as the van slows down, and stops behind the van's rear.
      const arrive = easeOut(smoothstep(5.08, 5.6, progress));
      house.visible = progress > 5.06;
      house.position.x = lerp(-7, HOUSE_X, arrive);

      // Trees pass while the van drives.
      const treesShown = smoothstep(4.84, 5.04, progress) * (1 - smoothstep(5.28, 5.5, progress));
      trees.forEach((tree) => {
        const { base, far, materials } = tree.userData;
        const span = 8.4;
        // The far row passes more slowly.
        const x = ((((base + roadTravel * (far ? 0.55 : 1)) % span) + span) % span) - span / 2;
        tree.position.x = x;
        // Seen only over the street, never off to the left under the text: they fade in and out.
        // The rows stand where the house's walls are, so a tree also fades as the house
        // reaches it, instead of showing through the walls.
        const clearOfHouse = house.visible ? smoothstep(1.05, 1.6, Math.abs(x - house.position.x)) : 1;
        const opacity = treesShown * clearOfHouse * smoothstep(-2.3, -1.4, x) * (1 - smoothstep(2.5, 3.3, x));
        materials.forEach((material) => {
          material.opacity = opacity;
        });
        tree.visible = opacity > 0.01;
      });

      // Clouds drift all the time, and a little faster past a moving van.
      const sky = smoothstep(4.2, 4.5, progress);
      clouds.forEach((cloud) => {
        const { base, height, material } = cloud.userData;
        const span = 7.8;
        const x = ((((base + time * 0.08 + roadTravel * 0.2) % span) + span) % span) - span / 2 + 0.6;
        cloud.position.set(x, height, -2.3);
        material.opacity = sky * 0.9 * smoothstep(-2.4, -1.4, x) * (1 - smoothstep(2.8, 3.6, x));
        cloud.visible = material.opacity > 0.01;
      });

      // The front door is left ajar: the customer has already come out.
      doorPivot.rotation.y = 0.55;

      // The customer is already outside, at the gate on the van's side, waving as the
      // van pulls up; then takes the box in both hands, and hops and sways for joy.
      const wave = 1 - smoothstep(5.62, 5.72, progress);
      const reach = smoothstep(5.68, 5.8, progress);
      const happy = smoothstep(5.88, 6, progress);
      customer.visible = house.visible;
      const hop = Math.abs(Math.sin(time * 4.2)) * 0.05 * happy;
      // While waiting: a small shift of weight from foot to foot.
      const idle = Math.sin(time * 2.2) * (1 - happy);
      customer.position.set(house.position.x - 0.22, hop, -0.6);
      legs[0].rotation.x = idle * 0.04;
      legs[1].rotation.x = -idle * 0.04;
      arms.forEach((shoulder) => {
        const { side } = shoulder.userData;
        // The arm nearer the van waves (raised out to the side, hand going to and fro);
        // then both go forward and a little in, hands on the sides of the box.
        const waving = side < 0 ? wave * (1 - reach) : 0;
        const holding = lerp(side * 0.08, -side * 0.09, reach);
        shoulder.rotation.x = -0.75 * reach;
        shoulder.rotation.z = lerp(holding, side * (2.45 + Math.sin(time * 9) * 0.35), waving);
      });
      figure.rotation.z = Math.sin(time * 4.2) * 0.06 * happy + idle * 0.015;
      head.rotation.z = Math.sin(time * 4.2 + 1) * 0.09 * happy + wave * (1 - reach) * 0.08;
      eyes.forEach((eye) => {
        eye.scale.y = lerp(1, 0.35, happy);
      });
      hands.set(customer.position.x, 0.47 * customer.scale.x + hop, customer.position.z + 0.19);
      hearts.forEach((heart, index) => {
        const phase = (time * 0.5 + index / 3) % 1;
        heart.position.set(Math.sin(phase * 6 + index * 2) * 0.1 + (index - 1) * 0.12, 1.02 + phase * 0.7, 0.1);
        heart.scale.setScalar(0.12 + Math.sin(phase * Math.PI) * 0.06);
        heart.material.opacity = happy * Math.sin(phase * Math.PI);
        heart.visible = happy > 0.01;
      });
    },
  };
}

