import examples from "@/data/examples.json";
import type { ExamplesData } from "@/types";
import { ButtonLink } from "@/components/ButtonLink";
import { PageShell } from "@/components/PageShell";

const examplesData = examples as ExamplesData;

const cards = [
  {
    title: "Single-patient chart audit / case annotation",
    href: "/examples/case-audit",
    description:
      "Review a simulated chart, select predefined case segments, attach clinical labels, build diagnostic reasoning, and preview a mock annotation payload.",
    badge: examplesData.caseAudit.category
  },
  {
    title: "RLHF-style pairwise response preference review",
    href: "/examples/preference-review",
    description:
      "Compare two simulated model responses, mark good and bad response segments, score clinical dimensions, choose a preference, and preview a mock submission.",
    badge: examplesData.preferenceReview.category
  },
  {
    title: "Staged chest pain audit",
    href: "/examples/case-audit/staged-chest-pain",
    description:
      "Progressively reveal the source ECG chest-pain case, update diagnostic judgment at each stage, and review how clinician reasoning changes over time.",
    badge: examplesData.stagedChestPainAudit.category
  }
];

export default function ExamplesPage() {
  return (
    <PageShell
      eyebrow="Mock clinical interaction examples"
      title="Example clinician data collection workflows"
      intro="These static frontend demos show how TRUST-Med can collect richer clinician judgment than a final diagnosis alone. All content is simulated, contains no PHI, uses no real medical search, and is not clinical guidance."
    >
      <section className="grid gap-5 py-9 md:grid-cols-2">
        {cards.map((card) => (
          <article key={card.href} className="border border-line bg-paper p-6">
            <span className="border border-line bg-background px-3 py-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {card.badge}
            </span>
            <h2 className="mt-4 font-display text-3xl leading-tight text-primary">
              {card.title}
            </h2>
            <p className="mt-4 leading-7 text-muted">{card.description}</p>
            <div className="mt-6">
              <ButtonLink href={card.href}>Open example</ButtonLink>
            </div>
          </article>
        ))}
      </section>

      <section className="border border-line bg-wash p-5">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
          Demo constraints
        </p>
        <p className="mt-3 leading-7 text-muted">
          Static mock data only. No backend, persistence, PHI, real patient
          records, real clinical search, or external service calls.
        </p>
      </section>
    </PageShell>
  );
}
