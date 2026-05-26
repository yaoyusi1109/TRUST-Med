import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";

const differentiators = [
  {
    title: "Clinician-as-judge",
    body: "Real physicians at Johns Hopkins Medicine and Nanjing University evaluate model behavior directly, rather than delegating safety judgments to another LLM."
  },
  {
    title: "Cross-jurisdictional",
    body: "The same clinical scenario can be examined under US and Chinese clinical norms, across English and Chinese prompts, making disagreement visible instead of averaging it away."
  },
  {
    title: "Rubric-augmented pairwise",
    body: "Clinicians first complete scenario-specific safety and quality criteria, then make an anonymized pairwise preference choice between model responses."
  }
];

export default function Home() {
  return (
    <main>
      <section className="mx-auto grid max-w-content gap-12 px-5 py-20 md:grid-cols-[1.15fr_0.85fr] md:py-24">
        <div>
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-accent">
            Medical AI evaluation research demo
          </p>
          <h1 className="font-display text-5xl leading-none text-primary md:text-7xl">
            TRUST-Med
          </h1>
          <p className="mt-5 max-w-2xl font-display text-2xl leading-9 text-ink">
            Translational Real-world User-grounded Safety Testing for Medical AI
          </p>
          <p className="mt-8 max-w-xl text-xl leading-9 text-muted">
            Real clinicians. Real queries. Real evidence.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <ButtonLink href="/evaluate">Start Demo Walkthrough</ButtonLink>
            <Link
              href="/about"
              className="border-b border-primary pb-1 text-sm text-primary hover:text-accent"
            >
              About the Research
            </Link>
          </div>
        </div>
        <aside className="border-l border-line pl-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Demo scope
          </p>
          <dl className="mt-8 space-y-7">
            <div>
              <dt className="font-display text-3xl text-primary">5</dt>
              <dd className="text-sm text-muted">illustrative clinical scenarios</dd>
            </div>
            <div>
              <dt className="font-display text-3xl text-primary">2</dt>
              <dd className="text-sm text-muted">jurisdictional contexts: US and China</dd>
            </div>
            <div>
              <dt className="font-display text-3xl text-primary">0</dt>
              <dd className="text-sm text-muted">real patient data or external API calls</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="border-y border-line bg-wash">
        <div className="mx-auto grid max-w-content gap-5 px-5 py-12 md:grid-cols-3">
          {differentiators.map((item) => (
            <article
              key={item.title}
              className="border border-line bg-background p-6 transition-colors hover:bg-paper"
            >
              <h2 className="font-display text-2xl text-primary">{item.title}</h2>
              <p className="mt-4 leading-7 text-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-content px-5 py-8 text-sm leading-6 text-muted">
        A research collaboration between Johns Hopkins University and Nanjing
        University. Demo only — not for clinical use.
      </footer>
    </main>
  );
}
