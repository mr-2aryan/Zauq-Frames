/**
 * The order emails: one design, with what it says for each step of the order
 * (placed, confirmed, printing & framing, shipped, delivered — or cancelled).
 *
 * Built like every email that has to work in Gmail, Outlook and Apple Mail:
 * tables, inline styles, 600px wide and fluid on phones. The movement is in two
 * layers: an animated GIF of the order's route (plays everywhere, Gmail too),
 * and CSS animations — the gold shimmer, the artwork gently swaying, sections
 * rising in, the status light pulsing — for the clients that play them (Apple
 * Mail, iOS Mail and others). Where they don't, the email simply shows still,
 * so nothing ever starts hidden.
 */

const SITE = {
  name: 'Zauq Frames',
  phoneDisplay: '0323 5992853',
  whatsapp: 'https://wa.me/923235992853',
  email: 'zauqframes.store@gmail.com',
  instagram: 'https://www.instagram.com/zauqframes/',
  leadTime: '7–10 days',
  shippingTime: '3–4 days',
};

const C = {
  page: '#f4f3ee',
  card: '#ffffff',
  hero: '#1d2211',
  olive: '#3e4a1f',
  gold: '#e8b33a',
  cream: '#f4efe1',
  ink: '#1c1f17',
  muted: '#5b5f51',
  line: '#ecebe4',
  tint: '#eef1e2',
  terracotta: '#c8643b',
};

const FONT = "'Urbanist', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Helvetica Neue', Helvetica, Arial, sans-serif";

/** The steps, as the shop names them (see the client's ORDER_STEPS). */
const STEPS = [
  { status: 'pending', label: 'Order placed', gif: 'placed' },
  { status: 'confirmed', label: 'Confirmed', gif: 'confirmed' },
  { status: 'in_production', label: 'Printing & framing', gif: 'framing' },
  { status: 'shipped', label: 'Shipped', gif: 'shipped' },
  { status: 'delivered', label: 'Delivered', gif: 'delivered' },
];

/** What each email says. `first` is the customer's first name. */
const COPY = {
  pending: {
    subject: (order) => `Thank you — your order ${order.id} is in`,
    preheader: 'We’ll call or WhatsApp you shortly to confirm it, then start making it by hand.',
    title: (first) => `Thank you, ${first}.`,
    lead: 'Your order is in. We’ll call or WhatsApp you shortly to confirm the details and payment — then your piece is printed and framed by hand in our Rawalpindi studio.',
  },
  confirmed: {
    subject: (order) => `Order ${order.id} is confirmed`,
    preheader: 'Thank you for confirming. Your piece goes to print and framing next.',
    title: () => 'Confirmed — we’re on it.',
    lead: 'Thank you for confirming your order. Your piece goes to print next, then it’s framed by hand and checked in our Rawalpindi studio.',
  },
  in_production: {
    subject: () => 'Your frame is being made by hand',
    preheader: 'Printed, framed by hand and checked in our Rawalpindi studio.',
    title: () => 'Your frame is being made.',
    lead: 'Your piece is being printed and framed by hand in our Rawalpindi studio, then checked before it’s packed for the journey.',
  },
  shipped: {
    subject: (order) => `Order ${order.id} is on its way`,
    preheader: `Packed securely and with our courier — usually ${SITE.shippingTime} to your door.`,
    title: () => 'On its way to you.',
    lead: `Your frame is packed securely and with our courier — usually ${SITE.shippingTime} to your door. It arrives ready to hang.`,
  },
  delivered: {
    subject: () => 'Delivered — enjoy your new frame',
    preheader: 'We hope it looks wonderful on your wall.',
    title: (first) => `Enjoy it, ${first}.`,
    lead: 'Your order has been delivered. We hope it looks wonderful on your wall. If anything isn’t right, take a few photos and message us on WhatsApp — we’ll put it right.',
  },
  cancelled: {
    subject: (order) => `Order ${order.id} has been cancelled`,
    preheader: 'Your order has been cancelled.',
    title: () => 'Your order has been cancelled.',
    lead: 'This order has been cancelled. If that’s a surprise, or you’d like to order again, message us on WhatsApp and we’ll help.',
  },
};

const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const rs = (amount) => `Rs ${Number(amount).toLocaleString('en-PK')}`;
const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'Asia/Karachi' });
const longDay = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Karachi' });
const absolute = (base, url) => (!url ? '' : /^https?:\/\//.test(url) ? url : `${base}${url.startsWith('/') ? '' : '/'}${url}`);

/** An item's picture to show inside a frame: the flat artwork, the customer's photo, or (older orders) the shop image. */
const pictureOf = (item) => item.art ?? item.photoUrl ?? item.image;

/** The first item with a picture, for the hero. */
const heroImage = (order) => order.items.find((item) => pictureOf(item));

/** An item's picture in its frame: black moulding, and the white mat if chosen. */
function framed(src, { width, orientation, mat }) {
  const height = Math.round(orientation === 'landscape' ? width * 0.75 : width * 1.25);
  const matPad = mat === 'white' ? Math.max(6, Math.round(width * 0.09)) : 0;
  const inner = width - matPad * 2;
  const innerHeight = height - matPad * 2;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;"><tr><td style="background:${C.ink};padding:${Math.max(4, Math.round(width * 0.05))}px;border-radius:2px;box-shadow:0 14px 26px rgba(28,31,23,0.28);"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#fbfaf6;padding:${matPad}px;"><img src="${esc(src)}" width="${inner}" height="${innerHeight}" alt="" style="display:block;width:${inner}px;height:${innerHeight}px;object-fit:cover;border:0;"></td></tr></table></td></tr></table>`;
}

const button = (href, label, { solid = true } = {}) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;margin:6px;"><tr><td style="border-radius:999px;background:${solid ? C.olive : '#ffffff'};${solid ? '' : `border:2px solid ${C.olive};`}"><a href="${esc(href)}" class="btn" style="display:inline-block;padding:${solid ? '15px 30px' : '13px 28px'};font-family:${FONT};font-size:15px;font-weight:800;color:${solid ? '#ffffff' : C.olive};text-decoration:none;border-radius:999px;">${label}</a></td></tr></table>`;

const card = (inner, { pad = '28px 28px', cls = 'rise d2' } = {}) =>
  `<tr><td style="padding-top:16px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="${cls}" style="background:${C.card};border-radius:24px;border:1px solid ${C.line};"><tr><td class="pad" style="padding:${pad};">${inner}</td></tr></table></td></tr>`;

const heading = (text) => `<p style="margin:0 0 16px;font-family:${FONT};font-size:12px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:${C.olive};">${text}</p>`;

/**
 * The email for an order at its current status.
 * @param {Record<string, any>} order the stored order
 * @param {{ publicUrl: string }} options
 * @returns {{ subject: string, html: string, text: string }}
 */
export function orderEmail(order, { publicUrl }) {
  const status = COPY[order.status] ? order.status : 'pending';
  const copy = COPY[status];
  const first = esc(String(order.customer?.name ?? '').trim().split(/\s+/)[0] || 'there');
  const stepIndex = Math.max(0, STEPS.findIndex((step) => step.status === status));
  const cancelled = status === 'cancelled';
  const placed = Date.parse(order.createdAt);
  const from = day.format(new Date(placed + 7 * 86_400_000));
  const to = day.format(new Date(placed + 10 * 86_400_000));
  const trackUrl = `${publicUrl}/help/track-order?order=${encodeURIComponent(order.id)}`;
  const whatsappUrl = `${SITE.whatsapp}?text=${encodeURIComponent(`Hi Zauq, about my order ${order.id}`)}`;
  const hero = heroImage(order);
  const saved = order.items.reduce((sum, item) => sum + Math.max(0, (item.listPrice ?? item.unitPrice) - item.unitPrice) * item.quantity, 0);
  const pieces = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const subject = copy.subject(order);

  // ---------- The hero ----------
  const art = hero
    ? `<tr><td align="center" style="padding:34px 0 6px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" class="wall" style="background:#2a3119;border-radius:22px;"><tr><td align="center" style="padding:30px 46px 34px;">
        <div style="width:2px;height:16px;margin:0 auto;background:${C.gold};"></div>
        <div class="hang" style="display:inline-block;">${framed(absolute(publicUrl, pictureOf(hero)), { width: hero.orientation === 'landscape' ? 230 : 170, orientation: hero.orientation, mat: hero.mat })}</div>
      </td></tr></table></td></tr>`
    : '';

  const statusPill = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;"><tr><td style="background:rgba(244,239,225,0.1);border:1px solid rgba(244,239,225,0.18);border-radius:999px;padding:9px 16px 9px 12px;font-family:${FONT};font-size:13px;font-weight:700;color:${C.cream};"><span class="pulse" style="display:inline-block;width:9px;height:9px;margin-right:8px;border-radius:50%;background:${cancelled ? C.terracotta : '#9fc25a'};vertical-align:1px;"></span>${cancelled ? 'Cancelled' : esc(STEPS[stepIndex].label)} · ${esc(longDay.format(new Date(order.updatedAt ?? order.createdAt)))}</td></tr></table>`;

  const heroCard = `<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="rise" style="background:${C.hero};background-image:radial-gradient(120% 70% at 50% 0%, #2f3a17 0%, ${C.hero} 70%);border-radius:28px;"><tr><td class="pad-lg" style="padding:44px 44px 40px;">
      <div class="shimmer" style="height:3px;width:72px;border-radius:3px;background:${C.gold};margin-bottom:26px;"></div>
      <p style="margin:0 0 12px;font-family:${FONT};font-size:12px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:${C.gold};">Order ${esc(order.id)}</p>
      <h1 class="h1" style="margin:0;font-family:${DISPLAY};font-size:40px;line-height:1.08;font-weight:800;letter-spacing:-0.02em;color:#ffffff;">${copy.title(first)}</h1>
      <p style="margin:16px 0 0;font-family:${FONT};font-size:16px;line-height:1.6;color:rgba(244,239,225,0.82);">${esc(copy.lead)}</p>
      ${statusPill}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${art}</table>
    </td></tr></table></td></tr>`;

  // ---------- Where it is ----------
  const labels = STEPS.map(
    (step, index) =>
      `<td width="20%" align="center" valign="top" style="padding:0 2px;font-family:${FONT};font-size:12px;line-height:1.3;font-weight:${index === stepIndex && !cancelled ? 800 : 600};color:${index <= stepIndex && !cancelled ? C.ink : '#8d9083'};">${esc(step.label)}</td>`,
  ).join('');
  const progress = card(
    `${heading(cancelled ? 'Your order' : 'Where it is now')}
     <img src="${esc(`${publicUrl}/images/email/route-${cancelled ? 'cancelled' : STEPS[stepIndex].gif}.gif`)}" width="544" alt="${esc(cancelled ? 'Order cancelled' : `Step ${stepIndex + 1} of 5: ${STEPS[stepIndex].label}`)}" class="fluid" style="display:block;width:100%;max-width:544px;height:auto;border:0;">
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:4px;"><tr>${labels}</tr></table>
     ${
       cancelled || status === 'delivered'
         ? ''
         : `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;"><tr><td style="background:${C.tint};border-radius:16px;padding:16px 18px;font-family:${FONT};font-size:14px;line-height:1.5;color:${C.ink};"><strong style="font-weight:800;">Arriving between ${esc(from)} and ${esc(to)}</strong><br><span style="color:${C.muted};">About ${SITE.leadTime} from order to door — every frame is made for you.</span></td></tr></table>`
     }`,
    { pad: '26px 24px 24px' },
  );

  // ---------- The order ----------
  const itemRows = order.items
    .map((item) => {
      const picture = pictureOf(item);
      const details = [item.label, item.orientation === 'landscape' ? 'Landscape' : 'Portrait', item.mat === 'white' ? 'White mat' : 'No mat', `${item.finish ? `${item.finish[0].toUpperCase()}${item.finish.slice(1)} frame` : ''}`].filter(Boolean).join(' · ');
      return `<tr>
        <td width="92" valign="middle" style="padding:12px 14px 12px 0;border-bottom:1px solid ${C.line};">${picture ? framed(absolute(publicUrl, picture), { width: item.orientation === 'landscape' ? 84 : 64, orientation: item.orientation, mat: item.mat }) : ''}</td>
        <td valign="middle" style="padding:12px 0;border-bottom:1px solid ${C.line};font-family:${FONT};">
          <p style="margin:0;font-size:15px;font-weight:800;color:${C.ink};">${esc(item.name)}</p>
          <p style="margin:4px 0 0;font-size:13px;line-height:1.45;color:${C.muted};">${esc(details)}</p>
          <p style="margin:4px 0 0;font-size:13px;color:${C.muted};">Qty ${esc(item.quantity)} × ${esc(rs(item.unitPrice))}</p>
        </td>
        <td valign="middle" align="right" style="padding:12px 0 12px 12px;border-bottom:1px solid ${C.line};font-family:${FONT};font-size:15px;font-weight:800;color:${C.ink};white-space:nowrap;">${esc(rs(item.lineTotal))}</td>
      </tr>`;
    })
    .join('');
  const sumRow = (label, value, { strong = false, note = '' } = {}) =>
    `<tr><td style="padding:${strong ? '14px' : '6px'} 0 0;font-family:${FONT};font-size:${strong ? 17 : 14}px;font-weight:${strong ? 800 : 600};color:${strong ? C.ink : C.muted};">${label}${note ? `<br><span style="font-size:12px;font-weight:600;color:${C.olive};">${note}</span>` : ''}</td><td align="right" valign="top" style="padding:${strong ? '14px' : '6px'} 0 0;font-family:${strong ? DISPLAY : FONT};font-size:${strong ? 22 : 14}px;font-weight:800;color:${C.ink};white-space:nowrap;">${value}</td></tr>`;
  const payment =
    order.paymentMethod === 'bank'
      ? 'Bank transfer, JazzCash or Easypaisa — we send the details on WhatsApp.'
      : 'Cash on delivery — pay the courier when it arrives.';
  const summary = card(
    `${heading(`Your order · ${pieces} ${pieces === 1 ? 'piece' : 'pieces'}`)}
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${itemRows}</table>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
       ${sumRow('Subtotal', esc(rs(order.subtotal)), { note: saved > 0 && order.promotion?.label ? `${esc(order.promotion.label)} — you saved ${esc(rs(saved))}` : '' })}
       ${sumRow('Delivery', esc(rs(order.deliveryFee)), { note: 'One flat fee, however many frames' })}
       ${sumRow('Total', esc(rs(order.total)), { strong: true })}
     </table>
     <p style="margin:16px 0 0;padding-top:14px;border-top:1px solid ${C.line};font-family:${FONT};font-size:13px;line-height:1.5;color:${C.muted};"><strong style="color:${C.ink};">Payment:</strong> ${esc(payment)}</p>`,
    { cls: 'rise d3' },
  );

  // ---------- Delivery and what's next ----------
  const next = {
    pending: ['We call or WhatsApp you to confirm the details and payment.', 'Your piece is printed and framed by hand in Rawalpindi, then checked.', `It’s packed securely and delivered — about ${SITE.leadTime}, order to door.`],
    confirmed: ['Your piece is printed and framed by hand in Rawalpindi.', 'It’s checked, then packed securely for the journey.', `Our courier brings it to your door, ready to hang.`],
    in_production: ['We check every frame before it leaves the studio.', 'It’s packed securely and handed to our courier.', `Usually ${SITE.shippingTime} later, it’s at your door.`],
    shipped: ['Open the box on a soft, clean surface and lift the frame out by its edges.', 'Check the frame and print before you throw the packaging away.', 'If anything is damaged, take a few photos and message us on WhatsApp — we’ll put it right.'],
    delivered: ['Hang it with the hooks already fitted on the back.', 'Dust it now and then with a soft, dry cloth — no sprays.', 'Keep it out of strong, direct sun so the colours stay rich.'],
    cancelled: [],
  }[status];
  const steps = next.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;">${next
        .map(
          (text, index) =>
            `<tr><td width="34" valign="top" style="padding:0 0 12px;"><div style="width:26px;height:26px;border-radius:50%;background:${C.olive};color:#ffffff;font-family:${FONT};font-size:12px;font-weight:800;line-height:26px;text-align:center;">${index + 1}</div></td><td valign="top" style="padding:3px 0 12px;font-family:${FONT};font-size:14px;line-height:1.5;color:${C.ink};">${esc(text)}</td></tr>`,
        )
        .join('')}</table>`
    : '';
  const customer = order.customer ?? {};
  const delivery = card(
    `${heading(status === 'delivered' ? 'Caring for it' : status === 'shipped' ? 'When it arrives' : 'Delivering to')}
     <p style="margin:0;font-family:${FONT};font-size:15px;line-height:1.55;color:${C.ink};"><strong>${esc(customer.name)}</strong><br>${esc(customer.address)}${customer.address ? '<br>' : ''}${esc(customer.city)}${customer.phone ? `<br><span style="color:${C.muted};">${esc(customer.phone)}</span>` : ''}</p>
     ${steps}`,
    { cls: 'rise d4' },
  );

  const actions = `<tr><td align="center" class="rise d5" style="padding:26px 0 6px;">${button(trackUrl, 'Track your order')}${button(whatsappUrl, 'Chat on WhatsApp', { solid: false })}</td></tr>`;

  const footer = `<tr><td align="center" style="padding:26px 24px 8px;font-family:${FONT};font-size:12px;line-height:1.7;color:#8d9083;">
      <p style="margin:0 0 6px;font-family:${DISPLAY};font-size:16px;font-weight:800;letter-spacing:0.28em;color:${C.ink};">ZAUQ</p>
      Framed by hand in Rawalpindi, Pakistan<br>
      WhatsApp <a href="${SITE.whatsapp}" style="color:${C.olive};font-weight:700;text-decoration:none;">${SITE.phoneDisplay}</a> · <a href="mailto:${SITE.email}" style="color:${C.olive};font-weight:700;text-decoration:none;">${SITE.email}</a> · <a href="${SITE.instagram}" style="color:${C.olive};font-weight:700;text-decoration:none;">Instagram</a><br>
      You’re receiving this because you ordered from <a href="${esc(publicUrl)}" style="color:#8d9083;">${esc(publicUrl.replace(/^https?:\/\//, ''))}</a>.
    </td></tr>`;

  const html = `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${esc(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700..800&family=Urbanist:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 0; background: ${C.page}; -webkit-text-size-adjust: 100%; }
  a { color: ${C.olive}; }
  @media (max-width: 620px) {
    .wrap { width: 100% !important; }
    .pad-lg { padding: 32px 22px 28px !important; }
    .pad { padding: 22px 18px !important; }
    .h1 { font-size: 32px !important; }
    .wall td { padding: 24px 22px 28px !important; }
  }
  /* The movement, where the email app plays it (never needed to read the email). */
  @media screen and (prefers-reduced-motion: no-preference) {
    .rise { animation: rise 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
    .d2 { animation-delay: 0.15s; }
    .d3 { animation-delay: 0.3s; }
    .d4 { animation-delay: 0.45s; }
    .d5 { animation-delay: 0.6s; }
    .shimmer { background-image: linear-gradient(90deg, #9a7425 0%, ${C.gold} 35%, #fff1c2 50%, ${C.gold} 65%, #9a7425 100%) !important; background-size: 220% 100% !important; animation: shimmer 2.8s linear infinite; }
    .hang { transform-origin: 50% -16px; animation: hang 5s ease-in-out infinite; }
    .pulse { animation: pulse 1.8s ease-out infinite; }
    .btn { transition: transform 0.2s ease; }
    .btn:hover { transform: translateY(-2px); }
    @keyframes rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
    @keyframes shimmer { from { background-position: 120% 0; } to { background-position: -120% 0; } }
    @keyframes hang { 0%, 100% { transform: rotate(-1.4deg); } 50% { transform: rotate(1.4deg); } }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(159, 194, 90, 0.7); } 70%, 100% { box-shadow: 0 0 0 9px rgba(159, 194, 90, 0); } }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(copy.preheader)}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.page};">
  <tr><td align="center" style="padding:28px 12px 36px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="wrap" style="width:600px;max-width:600px;">
      <tr><td align="center" style="padding:0 0 18px;">
        <p style="margin:0;font-family:${DISPLAY};font-size:26px;font-weight:800;letter-spacing:0.3em;color:${C.ink};">ZAUQ</p>
        <p style="margin:2px 0 0;font-family:${FONT};font-size:9px;font-weight:800;letter-spacing:0.42em;color:${C.ink};">PREMIUM FRAMES</p>
      </td></tr>
      ${heroCard}
      ${progress}
      ${summary}
      ${delivery}
      ${actions}
      ${footer}
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    `${copy.title(String(order.customer?.name ?? '').trim().split(/\s+/)[0] || 'there')}`,
    '',
    copy.lead,
    '',
    `Order ${order.id} — ${cancelled ? 'Cancelled' : STEPS[stepIndex].label}`,
    ...(cancelled || status === 'delivered' ? [] : [`Arriving between ${from} and ${to} (about ${SITE.leadTime}, order to door).`]),
    '',
    ...order.items.map((item) => `• ${item.name} — ${item.label}, ${item.mat === 'white' ? 'white mat' : 'no mat'} — ${item.quantity} × ${rs(item.unitPrice)} = ${rs(item.lineTotal)}`),
    `Subtotal ${rs(order.subtotal)} · Delivery ${rs(order.deliveryFee)} · Total ${rs(order.total)}`,
    `Payment: ${payment}`,
    '',
    `Track your order: ${trackUrl}`,
    `WhatsApp: ${SITE.phoneDisplay} (${SITE.whatsapp})`,
    '',
    'Zauq Frames — framed by hand in Rawalpindi, Pakistan',
  ].join('\n');

  return { subject, html, text };
}
