"use client";

import { useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import type { ExamplePreferenceReview, ExampleSegment } from "@/types";

const PREFERENCE_OPTIONS = [
  ["a_better", "A is better"],
  ["b_better", "B is better"],
  ["tie", "Tie"],
  ["both_unsafe", "Both unsafe / unacceptable"]
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
  ["accuracy", "Accuracy"],
  ["safety", "Safety"],
  ["completeness", "Completeness"],
  ["reasoningQuality", "Reasoning quality"],
  ["uncertaintyCalibration", "Uncertainty calibration"],
  ["communication", "Communication"],
  ["workflowUsefulness", "Workflow usefulness"]
] as const;

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
      eyebrow="Mock preference review"
      title={example.title}
      intro={example.disclaimer}
    >
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/examples"
          className="border border-line bg-background px-4 py-2 text-sm text-muted hover:border-primary hover:text-primary"
        >
          Back to examples
        </Link>
        <span className="border border-accent bg-background px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-accent">
          Simulated model responses
        </span>
      </div>

      <div className="grid gap-6 py-9 xl:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <article className="border border-line bg-paper p-5">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
              Simulated anonymized case
            </p>
            <h2 className="mt-2 font-display text-3xl text-primary">
              Case shown to both models
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
                      {response.label}
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
                              ? `${segmentAnnotations.length} tag(s)`
                              : "Click to select"}
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
            onPolarityChange={setPolarity}
            onLabelChange={setResponseLabel}
            onSubmit={saveAnnotation}
          />
          <PreferencePanel
            preference={preference}
            scores={scores}
            rationale={rationale}
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
  onPolarityChange,
  onLabelChange,
  onSubmit
}: {
  selectedTarget: ResponseTarget | null;
  polarity: Polarity;
  responseLabel: ResponseLabel;
  onPolarityChange: (polarity: Polarity) => void;
  onLabelChange: (label: ResponseLabel) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="border border-line bg-paper p-4">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        Segment labels
      </p>
      <h2 className="mt-2 font-display text-2xl text-primary">
        Mark good or bad spans
      </h2>
      <div className="mt-4 border border-line bg-background p-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          Selected response segment
        </p>
        <p className="mt-2 text-sm leading-6 text-ink">
          {selectedTarget
            ? `${selectedTarget.response === "a" ? "Response A" : "Response B"}: ${selectedTarget.segment.text}`
            : "Select a response segment first."}
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
              {value}
            </label>
          ))}
        </fieldset>
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Segment label
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
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          disabled={!selectedTarget}
          className="w-full border border-primary bg-primary px-4 py-2 text-sm text-white hover:bg-background hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add span label
        </button>
      </form>
    </section>
  );
}

function PreferencePanel({
  preference,
  scores,
  rationale,
  onPreferenceChange,
  onScoreChange,
  onRationaleChange
}: {
  preference: PreferenceChoice;
  scores: DimensionScores;
  rationale: string;
  onPreferenceChange: (choice: PreferenceChoice) => void;
  onScoreChange: (dimension: DimensionKey, value: number) => void;
  onRationaleChange: (rationale: string) => void;
}) {
  return (
    <section className="border border-line bg-paper p-4">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        Preference
      </p>
      <h2 className="mt-2 font-display text-2xl text-primary">
        Overall judgment
      </h2>
      <fieldset className="mt-4 grid gap-2">
        {PREFERENCE_OPTIONS.map(([value, label]) => (
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
            {label}
          </label>
        ))}
      </fieldset>

      <div className="mt-5 border-t border-line pt-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          Dimension scores
        </p>
        <div className="mt-3 space-y-3">
          {DIMENSIONS.map(([key, label]) => (
            <label key={key} className="block">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted">{label}</span>
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
          Free-text rationale
        </span>
        <textarea
          value={rationale}
          onChange={(event) => onRationaleChange(event.target.value)}
          className="mt-2 min-h-24 w-full border border-line bg-background p-3 text-sm leading-6 text-ink outline-none focus:border-primary"
          placeholder="Explain what drove the preference..."
        />
      </label>
    </section>
  );
}

function PreferenceSummary({
  annotations,
  safetyTags,
  payloadPreview
}: {
  annotations: ResponseAnnotation[];
  safetyTags: { response: string; label: ResponseLabel; text: string }[];
  payloadPreview: object;
}) {
  return (
    <section className="border border-line bg-paper p-4">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        Mock submission
      </p>
      <h2 className="mt-2 font-display text-2xl text-primary">
        Payload preview
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="border border-line bg-background p-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Highlighted spans
          </p>
          <p className="mt-1 text-sm text-ink">{annotations.length}</p>
        </div>
        <div className="border border-line bg-background p-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Safety/error tags
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
