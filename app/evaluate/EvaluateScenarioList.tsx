"use client";

import Link from "next/link";
import { LanguageToggle, useLanguage } from "@/components/LanguageProvider";
import { PageShell } from "@/components/PageShell";
import type { Scenario } from "@/types";
import {
  difficultyLabel,
  scenarioCategory,
  scenarioModality,
  scenarioTitle
} from "@/lib/i18n";

export function EvaluateScenarioList({ scenarios }: { scenarios: Scenario[] }) {
  const { language } = useLanguage();
  const copy =
    language === "zh"
      ? {
          eyebrow: "演示测评",
          title: "选择一个多模态临床场景",
          intro:
            "你将阅读一个临床场景，查看附加材料，依据场景专属量表评价两个匿名医学 AI 回答，并提交整体偏好。预计用时约3分钟。"
        }
      : {
          eyebrow: "Demo walkthrough",
          title: "Select one multimodal clinical scenario",
          intro:
            "You'll review one clinical scenario, inspect the attached material when present, evaluate two anonymized AI model responses against a rubric, and indicate your preference. Estimated time: 3 minutes."
        };

  return (
    <PageShell eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro}>
      <div className="mt-6 flex justify-end">
        <LanguageToggle />
      </div>
      <section className="grid gap-4 py-9">
        {scenarios.map((scenario) => (
          <Link
            key={scenario.id}
            href={`/evaluate/${scenario.id}`}
            className="grid gap-5 border border-line bg-paper p-5 transition-colors hover:bg-wash md:grid-cols-[1fr_auto]"
          >
            <div>
              <h2 className="font-display text-2xl text-primary">
                {scenarioTitle(scenario, language)}
              </h2>
              <p className="mt-2 text-muted">
                {scenarioCategory(scenario, language)}
              </p>
            </div>
            <div className="flex flex-wrap items-start gap-2 md:justify-end">
              <span className="border border-line bg-background px-3 py-1 font-mono text-xs text-muted">
                {scenario.language}
              </span>
              <span className="border border-primary bg-background px-3 py-1 font-mono text-xs text-primary">
                {scenarioModality(scenario, language)}
              </span>
              <span
                className={`border px-3 py-1 font-mono text-xs ${
                  scenario.difficulty === "High-Stakes"
                    ? "border-accent text-accent"
                    : "border-line text-muted"
                }`}
              >
                {difficultyLabel(scenario.difficulty, language)}
              </span>
            </div>
          </Link>
        ))}
      </section>
    </PageShell>
  );
}
