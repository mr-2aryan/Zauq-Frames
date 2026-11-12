import styles from './BuilderStep.module.css';

/**
 * A numbered builder step. Use `as="fieldset"` when the step groups form
 * controls so the title becomes the fieldset's `<legend>`.
 * @param {{ number: number, title: string, as?: 'div' | 'fieldset', children: import('react').ReactNode }} props
 */
export function BuilderStep({ number, title, as = 'div', children }) {
  const heading = (
    <>
      <span className={styles.number} aria-hidden="true">
        {number}
      </span>
      <span>
        <span className="sr-only">Step {number}: </span>
        {title}
      </span>
    </>
  );

  if (as === 'fieldset') {
    return (
      <fieldset className={styles.step}>
        <legend className={styles.title}>{heading}</legend>
        {children}
      </fieldset>
    );
  }

  return (
    <div className={styles.step}>
      <h3 className={styles.title}>{heading}</h3>
      {children}
    </div>
  );
}
