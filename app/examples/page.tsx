"use client";

import examples from "@/data/examples.json";
import type { ExamplesData } from "@/types";
import { ButtonLink } from "@/components/ButtonLink";
import { LanguageToggle, useLanguage } from "@/components/LanguageProvider";
import { PageShell } from "@/components/PageShell";

const examplesData = examples as ExamplesData;

const cards = [
  {
    title: {
      en: "Case Audit",
      zh: "病历审计"
    },
    href: "/examples/case-audit",
    description: {
      en: "Review a simulated chart, select predefined case segments, attach clinical labels, build diagnostic reasoning, and preview a mock annotation payload.",
      zh: "审阅模拟病历，选择预定义病例片段，添加临床标签，构建诊断推理，并预览模拟标注数据负载。"
    },
    badge: examplesData.caseAudit.category
  },
  {
    title: {
      en: "Preference Review",
      zh: "偏好评审"
    },
    href: "/examples/preference-review",
    description: {
      en: "Compare two simulated model responses, mark good and bad response segments, score clinical dimensions, choose a preference, and preview a mock submission.",
      zh: "比较两个模拟模型回答，标记优劣片段，完成临床维度评分，选择偏好，并预览模拟提交。"
    },
    badge: examplesData.preferenceReview.category
  },
  {
    title: {
      en: "Staged Chest Pain Audit",
      zh: "分阶段胸痛病历审计"
    },
    href: "/examples/case-audit/staged-chest-pain",
    description: {
      en: "Progressively reveal the source ECG chest-pain case, update diagnostic judgment at each stage, and review how clinician reasoning changes over time.",
      zh: "分阶段披露胸痛心电图病例，在每一阶段更新诊断判断，并复盘临床推理如何随信息增加而变化。"
    },
    badge: examplesData.stagedChestPainAudit.category
  }
];

const examplesCopy = {
  en: {
    eyebrow: "Mock clinical interaction examples",
    title: "Example Clinician Data Collection Workflows",
    subtitle: "临床医生数据采集示例流程",
    intro:
      "These static frontend demos show how TRUST-Med can collect richer clinician judgment than a final diagnosis alone. All content is simulated, contains no PHI, uses no real medical search, and is not clinical guidance.",
    secondaryIntro:
      "这些静态前端演示展示 TRUST-Med 如何采集比最终诊断更丰富的临床判断。所有内容均为模拟演示数据，不含 PHI，不使用真实医学检索，且非临床指导。",
    open: "Open example",
    constraints: "Demo constraints",
    constraintsBody:
      "Static mock data only. No backend, persistence, PHI, real patient records, real clinical search, or external service calls."
  },
  zh: {
    eyebrow: "模拟临床交互示例",
    title: "临床医生数据采集示例流程",
    subtitle: "Example Clinician Data Collection Workflows",
    intro:
      "这些静态前端演示展示 TRUST-Med 如何采集比最终诊断更丰富的临床判断。所有内容均为模拟演示数据，不含 PHI，不使用真实医学检索，且非临床指导。",
    secondaryIntro:
      "These static frontend demos show how TRUST-Med can collect richer clinician judgment than a final diagnosis alone. All content is simulated, contains no PHI, uses no real medical search, and is not clinical guidance.",
    open: "打开示例",
    constraints: "演示约束",
    constraintsBody:
      "仅使用静态模拟数据。无后端、无持久化、无 PHI、无真实患者记录、无真实临床检索、无外部服务调用。"
  }
} as const;

export default function ExamplesPage() {
  const { language } = useLanguage();
  const copy = examplesCopy[language];
  const secondaryLanguage = language === "en" ? "zh" : "en";

  return (
    <PageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      intro={copy.intro}
    >
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-display text-2xl text-muted">{copy.subtitle}</p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            {copy.secondaryIntro}
          </p>
        </div>
        <LanguageToggle compact />
      </div>

      <section className="grid gap-5 py-9 md:grid-cols-2">
        {cards.map((card) => (
          <article key={card.href} className="border border-line bg-paper p-6">
            <span className="border border-line bg-background px-3 py-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {card.badge}
            </span>
            <h2 className="mt-4 font-display text-3xl leading-tight text-primary">
              {card.title[language]}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              {card.title[secondaryLanguage]}
            </p>
            <p className="mt-4 leading-7 text-muted">
              {card.description[language]}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {card.description[secondaryLanguage]}
            </p>
            <div className="mt-6">
              <ButtonLink href={card.href}>{copy.open}</ButtonLink>
            </div>
          </article>
        ))}
      </section>

      <section className="border border-line bg-wash p-5">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
          {copy.constraints}
        </p>
        <p className="mt-3 leading-7 text-muted">
          {copy.constraintsBody}
        </p>
      </section>
    </PageShell>
  );
}
