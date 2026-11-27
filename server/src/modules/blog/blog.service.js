import fs from 'node:fs';
import { z } from 'zod';
import { createRepository } from '../../lib/createRepository.js';
import { HttpError } from '../../utils/HttpError.js';

/**
 * Blog posts, in the database (edited in the admin). Each body is a list of
 * blocks the shop's post page renders: h2, p, list, tip, quote, table, cta.
 */
export const blogRepository = createRepository('blog_posts');

const SEED = JSON.parse(fs.readFileSync(new URL('./blog.seed.json', import.meta.url), 'utf8'));
export const BLOG_CATEGORIES = Object.freeze(SEED.categories);

const text = (max) => z.string().trim().min(1).max(max);
const link = z.string().trim().max(200).regex(/^\/[\w\-/?=&.%#]*$/, 'Use a link to a page on this site, e.g. /shop');

/** The blocks a post's body is made of. */
export const blockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('h2'), text: text(140) }),
  z.object({ type: z.literal('p'), text: text(3000) }),
  z.object({ type: z.literal('list'), items: z.array(text(400)).min(1).max(30), ordered: z.boolean().optional().default(false) }),
  z.object({ type: z.literal('tip'), title: text(120), text: text(800) }),
  z.object({ type: z.literal('quote'), text: text(600), cite: z.string().trim().max(120).optional().default('') }),
  z.object({ type: z.literal('table'), head: z.array(z.string().trim().max(80)).min(1).max(6), rows: z.array(z.array(z.string().trim().max(200)).min(1).max(6)).min(1).max(40) }),
  z.object({ type: z.literal('cta'), text: text(300), label: text(60), to: link }),
]);

let cached = null;
async function published() {
  cached ??= (await blogRepository.findAll()).filter((post) => post.status === 'published').sort((a, b) => b.date.localeCompare(a.date));
  return cached;
}

const toCard = ({ slug, title, excerpt, category, readingMinutes, date, cover }) => ({ slug, title, excerpt, category, readingMinutes, date, cover });

export const blogService = {
  async list() {
    return { categories: BLOG_CATEGORIES, items: (await published()).map(toCard) };
  },

  /** A published post, with up to three related ones (same category first). */
  async getBySlug(slug) {
    const posts = await published();
    const post = posts.find((p) => p.slug === slug);
    if (!post) throw HttpError.notFound('We could not find that article.');
    const others = posts.filter((p) => p.slug !== slug);
    const related = [...others.filter((p) => p.category === post.category), ...others.filter((p) => p.category !== post.category)].slice(0, 3).map(toCard);
    const { slug: s, title, excerpt, category, readingMinutes, date, cover, body, seo, updatedAt } = post;
    return { slug: s, title, excerpt, category, readingMinutes, date, cover, body, seo: seo ?? {}, updatedAt, related };
  },

  async publishedPosts() {
    return published();
  },

  invalidate() {
    cached = null;
  },
};

/** First run only: copies the original posts into the database. */
export async function seedBlog() {
  if ((await blogRepository.findAll()).length) return null;
  for (const post of SEED.posts) await blogRepository.create(post);
  return `${SEED.posts.length} blog posts`;
}
