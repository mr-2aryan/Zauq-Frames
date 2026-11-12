import { useId } from 'react';
import { Panel, Section, SectionHeader, StatusMessage } from '@/components/ui';
import { useCatalog } from '@/context/catalog/useCatalog';
import { FrameBuilder } from './FrameBuilder.jsx';
import styles from './FrameBuilderSection.module.css';

/** "Create your custom frame" — shows the builder once the catalogue has loaded. */
export function FrameBuilderSection() {
  const headingId = useId();
  const { status, catalog, error, reload } = useCatalog();

  return (
    <Section id="builder" aria-labelledby={headingId}>
      <SectionHeader id={headingId} title="Create your custom frame" description="Upload a photo, see it framed instantly, and choose a size." />
      <Panel tone="outline" className={styles.panel}>
        {status === 'success' ? (
          <FrameBuilder catalog={catalog} />
        ) : (
          <StatusMessage status={status} message={status === 'loading' ? 'Loading frame sizes…' : error?.message} onRetry={reload} />
        )}
      </Panel>
    </Section>
  );
}
