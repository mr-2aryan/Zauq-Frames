import { Fragment } from 'react';
import { Link, useParams } from 'react-router';
import { PageHero, PageMessage } from '@/components/common';
import { ArrowRightIcon } from '@/components/icons';
import { CtaBand } from '@/components/info';
import { Button, Container, StatusMessage } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { SITE } from '@/config/site';
import { BLOG_PATH, formatPostDate, headingId } from '@/features/blog/blog.js';
import { PostCard } from '@/features/blog/components/PostCard/PostCard.jsx';
import { useQuery } from '@/hooks/useQuery';
import { getPost } from '@/services/blogApi';
import styles from './BlogPostPage.module.css';

/** Renders one block of an article body (block types: server/src/modules/blog/blog.service.js). */
function Block({ block }) {
  switch (block.type) {
    case 'h2':
      return (
        <h2 id={headingId(block.text)} className={styles.h2}>
          {block.text}
        </h2>
      );
    case 'p':
      return <p className={styles.p}>{block.text}</p>;
    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag className={block.ordered ? styles.ol : styles.ul}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ListTag>
      );
    }
    case 'tip':
      return (
        <aside className={styles.tip}>
          <strong>{block.title}</strong>
          <p>{block.text}</p>
        </aside>
      );
    case 'quote':
      return (
        <blockquote className={styles.quote}>
          <p>{block.text}</p>
          {block.cite && <cite>{block.cite}</cite>}
        </blockquote>
      );
    case 'table':
      return (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {block.head.map((cell) => (
                  <th key={cell} scope="col">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (index === 0 ? <th key={cell} scope="row">{cell}</th> : <td key={`${row[0]}-${index}`}>{cell}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'cta':
      return (
        <Link to={block.to} className={styles.inlineCta}>
          <span>{block.text}</span>
          <strong>
            {block.label} <ArrowRightIcon size={16} />
          </strong>
        </Link>
      );
    default:
      return null;
  }
}

/** /blog/:slug — one article with a contents list and related reading. */
export default function BlogPostPage() {
  const { slug } = useParams();
  const { status, data: post, error, reload } = useQuery((options) => getPost(slug, options), slug);

  if (status === 'loading' || (status === 'error' && error?.status !== 404)) {
    return (
      <Container>
        <StatusMessage status={status} message={status === 'loading' ? 'Loading the article…' : error?.message} onRetry={reload} />
      </Container>
    );
  }

  if (!post) {
    return (
      <>
        <title>{`Article not found | ${SITE.name}`}</title>
        <PageMessage
          eyebrow="Blog"
          title="We couldn’t find that article"
          description="It may have moved. Browse the blog for guides on sizes, gallery walls, hanging and caring for frames."
          actions={
            <>
              <Button to={BLOG_PATH}>Browse the blog</Button>
              <Button to={ROUTES.shop} variant="secondary">
                Shop the collection
              </Button>
            </>
          }
        />
      </>
    );
  }

  const headings = post.body.filter((block) => block.type === 'h2');
  const { related } = post;

  return (
    <>
      <title>{`${post.title} | ${SITE.name}`}</title>
      <meta name="description" content={post.excerpt} />

      <PageHero
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Blog', to: BLOG_PATH }, { label: post.title }]}
        kicker={post.category}
        title={post.title}
        lead={post.excerpt}
        size="sm"
      >
        <p className={styles.meta}>
          <span>{formatPostDate(post.date)}</span>
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} min read</span>
          <span aria-hidden="true">·</span>
          <span>{SITE.name} blog</span>
        </p>
      </PageHero>

      <Container className={styles.wrap}>
        <img src={post.cover} alt="" className={styles.cover} data-reveal="fade-up" />

        <div className={styles.layout}>
          <article className={styles.article}>
            {post.body.map((block, index) => (
              <Fragment key={`${block.type}-${index}`}>
                <Block block={block} />
              </Fragment>
            ))}
          </article>

          {headings.length > 2 && (
            <nav aria-label="In this article" className={styles.toc}>
              <p className={styles.tocTitle}>In this article</p>
              <ol>
                {headings.map((heading) => (
                  <li key={heading.text}>
                    <a href={`#${headingId(heading.text)}`}>{heading.text}</a>
                  </li>
                ))}
              </ol>
              <Link to={BLOG_PATH} className={styles.back}>
                ← All articles
              </Link>
            </nav>
          )}
        </div>
      </Container>

      {related.length > 0 && (
        <section className={styles.related} aria-labelledby="related-title">
          <Container>
            <h2 id="related-title" className={styles.relatedTitle}>
              Keep reading
            </h2>
            <ul className={styles.relatedGrid}>
              {related.map((entry) => (
                <li key={entry.slug}>
                  <PostCard post={entry} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <CtaBand
        title="Ready to frame something?"
        text="Every piece comes in six sizes, framed and ready to hang."
        actions={
          <>
            <Button to={ROUTES.shop} variant="light" size="lg">
              Shop the collection
            </Button>
            <Button to={ROUTES.customFrames} variant="secondary" size="lg">
              Frame your photo
            </Button>
          </>
        }
      />
    </>
  );
}
