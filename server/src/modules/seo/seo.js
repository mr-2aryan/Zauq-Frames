import { env } from '../../config/env.js';
import { blogService } from '../blog/blog.service.js';
import { framesService } from '../frames/frames.service.js';
import { productsRepository } from '../products/products.repository.js';
import { productsService } from '../products/products.service.js';
import { reviewsRepository } from '../reviews/reviews.repository.js';
import { clip, COLLECTION_TITLE, collectionSeo, NOUN, productSeo, rs } from './titles.js';

/**
 * Search-engine view of every shop page. The shop is a React app, so on its own the
 * server would send the same empty page for every address. This builds, for each
 * address: the right status (200 / 301 / 404), the <head> (title, description,
 * canonical, share tags, JSON-LD structured data) and a plain HTML version of the
 * page's content and links inside #root — which React replaces when it starts.
 */

export const SITE = {
  name: 'Zauq Frames',
  phone: '+923235992853',
  phoneDisplay: '0323 5992853',
  email: 'zauqframes.store@gmail.com',
  city: 'Rawalpindi',
  hours: 'Mon–Sat · 9 am – 6 pm',
  instagram: 'https://www.instagram.com/zauqframes/',
  facebook: 'https://www.facebook.com/profile.php?id=61593836891740',
  leadTime: '7–10 days',
};

/** Pages that exist in the shop: title, description and heading for search engines. `{min}`, `{fee}` are filled in. */
const PAGES = {
  '/': { title: 'Framed Wall Art & Custom Photo Frames in Pakistan | Zauq Frames', description: 'Islamic calligraphy, modern prints, posters and custom photo frames, made to order in Rawalpindi. Six sizes from Rs {min}. Rs {fee} delivery anywhere in Pakistan, cash on delivery.', h1: 'Framed wall art and custom photo frames, made in Pakistan' },
  '/shop': { title: 'Shop Framed Wall Art in Pakistan – From Rs {min} | Zauq Frames', description: 'Browse framed Islamic calligraphy, modern wall art, posters and heritage prints. Black frame, free white mat, six sizes from Rs {min}, delivered anywhere in Pakistan.', h1: 'Shop framed wall art' },
  '/custom-frames': { title: 'Custom Photo Frames in Pakistan – From Rs {min} | Zauq Frames', description: 'Upload your photo and we print and frame it by hand in Rawalpindi. Six sizes from 8×10 to 36×48 in, portrait or landscape, free white mat. Rs {fee} delivery, cash on delivery.', h1: 'Custom photo frames from your own photo' },
  '/sizes': { title: 'Frame Sizes & Prices in Pakistan | Zauq Frames', description: 'All six frame sizes from 8×10 to 36×48 in, with prices from Rs {min}, centimetres and where each size works best.', h1: 'Frame sizes and prices' },
  '/about': { title: 'Our story | Zauq Frames', description: 'Zauq Frames makes framed wall art and custom photo frames to order in Rawalpindi, delivered ready to hang across Pakistan.', h1: 'Our story' },
  '/craftsmanship': { title: 'Craftsmanship | Zauq Frames', description: 'How every Zauq frame is made: printed in high quality, framed by hand in Rawalpindi, checked, packed securely and delivered ready to hang.', h1: 'How every frame is made' },
  '/contact': { title: 'Contact us | Zauq Frames', description: 'Contact Zauq Frames about sizes, custom photo frames, an order or framing for a business — on WhatsApp, by phone or email, Mon–Sat 9 am – 6 pm.', h1: 'Contact us' },
  '/blog': { title: 'Blog | Zauq Frames', description: 'Ideas and guides for framed art: choosing sizes, planning a gallery wall, hanging and caring for frames, custom photos and Islamic calligraphy.', h1: 'Ideas for beautiful walls' },
  '/help': { title: 'FAQs | Zauq Frames', description: 'Frame sizes, prices, delivery times, payment and custom photo frames — answers to common questions about ordering from Zauq Frames.', h1: 'Frequently asked questions' },
  '/help/shipping': { title: 'Shipping & delivery | Zauq Frames', description: 'Flat-rate delivery to any city in Pakistan. Every frame is made to order and reaches you in about 7–10 days, ready to hang.', h1: 'Shipping and delivery' },
  '/help/returns': { title: 'Returns & exchanges | Zauq Frames', description: 'If a Zauq frame arrives damaged or different from your order, message us on WhatsApp and we’ll put it right. Here’s how it works.', h1: 'Returns and exchanges' },
  '/help/track-order': { title: 'Track your order | Zauq Frames', description: 'Track a Zauq Frames order: see whether it’s confirmed, being framed, shipped or delivered, and when it should arrive.', h1: 'Track your order' },
  '/help/care': { title: 'Care guide | Zauq Frames', description: 'How to clean, hang and look after a framed print so it stays beautiful for years: simple care tips from Zauq Frames.', h1: 'Caring for your frame' },
  '/legal/terms': { title: 'Terms & conditions | Zauq Frames', description: 'The terms for ordering framed art and custom photo frames from Zauq Frames: orders, prices, payment, delivery and more.', h1: 'Terms and conditions' },
  '/legal/privacy': { title: 'Privacy policy | Zauq Frames', description: 'What information Zauq Frames collects, why, who it’s shared with and your choices — in plain language.', h1: 'Privacy policy' },
  '/legal/refunds': { title: 'Refund policy | Zauq Frames', description: 'Zauq Frames refund policy: what happens if a frame arrives damaged or different from your order, custom frames, and changing an order.', h1: 'Refund policy' },
};
/** Pages for one visitor only (cart, checkout, account): never in search results. */
const PRIVATE = { '/cart': 'Your cart', '/checkout': 'Checkout', '/account': 'Your account', '/order-confirmation': 'Order' };

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const absolute = (url) => (!url ? '' : /^https?:\/\//.test(url) ? url : `${env.publicUrl}${url.startsWith('/') ? '' : '/'}${url}`);
// ---------- Structured data ----------

function organization(catalog) {
  const min = Math.min(...catalog.sizes.map((s) => s.salePrice));
  const max = Math.max(...catalog.sizes.map((s) => s.salePrice));
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': `${env.publicUrl}/#store`,
    name: SITE.name,
    url: `${env.publicUrl}/`,
    image: absolute('/images/products/badshahi-mosque-scene1.jpg'),
    telephone: SITE.phone,
    email: SITE.email,
    priceRange: `Rs ${rs(min)} – Rs ${rs(max)}`,
    address: { '@type': 'PostalAddress', addressLocality: SITE.city, addressRegion: 'Punjab', addressCountry: 'PK' },
    areaServed: { '@type': 'Country', name: 'Pakistan' },
    openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:00', closes: '18:00' }],
    sameAs: [SITE.instagram, SITE.facebook],
  };
}

const website = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: `${env.publicUrl}/`,
  potentialAction: { '@type': 'SearchAction', target: `${env.publicUrl}/shop?q={search_term_string}`, 'query-input': 'required name=search_term_string' },
});

const breadcrumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], index) => ({ '@type': 'ListItem', position: index + 1, name, item: absolute(path) })),
});

async function productLd(product, catalog, url) {
  const prices = catalog.sizes.map((s) => s.salePrice);
  const reviews = (await reviewsRepository.findAllBy('productId', product.slug)).filter((r) => (r.status ?? 'approved') === 'approved');
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: clip(product.description, 5000),
    image: product.images.map(absolute),
    sku: product.slug,
    brand: { '@type': 'Brand', name: SITE.name },
    category: NOUN[product.collection] ?? 'Framed art',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: catalog.currency,
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: prices.length,
      availability: 'https://schema.org/MadeToOrder',
      url,
      seller: { '@id': `${env.publicUrl}/#store` },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: catalog.deliveryFee, currency: catalog.currency },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'PK' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 4, maxValue: 6, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 3, maxValue: 4, unitCode: 'DAY' },
        },
      },
    },
  };
  // Ratings only from real, approved reviews.
  if (reviews.length) {
    ld.aggregateRating = { '@type': 'AggregateRating', ratingValue: Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10, reviewCount: reviews.length };
  }
  return ld;
}

// ---------- Plain HTML content (inside #root, replaced by React on load) ----------

function shell(collections, content) {
  const nav = [['/shop', 'Shop all'], ...collections.map((c) => [`/collections/${c.slug}`, c.name]), ['/custom-frames', 'Custom photo frames'], ['/sizes', 'Sizes & prices'], ['/blog', 'Blog'], ['/about', 'About'], ['/contact', 'Contact']];
  return `<div class="seo-shell"><header><a href="/"><strong>ZAUQ</strong> Premium Frames</a><nav>${nav.map(([href, label]) => `<a href="${href}">${esc(label)}</a>`).join(' ')}</nav></header><main>${content}</main><footer><p>Zauq Frames · Framed by hand in ${SITE.city}, Pakistan · WhatsApp ${SITE.phoneDisplay} · ${SITE.email} · ${SITE.hours}</p><nav><a href="/help">FAQs</a> <a href="/help/shipping">Shipping</a> <a href="/help/returns">Returns</a> <a href="/help/care">Care</a> <a href="/legal/terms">Terms</a> <a href="/legal/privacy">Privacy</a> <a href="/legal/refunds">Refunds</a></nav></footer></div>`;
}

const sizeTable = (catalog) =>
  `<table><thead><tr><th>Size (inches)</th><th>Price</th></tr></thead><tbody>${catalog.sizes.map((s) => `<tr><td>${s.width} × ${s.height}</td><td>Rs ${rs(s.salePrice)}${s.price > s.salePrice ? ` <s>Rs ${rs(s.price)}</s>` : ''}</td></tr>`).join('')}</tbody></table>`;

const productLinks = (items) => `<ul>${items.map((p) => `<li><a href="/products/${p.slug}">${esc(p.name)}</a> — ${esc(p.summary)} From Rs ${rs(p.salePrice)}.</li>`).join('')}</ul>`;

function blockHtml(block) {
  switch (block.type) {
    case 'h2':
      return `<h2>${esc(block.text)}</h2>`;
    case 'p':
      return `<p>${esc(block.text)}</p>`;
    case 'list':
      return `<${block.ordered ? 'ol' : 'ul'}>${block.items.map((i) => `<li>${esc(i)}</li>`).join('')}</${block.ordered ? 'ol' : 'ul'}>`;
    case 'tip':
      return `<aside><strong>${esc(block.title)}</strong> ${esc(block.text)}</aside>`;
    case 'quote':
      return `<blockquote>${esc(block.text)}${block.cite ? ` — ${esc(block.cite)}` : ''}</blockquote>`;
    case 'table':
      return `<table><thead><tr>${block.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${block.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    case 'cta':
      return `<p>${esc(block.text)} <a href="${esc(block.to)}">${esc(block.label)}</a></p>`;
    default:
      return '';
  }
}

// ---------- Rendering an address ----------

const fill = (text, catalog) => text.replace('{min}', rs(Math.min(...catalog.sizes.map((s) => s.salePrice)))).replace('{fee}', rs(catalog.deliveryFee));

/**
 * @param {string} pathname
 * @param {Record<string, string>} query
 * @returns {Promise<{ status: number, redirect?: string, head?: object, body?: string }>}
 */
export async function renderPage(pathname, query = {}) {
  // One address per page: no trailing slash.
  if (pathname.length > 1 && pathname.endsWith('/')) return { status: 301, redirect: pathname.replace(/\/+$/, '') };

  const [catalog, collections] = await Promise.all([framesService.getCatalog(), productsService.listCollections()]);
  const base = env.publicUrl;
  const notFound = (what = 'page') => ({
    status: 404,
    head: { title: `Page not found | ${SITE.name}`, description: `We couldn’t find that ${what}.`, robots: 'noindex, follow' },
    body: shell(collections, `<h1>We couldn’t find that ${esc(what)}</h1><p>It may have moved. <a href="/shop">Browse all frames</a> or <a href="/">go to the home page</a>.</p>`),
  });

  if (PRIVATE[pathname]) {
    return { status: 200, head: { title: `${PRIVATE[pathname]} | ${SITE.name}`, description: `${PRIVATE[pathname]} at ${SITE.name}.`, robots: 'noindex, follow' }, body: shell(collections, `<h1>${esc(PRIVATE[pathname])}</h1>`) };
  }

  // Products: /products/:slug (old addresses redirect to the new one).
  let match = pathname.match(/^\/products\/([a-z0-9-]+)$/);
  if (match) {
    let product;
    try {
      product = await productsService.getBySlug(match[1]);
    } catch {
      const renamed = (await productsRepository.findAll()).find((p) => p.status === 'active' && (p.previousSlugs ?? []).includes(match[1]));
      return renamed ? { status: 301, redirect: `/products/${renamed.slug}` } : notFound('piece');
    }
    const raw = await productsService.findBySlug(product.slug);
    const { title, description } = productSeo(raw, catalog);
    const collection = collections.find((c) => c.slug === product.collection);
    const url = `${base}/products/${product.slug}`;
    return {
      status: 200,
      head: {
        title,
        description,
        canonical: url,
        robots: raw.seo?.noindex ? 'noindex, follow' : undefined,
        ogType: 'product',
        image: raw.seo?.ogImage ?? product.images[0],
        jsonLd: [await productLd(raw, catalog, url), breadcrumbs([['Home', '/'], [collection?.name ?? 'Shop', collection ? `/collections/${collection.slug}` : '/shop'], [product.name, `/products/${product.slug}`]])],
      },
      body: shell(
        collections,
        `<nav aria-label="Breadcrumb"><a href="/">Home</a> › ${collection ? `<a href="/collections/${collection.slug}">${esc(collection.name)}</a> › ` : ''}${esc(product.name)}</nav>` +
          `<h1>${esc(product.name)} — ${esc(NOUN[product.collection] ?? 'Framed art')}</h1>` +
          `<img src="${esc(product.images[0])}" alt="${esc(`${product.name}, framed`)}" width="600">` +
          `<p>${esc(product.summary)}</p><p>${esc(product.description)}</p>` +
          `<h2>Sizes and prices</h2>${sizeTable(catalog)}<p>Black frame, free white mat on request. Made to order in ${SITE.city} in about ${SITE.leadTime}; Rs ${rs(catalog.deliveryFee)} delivery anywhere in Pakistan; cash on delivery.</p>` +
          (product.related?.length ? `<h2>More from ${esc(collection?.name ?? 'the shop')}</h2>${productLinks(product.related)}` : ''),
      ),
    };
  }

  // Collections: /collections/:slug
  match = pathname.match(/^\/collections\/([a-z0-9-]+)$/);
  if (match) {
    const collection = collections.find((c) => c.slug === match[1]);
    if (!collection) return notFound('collection');
    const stored = await productsService.getCollection(collection.slug);
    const { title, description } = collectionSeo({ ...stored, seo: collection.seo }, catalog);
    const { items } = await productsService.list({ collections: [collection.slug] });
    const url = `${base}/collections/${collection.slug}`;
    return {
      status: 200,
      head: {
        title,
        description,
        canonical: url,
        image: collection.image ?? items[0]?.image,
        jsonLd: [
          { '@context': 'https://schema.org', '@type': 'CollectionPage', name: collection.name, description, url, mainEntity: { '@type': 'ItemList', itemListElement: items.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${base}/products/${p.slug}`, name: p.name })) } },
          breadcrumbs([['Home', '/'], ['Shop', '/shop'], [collection.name, `/collections/${collection.slug}`]]),
        ],
      },
      body: shell(collections, `<h1>${esc(COLLECTION_TITLE[collection.slug]?.replace(' in Pakistan', '') ?? collection.name)}</h1><p>${esc(collection.description)}</p>${productLinks(items)}<h2>Sizes and prices</h2>${sizeTable(catalog)}`),
    };
  }

  // Blog posts: /blog/:slug
  match = pathname.match(/^\/blog\/([a-z0-9-]+)$/);
  if (match) {
    let post;
    try {
      post = await blogService.getBySlug(match[1]);
    } catch {
      return notFound('article');
    }
    const url = `${base}/blog/${post.slug}`;
    return {
      status: 200,
      head: {
        title: post.seo?.metaTitle || `${post.title} | ${SITE.name}`,
        description: post.seo?.metaDescription || clip(post.excerpt),
        canonical: url,
        ogType: 'article',
        image: post.cover,
        jsonLd: [
          { '@context': 'https://schema.org', '@type': 'Article', headline: post.title, description: post.excerpt, image: absolute(post.cover), datePublished: post.date, dateModified: post.updatedAt ?? post.date, author: { '@type': 'Organization', name: SITE.name, url: `${base}/` }, publisher: { '@id': `${base}/#store` }, mainEntityOfPage: url },
          breadcrumbs([['Home', '/'], ['Blog', '/blog'], [post.title, `/blog/${post.slug}`]]),
        ],
      },
      body: shell(collections, `<article><h1>${esc(post.title)}</h1><p>${esc(post.excerpt)}</p>${post.body.map(blockHtml).join('')}</article>${post.related?.length ? `<h2>Related reading</h2><ul>${post.related.map((r) => `<li><a href="/blog/${r.slug}">${esc(r.title)}</a></li>`).join('')}</ul>` : ''}`),
    };
  }

  const page = PAGES[pathname];
  if (!page) return notFound();

  // The shop page with filters: one canonical address (a single collection, or /shop).
  let canonical = `${base}${pathname === '/' ? '/' : pathname}`;
  if (pathname === '/shop') {
    const picked = String(query.category ?? '').split(',').filter(Boolean);
    if (picked.length === 1 && collections.some((c) => c.slug === picked[0])) canonical = `${base}/collections/${picked[0]}`;
  }

  const jsonLd = pathname === '/' ? [organization(catalog), website()] : pathname === '/contact' ? [organization(catalog)] : [];
  let content = `<h1>${esc(page.h1)}</h1><p>${esc(fill(page.description, catalog))}</p>`;
  if (pathname === '/' || pathname === '/shop') {
    const { items } = await productsService.list({ featured: pathname === '/' });
    content += `<h2>Collections</h2><ul>${collections.map((c) => `<li><a href="/collections/${c.slug}">${esc(c.name)}</a> — ${esc(c.description)}</li>`).join('')}</ul><h2>${pathname === '/' ? 'Featured pieces' : 'All pieces'}</h2>${productLinks(items)}`;
  }
  if (pathname === '/sizes' || pathname === '/custom-frames') content += `<h2>Sizes and prices</h2>${sizeTable(catalog)}`;
  if (pathname === '/blog') {
    const { items } = await blogService.list();
    content += `<ul>${items.map((p) => `<li><a href="/blog/${p.slug}">${esc(p.title)}</a> — ${esc(p.excerpt)}</li>`).join('')}</ul>`;
  }
  return { status: 200, head: { title: fill(page.title, catalog), description: fill(page.description, catalog), canonical, jsonLd, image: '/images/products/badshahi-mosque-scene1.jpg' }, body: shell(collections, content) };
}

/** The <head> tags for a rendered page. */
export function headHtml(head) {
  const image = absolute(head.image);
  const tags = [
    `<title>${esc(head.title)}</title>`,
    `<meta name="description" content="${esc(head.description)}" />`,
    head.robots ? `<meta name="robots" content="${esc(head.robots)}" />` : '',
    head.canonical ? `<link rel="canonical" href="${esc(head.canonical)}" />` : '',
    `<meta property="og:site_name" content="${SITE.name}" />`,
    `<meta property="og:type" content="${head.ogType ?? 'website'}" />`,
    `<meta property="og:title" content="${esc(head.title)}" />`,
    `<meta property="og:description" content="${esc(head.description)}" />`,
    head.canonical ? `<meta property="og:url" content="${esc(head.canonical)}" />` : '',
    image ? `<meta property="og:image" content="${esc(image)}" />` : '',
    `<meta property="og:locale" content="en_PK" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    ...(head.jsonLd ?? []).map((ld) => `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`),
  ];
  return tags.filter(Boolean).join('\n    ');
}

// ---------- robots.txt and sitemap.xml ----------

export function robotsTxt() {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /cart',
    'Disallow: /checkout',
    'Disallow: /account',
    'Disallow: /order-confirmation',
    'Disallow: /api/',
    '',
    `Sitemap: ${env.publicUrl}/sitemap.xml`,
    '',
  ].join('\n');
}

export async function sitemapXml() {
  const base = env.publicUrl;
  const [collections, products, posts] = await Promise.all([productsService.listCollections(), productsRepository.findAll(), blogService.publishedPosts()]);
  const live = products.filter((p) => p.status === 'active' && !p.seo?.noindex);
  const day = (iso) => (iso ? iso.slice(0, 10) : undefined);
  const newest = day([...live.map((p) => p.updatedAt), ...posts.map((p) => p.updatedAt)].sort().at(-1));
  const entries = [
    ...Object.keys(PAGES).map((path) => ({ loc: `${base}${path}`, lastmod: path === '/' || path === '/shop' ? newest : undefined, priority: path === '/' ? '1.0' : ['/shop', '/custom-frames'].includes(path) ? '0.9' : '0.5' })),
    ...collections.map((c) => ({ loc: `${base}/collections/${c.slug}`, lastmod: newest, priority: '0.8', images: c.image ? [{ loc: c.image, title: c.name }] : [] })),
    ...live.map((p) => ({ loc: `${base}/products/${p.slug}`, lastmod: day(p.updatedAt), priority: '0.7', images: p.images.map((img) => ({ loc: img, title: p.name })) })),
    ...posts.map((p) => ({ loc: `${base}/blog/${p.slug}`, lastmod: day(p.updatedAt) ?? p.date, priority: '0.6', images: p.cover ? [{ loc: p.cover, title: p.title }] : [] })),
  ];
  const urls = entries
    .map(
      (e) =>
        `  <url><loc>${esc(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}<priority>${e.priority}</priority>${(e.images ?? []).map((i) => `<image:image><image:loc>${esc(absolute(i.loc))}</image:loc><image:title>${esc(i.title)}</image:title></image:image>`).join('')}</url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`;
}
