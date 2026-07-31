import Link from "next/link";
import { ArrowLeft, CalendarClock, Waves } from "lucide-react";

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

interface RelatedLink {
  href: string;
  label: string;
}

interface LegalLayoutProps {
  badge: string;
  title: string;
  lead: string;
  updated: string;
  sections: LegalSection[];
  related?: RelatedLink[];
}

export default function LegalLayout({ badge, title, lead, updated, sections, related = [] }: LegalLayoutProps) {
  return (
    <main className="legal-page">
      <nav className="legal-nav">
        <Link href="/" className="brand" aria-label="Zomee home">
          <span className="brand-mark">
            <Waves size={22} color="white" />
          </span>
          <span className="brand-name">Zomee</span>
        </Link>
        <Link href="/" className="legal-back">
          <ArrowLeft size={16} />
          Back to home
        </Link>
      </nav>

      <div className="legal-container">
        <header className="legal-hero">
          <span className="legal-badge">{badge}</span>
          <h1 className="legal-title text-balance">{title}</h1>
          <p className="legal-lead text-pretty">{lead}</p>
          <p className="legal-updated">
            <CalendarClock size={15} />
            Last updated: {updated}
          </p>
        </header>

        <nav className="legal-toc glass-panel" aria-label="Table of contents">
          <p className="legal-toc-title">On this page</p>
          <ul className="legal-toc-list">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="legal-toc-link">
                  <span className="legal-toc-num">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="legal-body">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="legal-section glass-panel">
              <h2>
                <span className="legal-section-num">{i + 1}</span>
                {s.title}
              </h2>
              {s.body}
            </section>
          ))}
        </div>

        <section className="legal-contact glass-panel">
          <h3>Questions about this policy?</h3>
          <p>We&apos;re happy to help. Reach our team and we&apos;ll get back to you.</p>
          <a href="mailto:privacy@zomee.app" className="legal-mail">privacy@zomee.app</a>
          {related.length > 0 && (
            <div className="legal-related">
              {related.map((r) => (
                <Link key={r.href} href={r.href} className="legal-back">
                  {r.label}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
