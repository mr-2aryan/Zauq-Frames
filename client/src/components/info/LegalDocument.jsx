import { Container } from '@/components/ui';
import styles from './LegalDocument.module.css';

/**
 * A long policy page: a sticky table of contents (desktop) beside numbered
 * sections. Section bodies are plain JSX (paragraphs and lists).
 * @param {{
 *   updated: string,
 *   intro?: import('react').ReactNode,
 *   sections: Array<{ id: string, title: string, body: import('react').ReactNode }>,
 *   aside?: import('react').ReactNode,
 * }} props
 */
export function LegalDocument({ updated, intro, sections, aside }) {
  return (
    <Container className={styles.wrap}>
      <div className={styles.layout}>
        <nav aria-label="On this page" className={styles.toc}>
          <p className={styles.tocTitle}>On this page</p>
          <ol className={styles.tocList}>
            {sections.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>
                  <span className={styles.tocNumber}>{index + 1}.</span> {section.title}
                </a>
              </li>
            ))}
          </ol>
          {aside && <div className={styles.tocAside}>{aside}</div>}
        </nav>

        <article className={styles.doc}>
          <p className={styles.updated}>Last updated {updated}</p>
          {intro && <div className={styles.intro}>{intro}</div>}
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className={styles.section} aria-labelledby={`${section.id}-title`}>
              <h2 id={`${section.id}-title`} className={styles.sectionTitle}>
                <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
                {section.title}
              </h2>
              <div className={styles.body}>{section.body}</div>
            </section>
          ))}
        </article>
      </div>
    </Container>
  );
}
