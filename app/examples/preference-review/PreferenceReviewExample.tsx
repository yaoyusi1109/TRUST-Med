"use client";

import { useState } from "react";
import Link from "next/link";
import { LanguageToggle, useLanguage } from "@/components/LanguageProvider";
import { PageShell } from "@/components/PageShell";
import type { ExamplePreferenceReview, ExampleSegment } from "@/types";

const PREFERENCE_OPTIONS = [
  ["a_better", "A is better", "A 更好"],
  ["b_better", "B is better", "B 更好"],
  ["tie", "Tie", "平局"],
  ["both_unsafe", "Both unsafe / unacceptable", "两者均不安全或不可接受"]
] as const;

const RESPONSE_LABELS = [
  "clinically correct",
  "clinically unsafe",
  "unsupported claim",
  "missed red flag",
  "overconfident",
  "useful reasoning",
  "poor uncertainty calibration",
  "wrong recommendation",
  "good patient communication",
  "too vague",
  "too verbose"
] as const;

const DIMENSIONS = [
  ["accuracy", "Accuracy", "准确性"],
  ["safety", "Safety", "安全性"],
  ["completeness", "Completeness", "完整性"],
  ["reasoningQuality", "Reasoning quality", "推理质量"],
  ["uncertaintyCalibration", "Uncertainty calibration", "不确定性校准"],
  ["communication", "Communication", "沟通表达"],
  ["workflowUsefulness", "Workflow usefulness", "工作流可用性"]
] as const;

const responseLabelCopy: Record<ResponseLabel, { en: string; zh: string }> = {
  "clinically correct": { en: "clinically correct", zh: "临床正确" },
  "clinically unsafe": { en: "clinically unsafe", zh: "临床不安全" },
  "unsupported claim": { en: "unsupported claim", zh: "缺乏支持的主张" },
  "missed red flag": { en: "missed red flag", zh: "遗漏红旗征象" },
  overconfident: { en: "overconfident", zh: "过度自信" },
  "useful reasoning": { en: "useful reasoning", zh: "有用推理" },
  "poor uncertainty calibration": {
    en: "poor uncertainty calibration",
    zh: "不确定性校准不足"
  },
  "wrong recommendation": { en: "wrong recommendation", zh: "错误建议" },
  "good patient communication": {
    en: "good patient communication",
    zh: "良好医患沟通"
  },
  "too vague": { en: "too vague", zh: "过于笼统" },
  "too verbose": { en: "too verbose", zh: "过于冗长" }
};

const preferenceCopy = {
  en: {
    eyebrow: "Mock preference review",
    title: "Pairwise Response Preference Review",
    subtitle: "成对回答偏好评审",
    intro:
      "Simulated demo case and model responses only. No PHI, no real patient data, no real medical search, and not clinical guidance.",
    secondaryIntro:
      "仅使用模拟病例和模拟模型回答。不含 PHI、无真实患者数据、无真实医学检索，且非临床指导。",
    back: "Back to examples",
    badge: "Simulated model responses / Not clinical guidance",
    clinicalCase: "Clinical Case",
    caseShown: "Case shown to both models",
    responseA: "Response A",
    responseB: "Response B",
    clickToSelect: "Click to select",
    tags: "tag(s)",
    segmentFeedback: "Segment-Level Feedback",
    markSpans: "Mark good or bad spans",
    selectedSegment: "Selected response segment",
    selectSegmentFirst: "Select a response segment first.",
    good: "good",
    bad: "bad",
    segmentLabel: "Segment label",
    addSpanLabel: "Add span label",
    preferenceDecision: "Preference Decision",
    overallJudgment: "Overall judgment",
    dimensionScores: "Dimension Scores",
    rationale: "Rationale",
    rationalePlaceholder: "Explain what drove the preference...",
    mockPayload: "Mock Preference Payload",
    payloadPreview: "Payload preview",
    highlightedSpans: "Highlighted spans",
    safetyErrorTags: "Safety/error tags"
  },
  zh: {
    eyebrow: "模拟偏好评审",
    title: "成对回答偏好评审",
    subtitle: "Pairwise Response Preference Review",
    intro:
      "仅使用模拟病例和模拟模型回答。不含 PHI、无真实患者数据、无真实医学检索，且非临床指导。",
    secondaryIntro:
      "Simulated demo case and model responses only. No PHI, no real patient data, no real medical search, and not clinical guidance.",
    back: "返回示例",
    badge: "模拟模型回答 / 非临床指导",
    clinicalCase: "临床病例",
    caseShown: "两个模型均看到的病例",
    responseA: "回答 A",
    responseB: "回答 B",
    clickToSelect: "点击选择",
    tags: "个标签",
    segmentFeedback: "片段级反馈",
    markSpans: "标记优劣片段",
    selectedSegment: "已选回答片段",
    selectSegmentFirst: "请先选择一个回答片段。",
    good: "好",
    bad: "差",
    segmentLabel: "片段标签",
    addSpanLabel: "添加片段标签",
    preferenceDecision: "偏好选择",
    overallJudgment: "总体判断",
    dimensionScores: "分维度评分",
    rationale: "评审理由",
    rationalePlaceholder: "说明影响偏好选择的关键原因...",
    mockPayload: "模拟偏好数据负载",
    payloadPreview: "数据负载预览",
    highlightedSpans: "已标记片段",
    safetyErrorTags: "安全性/错误标签"
  }
} as const;

type PreferenceCopy = Record<keyof (typeof preferenceCopy)["en"], string>;

type PreferenceChoice = (typeof PREFERENCE_OPTIONS)[number][0];
type ResponseLabel = (typeof RESPONSE_LABELS)[number];
type DimensionKey = (typeof DIMENSIONS)[number][0];
type Polarity = "good" | "bad";

type ResponseTarget = {
  response: "a" | "b";
  segment: ExampleSegment;
};

type ResponseAnnotation = {
  id: string;
  response: "a" | "b";
  targetId: string;
  targetText: string;
  polarity: Polarity;
  label: ResponseLabel;
};

type DimensionScores = Record<DimensionKey, number>;

const INITIAL_SCORES = Object.fromEntries(
  DIMENSIONS.map(([key]) => [key, 3])
) as DimensionScores;

function choiceLabel(choice: PreferenceChoice) {
  return PREFERENCE_OPTIONS.find(([value]) => value === choice)?.[1] ?? choice;
}

function rejectedAnswer(choice: PreferenceChoice) {
  if (choice === "a_better") {
    return "Response B";
  }
  if (choice === "b_better") {
    return "Response A";
  }
  return null;
}

function selectedAnswer(choice: PreferenceChoice) {
  if (choice === "a_better") {
    return "Response A";
  }
  if (choice === "b_better") {
    return "Response B";
  }
  if (choice === "tie") {
    return "Tie";
  }
  return "Both unsafe / unacceptable";
}

export function PreferenceReviewExample({
  example
}: {
  example: ExamplePreferenceReview;
}) {
  const { language } = useLanguage();
  const copy = preferenceCopy[language];
  const firstSegment = example.responses.a.segments[0];
  const [selectedTarget, setSelectedTarget] = useState<ResponseTarget | null>(
    firstSegment ? { response: "a", segment: firstSegment } : null
  );
  const [polarity, setPolarity] = useState<Polarity>("good");
  const [responseLabel, setResponseLabel] =
    useState<ResponseLabel>("clinically correct");
  const [annotations, setAnnotations] = useState<ResponseAnnotation[]>([]);
  const [preference, setPreference] =
    useState<PreferenceChoice>("a_better");
  const [scores, setScores] = useState<DimensionScores>(INITIAL_SCORES);
  const [rationale, setRationale] = useState("");

  const safetyTags = annotations
    .filter((annotation) =>
      [
        "clinically unsafe",
        "unsupported claim",
        "missed red flag",
        "overconfident",
        "poor uncertainty calibration",
        "wrong recommendation"
      ].includes(annotation.label)
    )
    .map((annotation) => ({
      response: annotation.response === "a" ? "Response A" : "Response B",
      label: annotation.label,
      text: annotation.targetText
    }));

  const payloadPreview = {
    caseId: example.id,
    chosenAnswer: selectedAnswer(preference),
    rejectedAnswer: rejectedAnswer(preference),
    state:
      preference === "tie" || preference === "both_unsafe"
        ? choiceLabel(preference)
        : null,
    highlightedSpans: annotations,
    safetyErrorTags: safetyTags,
    dimensionScores: scores,
    rationale
  };

  function saveAnnotation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTarget) {
      return;
    }
    setAnnotations((current) => [
      ...current,
      {
        id: `response-annotation-${Date.now()}`,
        response: selectedTarget.response,
        targetId: selectedTarget.segment.id,
        targetText: selectedTarget.segment.text,
        polarity,
        label: responseLabel
      }
    ]);
  }

  function annotationsForSegment(response: "a" | "b", segmentId: string) {
    return annotations.filter(
      (annotation) =>
        annotation.response === response && annotation.targetId === segmentId
    );
  }

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
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/examples"
              className="border border-line bg-background px-4 py-2 text-sm text-muted hover:border-primary hover:text-primary"
            >
              {copy.back}
            </Link>
            <span className="border border-accent bg-background px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-accent">
              {copy.badge}
            </span>
          </div>
        </div>
        <LanguageToggle compact />
      </div>

      <div className="grid gap-6 py-9 xl:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <article className="border border-line bg-paper p-5">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
              {copy.clinicalCase}
            </p>
            <h2 className="mt-2 font-display text-3xl text-primary">
              {copy.caseShown}
            </h2>
            <div className="mt-4 grid gap-3">
              {example.caseSummary.map((segment) => (
                <div key={segment.id} className="border border-line bg-background p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                    {segment.label}
                  </p>
                  <p className="mt-2 leading-7 text-ink">{segment.text}</p>
                </div>
              ))}
            </div>
          </article>

          <section className="grid gap-5 lg:grid-cols-2">
            {(["a", "b"] as const).map((responseId) => {
              const response = example.responses[responseId];
              return (
                <article key={responseId} className="border border-line bg-paper">
                  <div className="border-b border-line bg-wash px-5 py-3">
                    <p className="font-mono text-xs uppercase tracking-[0.14em] text-primary">
                      {responseId === "a" ? copy.responseA : copy.responseB}
                    </p>
                  </div>
                  <div className="space-y-3 p-5">
                    {response.segments.map((segment) => {
                      const selected =
                        selectedTarget?.response === responseId &&
                        selectedTarget.segment.id === segment.id;
                      const segmentAnnotations = annotationsForSegment(
                        responseId,
                        segment.id
                      );
                      return (
                        <button
                          key={segment.id}
                          type="button"
                          onClick={() =>
                            setSelectedTarget({
                              response: responseId,
                              segment
                            })
                          }
                          className={`w-full border p-3 text-left leading-6 transition-colors ${
                            selected
                              ? "border-primary bg-primary text-white"
                              : segmentAnnotations.length
                                ? "border-[#C8A442] bg-[#FFF4BF] text-ink"
                                : "border-line bg-background text-muted hover:border-primary hover:text-ink"
                          }`}
                        >
                          <span className="block">{segment.text}</span>
                          <span
                            className={`mt-2 block font-mono text-[10px] uppercase tracking-[0.12em] ${
                              selected ? "text-white/75" : "text-muted"
                            }`}
                          >
                            {segmentAnnotations.length
                              ? `${segmentAnnotations.length} ${copy.tags}`
                              : copy.clickToSelect}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </section>
        </section>

        <aside className="space-y-5">
          <SegmentTagPanel
            selectedTarget={selectedTarget}
            polarity={polarity}
            responseLabel={responseLabel}
            language={language}
            copy={copy}
            onPolarityChange={setPolarity}
            onLabelChange={setResponseLabel}
            onSubmit={saveAnnotation}
          />
          <PreferencePanel
            preference={preference}
            scores={scores}
            rationale={rationale}
            language={language}
            copy={copy}
            onPreferenceChange={setPreference}
            onScoreChange={(dimension, value) =>
              setScores((current) => ({
                ...current,
                [dimension]: value
              }))
            }
            onRationaleChange={setRationale}
          />
          <PreferenceSummary
            annotations={annotations}
            safetyTags={safetyTags}
            payloadPreview={payloadPreview}
            copy={copy}
          />
        </aside>
      </div>
    </PageShell>
  );
}

function SegmentTagPanel({
  selectedTarget,
  polarity,
  responseLabel,
  language,
  copy,
  onPolarityChange,
  onLabelChange,
  onSubmit
}: {
  selectedTarget: ResponseTarget | null;
  polarity: Polarity;
  responseLabel: ResponseLabel;
  language: "en" | "zh";
  copy: PreferenceCopy;
  onPolarityChange: (polarity: Polarity) => void;
  onLabelChange: (label: ResponseLabel) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="border border-line bg-paper p-4">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        {copy.segmentFeedback}
      </p>
      <h2 className="mt-2 font-display text-2xl text-primary">
        {copy.markSpans}
      </h2>
      <div className="mt-4 border border-line bg-background p-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          {copy.selectedSegment}
        </p>
        <p className="mt-2 text-sm leading-6 text-ink">
          {selectedTarget
            ? `${selectedTarget.response === "a" ? "Response A" : "Response B"}: ${selectedTarget.segment.text}`
            : copy.selectSegmentFirst}
        </p>
      </div>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <fieldset className="grid grid-cols-2 gap-2">
          {(["good", "bad"] as const).map((value) => (
            <label
              key={value}
              className={`flex items-center justify-center gap-2 border px-3 py-2 text-sm capitalize ${
                polarity === value
                  ? "border-primary bg-primary text-white"
                  : "border-line bg-background text-muted"
              }`}
            >
              <input
                type="radio"
                name="polarity"
                value={value}
                checked={polarity === value}
                onChange={() => onPolarityChange(value)}
              />
              {value === "good" ? copy.good : copy.bad}
            </label>
          ))}
        </fieldset>
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            {copy.segmentLabel}
          </span>
          <select
            value={responseLabel}
            onChange={(event) =>
              onLabelChange(event.target.value as ResponseLabel)
            }
            className="mt-2 w-full border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-primary"
          >
            {RESPONSE_LABELS.map((label) => (
              <option key={label} value={label}>
                {responseLabelCopy[label][language]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={!selectedTarget}
          className="w-full border border-primary bg-primary px-4 py-2 text-sm text-white hover:bg-background hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copy.addSpanLabel}
        </button>
      </form>
    </section>
  );
}

function PreferencePanel({
  preference,
  scores,
  rationale,
  language,
  copy,
  onPreferenceChange,
  onScoreChange,
  onRationaleChange
}: {
  preference: PreferenceChoice;
  scores: DimensionScores;
  rationale: string;
  language: "en" | "zh";
  copy: PreferenceCopy;
  onPreferenceChange: (choice: PreferenceChoice) => void;
  onScoreChange: (dimension: DimensionKey, value: number) => void;
  onRationaleChange: (rationale: string) => void;
}) {
  return (
    <section className="border border-line bg-paper p-4">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        {copy.preferenceDecision}
      </p>
      <h2 className="mt-2 font-display text-2xl text-primary">
        {copy.overallJudgment}
      </h2>
      <fieldset className="mt-4 grid gap-2">
        {PREFERENCE_OPTIONS.map(([value, labelEn, labelZh]) => (
          <label
            key={value}
            className={`flex items-center gap-3 border p-3 text-sm ${
              preference === value
                ? "border-primary bg-primary text-white"
                : "border-line bg-background text-ink"
            }`}
          >
            <input
              type="radio"
              name="preference"
              value={value}
              checked={preference === value}
              onChange={() => onPreferenceChange(value)}
            />
            {language === "en" ? labelEn : labelZh}
          </label>
        ))}
      </fieldset>

      <div className="mt-5 border-t border-line pt-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          {copy.dimensionScores}
        </p>
        <div className="mt-3 space-y-3">
          {DIMENSIONS.map(([key, labelEn, labelZh]) => (
            <label key={key} className="block">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted">
                  {language === "en" ? labelEn : labelZh}
                </span>
                <span className="font-mono text-primary">{scores[key]}</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={scores[key]}
                onChange={(event) =>
                  onScoreChange(key, Number(event.target.value))
                }
                className="mt-1 w-full accent-[#002D72]"
              />
            </label>
          ))}
        </div>
      </div>

      <label className="mt-5 block">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          {copy.rationale}
        </span>
        <textarea
          value={rationale}
          onChange={(event) => onRationaleChange(event.target.value)}
          className="mt-2 min-h-24 w-full border border-line bg-background p-3 text-sm leading-6 text-ink outline-none focus:border-primary"
          placeholder={copy.rationalePlaceholder}
        />
      </label>
    </section>
  );
}

function PreferenceSummary({
  annotations,
  safetyTags,
  payloadPreview,
  copy
}: {
  annotations: ResponseAnnotation[];
  safetyTags: { response: string; label: ResponseLabel; text: string }[];
  payloadPreview: object;
  copy: PreferenceCopy;
}) {
  return (
    <section className="border border-line bg-paper p-4">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        {copy.mockPayload}
      </p>
      <h2 className="mt-2 font-display text-2xl text-primary">
        {copy.payloadPreview}
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="border border-line bg-background p-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            {copy.highlightedSpans}
          </p>
          <p className="mt-1 text-sm text-ink">{annotations.length}</p>
        </div>
        <div className="border border-line bg-background p-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            {copy.safetyErrorTags}
          </p>
          <p className="mt-1 text-sm text-ink">{safetyTags.length}</p>
        </div>
      </div>
      <pre className="mt-4 max-h-[360px] overflow-auto border border-line bg-ink p-3 font-mono text-[11px] leading-5 text-white">
        {JSON.stringify(payloadPreview, null, 2)}
      </pre>
    </section>
  );
}
