import { notFound } from "next/navigation";
import scenarios from "@/data/scenarios.json";
import type { Scenario } from "@/types";
import { ButtonLink } from "@/components/ButtonLink";

const scenarioData = scenarios as Scenario[];

export function generateStaticParams() {
  return scenarioData.map((scenario) => ({ scenarioId: scenario.id }));
}

export default function ResultsPage({
  params
}: {
  params: { scenarioId: string };
}) {
  const scenario = scenarioData.find((item) => item.id === params.scenarioId);

  if (!scenario) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-content px-5 py-14">
      <section className="border border-line bg-paper p-7">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          Evaluation submitted
        </p>
        <h1 className="mt-4 font-display text-4xl text-primary">
          Thank you for completing this demo evaluation.
        </h1>
        <p className="mt-5 max-w-3xl leading-8 text-muted">
          Your selections were recorded locally for this walkthrough only. No
          data is sent to a server in this demo.
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="border border-line bg-paper p-6">
          <h2 className="font-display text-2xl text-primary">
            Model identities
          </h2>
          <p className="mt-4 leading-8 text-muted">
            Model A was{" "}
            <span className="font-semibold text-ink">
              {scenario.modelA.trueName}
            </span>
            . Model B was{" "}
            <span className="font-semibold text-ink">
              {scenario.modelB.trueName}
            </span>
            .
          </p>
        </article>
        <article className="border border-line bg-paper p-6">
          <h2 className="font-display text-2xl text-primary">
            Mock aggregate
          </h2>
          <p className="mt-4 leading-8 text-muted">
            Across{" "}
            <span className="font-mono text-ink">
              {scenario.mockAggregate.totalEvaluations}
            </span>{" "}
            prior evaluations,{" "}
            <span className="font-mono text-ink">
              {scenario.mockAggregate.preferenceB}%
            </span>{" "}
            of clinicians preferred Model B.
          </p>
        </article>
      </section>

      <div className="mt-8 flex flex-wrap gap-4">
        <ButtonLink href="/evaluate">Try another scenario</ButtonLink>
        <ButtonLink href="/leaderboard" variant="secondary">
          View leaderboard
        </ButtonLink>
      </div>
    </main>
  );
}
