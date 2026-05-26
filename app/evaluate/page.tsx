import Link from "next/link";
import scenarios from "@/data/scenarios.json";
import type { Scenario } from "@/types";
import { PageShell } from "@/components/PageShell";

const scenarioData = scenarios as Scenario[];

function difficultyLabel(scenario: Scenario) {
  if (scenario.language !== "中文") {
    return scenario.difficulty;
  }

  return scenario.difficulty === "High-Stakes" ? "高风险" : "常规场景";
}

export default function EvaluatePage() {
  return (
    <PageShell
      eyebrow="Demo walkthrough"
      title="Select one clinical scenario"
      intro="You'll review one clinical scenario, evaluate two anonymized AI model responses against a rubric, and indicate your preference. Estimated time: 3 minutes."
    >
      <section className="grid gap-4 py-9">
        {scenarioData.map((scenario) => (
          <Link
            key={scenario.id}
            href={`/evaluate/${scenario.id}`}
            className="grid gap-5 border border-line bg-paper p-5 transition-colors hover:bg-wash md:grid-cols-[1fr_auto]"
          >
            <div>
              <h2 className="font-display text-2xl text-primary">
                {scenario.title}
              </h2>
              <p className="mt-2 text-muted">{scenario.category}</p>
            </div>
            <div className="flex flex-wrap items-start gap-2 md:justify-end">
              <span className="border border-line bg-background px-3 py-1 font-mono text-xs text-muted">
                {scenario.language}
              </span>
              <span
                className={`border px-3 py-1 font-mono text-xs ${
                  scenario.difficulty === "High-Stakes"
                    ? "border-accent text-accent"
                    : "border-line text-muted"
                }`}
              >
                {difficultyLabel(scenario)}
              </span>
            </div>
          </Link>
        ))}
      </section>
    </PageShell>
  );
}
