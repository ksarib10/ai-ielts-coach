import { Link, useParams } from 'react-router-dom';
import { AppShell } from '../../../components/AppShell';
import { EmptyState, PageHeader } from '../../../components/UI';
import { aboutCard, isAboutTopicId } from '../../../content/ielts-about';
import { aboutIntro } from '../../../content/ielts-about/presentation';
import { AboutNotice } from '../about/AboutComponents';
import { AboutTopicBody } from '../about/AboutPages';
import { CatalogCard } from '../components/CatalogCard';
import { localCatalogSource } from '../services/catalog';
import { aboutHref } from '../routes';

export function IELTSAbout() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Information"
        title="IELTS About"
        description="Source-linked reference guides for how IELTS works, test format, timing, band scores, registration, delivery options, access arrangements and FAQs."
      />
      <AboutNotice title="Editorial draft · Source-linked reference">
        <p>These guides summarize mapped IELTS reference facts with links to official sources. They are editorial drafts pending owner review and do not replace official instructions from your test provider or receiving institution.</p>
      </AboutNotice>
      <div className="discovery-grid">
        {localCatalogSource.about().map(item => (
          <CatalogCard
            key={item.id}
            item={item}
            href={aboutHref(item.id)}
            statusLabel="Editorial draft"
            actionLabel="Read guide"
          />
        ))}
      </div>
    </AppShell>
  );
}

export function IELTSAboutTopic() {
  const { topicId } = useParams();
  if (!isAboutTopicId(topicId)) {
    return (
      <AppShell>
        <Link className="discovery-back" to="/ielts-about">Back to IELTS About</Link>
        <EmptyState title="Information topic not found" detail="Use IELTS About to choose an available topic." />
      </AppShell>
    );
  }
  const card = aboutCard(topicId);
  return (
    <AppShell>
      <Link className="discovery-back" to="/ielts-about">Back to IELTS About</Link>
      <PageHeader
        eyebrow="IELTS information"
        title={card.title}
        description={aboutIntro[topicId]}
        actions={<span className="availability-label">Editorial draft · Source-linked</span>}
      />
      <div className="about-page" data-topic-id={topicId}>
        <AboutTopicBody id={topicId} />
        <footer className="about-footer">
          <p>
            <strong>Editorial draft ({card.lastCompiled}).</strong> {card.rightsNote} Always confirm current policies, eligibility and score requirements directly with your official test provider and receiving organization.
          </p>
          <Link className="btn btn-secondary" to="/ielts-about">Browse all IELTS About topics</Link>
        </footer>
      </div>
    </AppShell>
  );
}
