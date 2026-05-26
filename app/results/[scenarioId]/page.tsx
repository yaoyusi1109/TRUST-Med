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

  const isChinese = scenario.language === "中文";
  const copy = isChinese
    ? {
        eyebrow: "测评已提交",
        title: "感谢完成本次演示测评。",
        intro: "本次选择仅用于本地演示流程，不会上传服务器，也不会记录真实临床数据。",
        identities: "模型身份",
        identityText: (
          <>
            模型 A 为{" "}
            <span className="font-semibold text-ink">
              {scenario.modelA.trueName}
            </span>
            。模型 B 为{" "}
            <span className="font-semibold text-ink">
              {scenario.modelB.trueName}
            </span>
            。
          </>
        ),
        aggregate: "模拟汇总结果",
        aggregateText: (
          <>
            在此前{" "}
            <span className="font-mono text-ink">
              {scenario.mockAggregate.totalEvaluations}
            </span>{" "}
            次模拟测评中，{" "}
            <span className="font-mono text-ink">
              {scenario.mockAggregate.preferenceB}%
            </span>{" "}
            的临床医生更倾向于模型 B。
          </>
        ),
        another: "继续测评其他场景",
        leaderboard: "查看排行榜"
      }
    : {
        eyebrow: "Evaluation submitted",
        title: "Thank you for completing this demo evaluation.",
        intro:
          "Your selections were recorded locally for this walkthrough only. No data is sent to a server in this demo.",
        identities: "Model identities",
        identityText: (
          <>
            Model A was{" "}
            <span className="font-semibold text-ink">
              {scenario.modelA.trueName}
            </span>
            . Model B was{" "}
            <span className="font-semibold text-ink">
              {scenario.modelB.trueName}
            </span>
            .
          </>
        ),
        aggregate: "Mock aggregate",
        aggregateText: (
          <>
            Across{" "}
            <span className="font-mono text-ink">
              {scenario.mockAggregate.totalEvaluations}
            </span>{" "}
            prior evaluations,{" "}
            <span className="font-mono text-ink">
              {scenario.mockAggregate.preferenceB}%
            </span>{" "}
            of clinicians preferred Model B.
          </>
        ),
        another: "Try another scenario",
        leaderboard: "View leaderboard"
      };

  return (
    <main className="mx-auto max-w-content px-5 py-14">
      <section className="border border-line bg-paper p-7">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          {copy.eyebrow}
        </p>
        <h1 className="mt-4 font-display text-4xl text-primary">
          {copy.title}
        </h1>
        <p className="mt-5 max-w-3xl leading-8 text-muted">
          {copy.intro}
        </p>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <article className="border border-line bg-paper p-6">
          <h2 className="font-display text-2xl text-primary">
            {copy.identities}
          </h2>
          <p className="mt-4 leading-8 text-muted">{copy.identityText}</p>
        </article>
        <article className="border border-line bg-paper p-6">
          <h2 className="font-display text-2xl text-primary">
            {copy.aggregate}
          </h2>
          <p className="mt-4 leading-8 text-muted">{copy.aggregateText}</p>
        </article>
      </section>

      <div className="mt-8 flex flex-wrap gap-4">
        <ButtonLink href="/evaluate">{copy.another}</ButtonLink>
        <ButtonLink href="/leaderboard" variant="secondary">
          {copy.leaderboard}
        </ButtonLink>
      </div>
    </main>
  );
}
