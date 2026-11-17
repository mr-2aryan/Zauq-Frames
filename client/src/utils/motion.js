/**
 * Site-wide motion, set up once from main.jsx:
 *
 * - Scroll reveal: elements with `data-reveal="fade-up | fade-down | fade-left |
 *   fade-right | zoom-in | fade"` animate in the first time they scroll into
 *   view. Add `--reveal-delay` (e.g. `style={{ '--reveal-delay': '120ms' }}`)
 *   to stagger them. Works for content rendered later (new pages, loaded
 *   products) without any per-component code.
 * - Image fade: images fade in once loaded instead of popping in.
 *
 * Both are skipped when the visitor prefers reduced motion, and without
 * JavaScript everything simply shows.
 */

const REVEAL_SELECTOR = '[data-reveal]:not([data-revealed])';

function initReveal(root) {
  root.classList.add('reveal-ready');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute('data-revealed', '');
        observer.unobserve(entry.target);
      });
    },
    // Start as soon as the element's top edge is a little way onto the screen.
    { rootMargin: '0px 0px -40px 0px', threshold: 0 },
  );

  const observeWithin = (node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    if (node.matches(REVEAL_SELECTOR)) observer.observe(node);
    node.querySelectorAll(REVEAL_SELECTOR).forEach((element) => observer.observe(element));
  };

  observeWithin(document.body);
  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach(observeWithin));
  }).observe(document.body, { childList: true, subtree: true });
}

function initImageFade(root) {
  root.classList.add('image-fade');
  // `load` and `error` don't bubble, so listen in the capture phase.
  const markLoaded = (event) => {
    if (event.target instanceof HTMLImageElement) event.target.setAttribute('data-loaded', '');
  };
  document.addEventListener('load', markLoaded, true);
  document.addEventListener('error', markLoaded, true);
}

export function initMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const root = document.documentElement;
  initImageFade(root);
  if ('IntersectionObserver' in window) initReveal(root);
}
