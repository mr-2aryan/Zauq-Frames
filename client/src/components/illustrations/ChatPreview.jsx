import { useEffect, useRef, useState } from 'react';
import { WhatsAppIcon } from '@/components/icons';
import styles from './ChatPreview.module.css';

/**
 * A phone showing a chat with Zauq: common questions are asked one by one and
 * answered after a moment of "typing", then the chat starts over. The box at
 * the bottom opens a real WhatsApp chat. Pauses while off screen; with reduced
 * motion the whole conversation simply shows.
 * @param {{ messages: Array<{ q: string, a: string }>, hours: string, href: string, chips?: string[] }} props
 */
export function ChatPreview({ messages, hours, href, chips = [] }) {
  const rootRef = useRef(null);
  const [still] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const total = messages.length * 2;
  const [step, setStep] = useState(still ? total : 0);
  const [typing, setTyping] = useState(false);
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  // The conversation: a question, a short pause, "typing…", the answer — then the next.
  useEffect(() => {
    if (still || !onScreen) return undefined;
    let timer;
    if (step >= total) timer = window.setTimeout(() => setStep(0), 5200);
    else if (step % 2 === 0) timer = window.setTimeout(() => setStep(step + 1), step === 0 ? 700 : 1500);
    else if (!typing) timer = window.setTimeout(() => setTyping(true), 450);
    else
      timer = window.setTimeout(() => {
        setTyping(false);
        setStep(step + 1);
      }, 1300);
    return () => window.clearTimeout(timer);
  }, [step, typing, onScreen, still, total]);

  const bubbles = messages.flatMap((message, index) => [
    { key: `q${index}`, mine: true, text: message.q },
    { key: `a${index}`, mine: false, text: message.a },
  ]);

  return (
    <div ref={rootRef} className={styles.scene}>
      {chips.map((chip, index) => (
        <span key={chip} className={styles.chip} style={{ '--i': index }} aria-hidden="true">
          {chip}
        </span>
      ))}

      <div className={styles.phone}>
        <div className={styles.screen}>
          <div className={styles.header}>
            <span className={styles.avatar} aria-hidden="true">
              Z
            </span>
            <span className={styles.who}>
              <strong>Zauq Frames</strong>
              <span>
                <i className={styles.online} aria-hidden="true" /> Replies {hours}
              </span>
            </span>
          </div>

          <div className={styles.thread} aria-hidden="true">
            {bubbles.slice(0, step).map((bubble) => (
              <p key={bubble.key} className={bubble.mine ? styles.mine : styles.theirs}>
                {bubble.text}
              </p>
            ))}
            {typing && (
              <p className={`${styles.theirs} ${styles.typing}`}>
                <span />
                <span />
                <span />
              </p>
            )}
          </div>

          <a href={href} target="_blank" rel="noopener noreferrer" className={styles.composer}>
            <span>Ask your own question…</span>
            <span className={styles.send} aria-hidden="true">
              <WhatsAppIcon size={18} />
            </span>
            <span className="sr-only">Ask us on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
