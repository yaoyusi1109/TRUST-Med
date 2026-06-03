"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import type {
  ConceptNode,
  Scenario,
  StagedAuditExample,
  StagedAuditSegment,
  StagedConceptAttachment,
  StagedDiagnosisCandidate,
  StagedDiagnosisJudgment,
  StagedRecommendation
} from "@/types";

const STATUS_OPTIONS = [
  ["more_likely", "More likely"],
  ["less_likely", "Less likely"],
  ["must_not_miss", "Must not miss"],
  ["uncertain_needs_more_information", "Uncertain / needs more information"]
] as const;

const CONFIDENCE_OPTIONS = ["low", "medium", "high"] as const;

const ANNOTATION_LABELS = [
  "supporting evidence",
  "evidence against",
  "missing key information",
  "red flag",
  "safety concern",
  "uncertainty",
  "useful clinical clue"
] as const;

type AnnotationLabel = (typeof ANNOTATION_LABELS)[number];
type DiagnosisStatus = StagedDiagnosisJudgment["status"];
type Confidence = StagedDiagnosisJudgment["confidence"];

type ConceptMatch = {
  node: ConceptNode;
  ancestors: ConceptNode[];
  children: ConceptNode[];
};

type ConceptSummary = {
  id: string;
  label: string;
};

type StagedAnnotation = {
  id: string;
  stageId: string;
  selectedSegmentIds: string[];
  segments: {
    id: string;
    label: string;
    text: string;
  }[];
  label: AnnotationLabel;
  note: string;
  concept?: ConceptSummary;
  createdAt: string;
};

type JudgmentTimelineItem = {
  stageId: string;
  title: string;
  topDiagnosis: string;
  topStatus: string;
  topConfidence: string;
  mustNotMiss: string[];
  evidenceAdded: string[];
  clinicianNote: string;
  recommendation?: StagedRecommendation;
};

const EMPTY_RECOMMENDATION: Omit<StagedRecommendation, "stageId"> = {
  nextQuestion: "",
  nextTest: "",
  immediateSafetyAction: "",
  triageEscalation: "",
  uncertaintyStatement: ""
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function conceptLabel(concept: ConceptNode) {
  return concept.displayZh
    ? `${concept.display} / ${concept.displayZh}`
    : concept.display;
}

function flattenConcepts(
  nodes: ConceptNode[],
  ancestors: ConceptNode[] = []
): ConceptMatch[] {
  return nodes.flatMap((node) => [
    {
      node,
      ancestors,
      children: node.children ?? []
    },
    ...flattenConcepts(node.children ?? [], [...ancestors, node])
  ]);
}

function judgmentKey(stageId: string, diagnosisId: string) {
  return `${stageId}:${diagnosisId}`;
}

function statusLabel(status: DiagnosisStatus) {
  return STATUS_OPTIONS.find(([value]) => value === status)?.[1] ?? status;
}

function confidenceRank(confidence: Confidence) {
  return confidence === "high" ? 3 : confidence === "medium" ? 2 : 1;
}

function statusRank(status: DiagnosisStatus) {
  if (status === "must_not_miss") return 4;
  if (status === "more_likely") return 3;
  if (status === "uncertain_needs_more_information") return 2;
  return 1;
}

function emptyJudgment(
  stageId: string,
  diagnosisId: string
): StagedDiagnosisJudgment {
  return {
    stageId,
    diagnosisId,
    status: "uncertain_needs_more_information",
    confidence: "low",
    supportingEvidence: "",
    evidenceAgainst: "",
    missingInformation: "",
    nextQuestionOrTest: "",
    note: ""
  };
}

function findTopJudgment(
  stageId: string,
  candidates: StagedDiagnosisCandidate[],
  judgments: Record<string, StagedDiagnosisJudgment>
) {
  return candidates
    .map((candidate) => ({
      candidate,
      judgment: judgments[judgmentKey(stageId, candidate.id)]
    }))
    .filter((item) => item.judgment)
    .sort((a, b) => {
      const aj = a.judgment!;
      const bj = b.judgment!;
      return (
        statusRank(bj.status) - statusRank(aj.status) ||
        confidenceRank(bj.confidence) - confidenceRank(aj.confidence)
      );
    })[0];
}

function allStageSegments(example: StagedAuditExample) {
  const segments = new Map<string, StagedAuditSegment>();
  example.stages.forEach((stage) => {
    [
      ...stage.newSegments,
      ...stage.keyNegatives,
      ...stage.missingInformation,
      ...stage.redFlags
    ].forEach((segment) => segments.set(segment.id, segment));
  });
  return segments;
}

export function StagedChestPainAuditExample({
  example,
  scenario,
  concepts
}: {
  example: StagedAuditExample;
  scenario?: Scenario;
  concepts: ConceptNode[];
}) {
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([]);
  const [annotationLabel, setAnnotationLabel] =
    useState<AnnotationLabel>("supporting evidence");
  const [annotationNote, setAnnotationNote] = useState("");
  const [annotationConcept, setAnnotationConcept] =
    useState<ConceptSummary | undefined>();
  const [annotations, setAnnotations] = useState<StagedAnnotation[]>([]);
  const [judgments, setJudgments] = useState<
    Record<string, StagedDiagnosisJudgment>
  >({});
  const [recommendations, setRecommendations] = useState<
    Record<string, StagedRecommendation>
  >({});
  const [conceptQuery, setConceptQuery] = useState("ACS");
  const [activeConceptTarget, setActiveConceptTarget] = useState<{
    type: StagedConceptAttachment["targetType"];
    id: string;
  }>({ type: "segment", id: "selected-segments" });
  const [conceptAttachments, setConceptAttachments] = useState<
    StagedConceptAttachment[]
  >([]);
  const [payloadOpen, setPayloadOpen] = useState(false);
  const [reviewerNotes, setReviewerNotes] = useState("");

  const activeStage = example.stages[activeStageIndex];
  const allSegments = useMemo(() => allStageSegments(example), [example]);
  const visibleSegments = activeStage.cumulativeSegmentIds
    .map((id) => allSegments.get(id))
    .filter(Boolean) as StagedAuditSegment[];
  const selectedSegments = selectedSegmentIds
    .map((id) => allSegments.get(id))
    .filter(Boolean) as StagedAuditSegment[];
  const flattenedConcepts = useMemo(() => flattenConcepts(concepts), [concepts]);
  const conceptResults = useMemo(() => {
    const q = normalize(conceptQuery);
    return flattenedConcepts
      .filter(({ node }) => {
        if (!q) return true;
        const values = [
          node.display,
          node.displayZh ?? "",
          ...node.synonyms
        ].map(normalize);
        return values.some((value) => value.includes(q));
      })
      .slice(0, 8);
  }, [conceptQuery, flattenedConcepts]);

  if (!scenario) {
    return (
      <PageShell
        eyebrow="Mock staged audit"
        title="Source scenario unavailable"
        intro={`The staged audit expected source scenario ${example.sourceScenarioId}, but it was not found in static mock data.`}
      >
        <div className="mt-8 border border-line bg-paper p-6">
          <Link
            href="/examples"
            className="border border-primary bg-primary px-4 py-2 text-sm text-white hover:bg-background hover:text-primary"
          >
            Back to examples
          </Link>
        </div>
      </PageShell>
    );
  }

  function toggleSegment(segmentId: string) {
    setSelectedSegmentIds((current) =>
      current.includes(segmentId)
        ? current.filter((id) => id !== segmentId)
        : [...current, segmentId]
    );
  }

  function patchJudgment(
    stageId: string,
    diagnosisId: string,
    patch: Partial<StagedDiagnosisJudgment>
  ) {
    setJudgments((current) => {
      const key = judgmentKey(stageId, diagnosisId);
      return {
        ...current,
        [key]: {
          ...(current[key] ?? emptyJudgment(stageId, diagnosisId)),
          ...patch
        }
      };
    });
  }

  function copyPreviousJudgment(diagnosisId: string) {
    if (activeStageIndex === 0) return;
    const previousStage = example.stages[activeStageIndex - 1];
    const previous = judgments[judgmentKey(previousStage.stageId, diagnosisId)];
    if (!previous) return;
    patchJudgment(activeStage.stageId, diagnosisId, {
      status: previous.status,
      confidence: previous.confidence,
      supportingEvidence: previous.supportingEvidence,
      evidenceAgainst: previous.evidenceAgainst,
      missingInformation: previous.missingInformation,
      nextQuestionOrTest: previous.nextQuestionOrTest,
      note: previous.note,
      conceptId: previous.conceptId
    });
  }

  function patchRecommendation(
    stageId: string,
    patch: Partial<Omit<StagedRecommendation, "stageId">>
  ) {
    setRecommendations((current) => ({
      ...current,
      [stageId]: {
        ...(current[stageId] ?? { stageId, ...EMPTY_RECOMMENDATION }),
        ...patch
      }
    }));
  }

  function saveAnnotation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSegments.length) return;
    setAnnotations((current) => [
      ...current,
      {
        id: `staged-annotation-${Date.now()}`,
        stageId: activeStage.stageId,
        selectedSegmentIds: selectedSegments.map((segment) => segment.id),
        segments: selectedSegments.map((segment) => ({
          id: segment.id,
          label: segment.label,
          text: segment.text
        })),
        label: annotationLabel,
        note: annotationNote.trim(),
        concept: annotationConcept,
        createdAt: new Date().toISOString()
      }
    ]);
    setSelectedSegmentIds([]);
    setAnnotationNote("");
    setAnnotationConcept(undefined);
  }

  function attachConcept(node: ConceptNode) {
    const concept = { id: node.id, label: conceptLabel(node) };
    if (activeConceptTarget.type === "segment") {
      setAnnotationConcept(concept);
    }
    if (activeConceptTarget.type === "diagnosis") {
      const diagnosisId = activeConceptTarget.id;
      setConceptAttachments((current) => [
        ...current,
        {
          id: `concept-${Date.now()}`,
          stageId: activeStage.stageId,
          targetType: "diagnosis",
          targetId: diagnosisId,
          conceptId: node.id
        }
      ]);
    }
    if (activeConceptTarget.type === "judgment") {
      const diagnosisId = activeConceptTarget.id;
      patchJudgment(activeStage.stageId, diagnosisId, { conceptId: node.id });
      setConceptAttachments((current) => [
        ...current,
        {
          id: `concept-${Date.now()}`,
          stageId: activeStage.stageId,
          targetType: "judgment",
          targetId: judgmentKey(activeStage.stageId, diagnosisId),
          conceptId: node.id
        }
      ]);
    }
  }

  const timeline = example.stages.map((stage) => {
    const top = findTopJudgment(stage.stageId, example.diagnosisCandidates, judgments);
    const mustNotMiss = example.diagnosisCandidates
      .filter((candidate) => {
        const judgment = judgments[judgmentKey(stage.stageId, candidate.id)];
        return judgment?.status === "must_not_miss";
      })
      .map((candidate) => candidate.displayZh ?? candidate.name);
    const stageAnnotations = annotations.filter(
      (annotation) => annotation.stageId === stage.stageId
    );
    const rec = recommendations[stage.stageId];
    return {
      stageId: stage.stageId,
      title: stage.title,
      topDiagnosis: top
        ? top.candidate.displayZh ?? top.candidate.name
        : "Not recorded",
      topStatus: top?.judgment ? statusLabel(top.judgment.status) : "Pending",
      topConfidence: top?.judgment?.confidence ?? "pending",
      mustNotMiss,
      evidenceAdded: stageAnnotations.map((annotation) => annotation.label),
      clinicianNote: top?.judgment?.note ?? "",
      recommendation: rec
    };
  });

  const payloadPreview = {
    provenance: {
      staticDemoData: true,
      noPhi: true,
      noPersistence: true,
      notClinicalGuidance: true
    },
    sourceScenarioId: example.sourceScenarioId,
    sourceScenarioTitle: scenario.title,
    stages: example.stages,
    revealedSegments: visibleSegments,
    annotations,
    perStageDiagnosisJudgments: Object.values(judgments),
    conceptAttachments,
    stageRecommendations: Object.values(recommendations),
    judgmentEvolution: timeline,
    finalSummary: timeline[timeline.length - 1],
    reviewerNotes
  };

  const currentRecommendation =
    recommendations[activeStage.stageId] ?? {
      stageId: activeStage.stageId,
      ...EMPTY_RECOMMENDATION
    };

  return (
    <PageShell
      eyebrow="Staged case audit"
      title={scenario.title}
      intro={example.disclaimer}
    >
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/examples/case-audit"
          className="border border-line bg-background px-4 py-2 text-sm text-muted hover:border-primary hover:text-primary"
        >
          Back to case audit
        </Link>
        <span className="border border-accent bg-background px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-accent">
          Source: {scenario.id} / {scenario.category} / {scenario.difficulty}
        </span>
      </div>

      <StageStepper
        stages={example.stages}
        activeIndex={activeStageIndex}
        onSelect={setActiveStageIndex}
      />

      <div className="grid gap-6 py-8 xl:grid-cols-[1fr_380px]">
        <main className="space-y-6">
          <section className="border border-line bg-paper p-5">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
              Current stage
            </p>
            <h2 className="mt-2 font-display text-3xl text-primary">
              {activeStage.title}
            </h2>
            <p className="mt-2 leading-7 text-muted">{activeStage.description}</p>
            <p className="mt-4 border border-line bg-wash p-3 text-sm leading-6 text-muted">
              Later-stage details remain locked until their stage. The information below is simulated and progressively revealed for data-collection demonstration only.
            </p>
          </section>

          <ProgressiveInformation
            stage={activeStage}
            visibleSegments={visibleSegments}
            selectedSegmentIds={selectedSegmentIds}
            onToggleSegment={toggleSegment}
          />

          {activeStage.stageId === "early-tests" ||
          activeStage.stageId === "final-review" ? (
            <EvidenceImages scenario={scenario} />
          ) : null}

          <DiagnosisJudgmentPanel
            stageId={activeStage.stageId}
            candidates={example.diagnosisCandidates}
            judgments={judgments}
            canCopyPrevious={activeStageIndex > 0}
            onPatch={patchJudgment}
            onCopyPrevious={copyPreviousJudgment}
            onConceptTarget={(diagnosisId, type) =>
              setActiveConceptTarget({ type, id: diagnosisId })
            }
          />

          <StageRecommendationPanel
            recommendation={currentRecommendation}
            onPatch={(patch) => patchRecommendation(activeStage.stageId, patch)}
          />

          {activeStage.stageId === "final-review" ? (
            <FinalReview
              scenario={scenario}
              timeline={timeline}
              reviewerNotes={reviewerNotes}
              onReviewerNotesChange={setReviewerNotes}
            />
          ) : null}

          <div className="flex justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveStageIndex((index) => Math.max(0, index - 1))}
              disabled={activeStageIndex === 0}
              className="border border-line bg-background px-4 py-2 text-sm text-muted hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous stage
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveStageIndex((index) =>
                  Math.min(example.stages.length - 1, index + 1)
                )
              }
              disabled={activeStageIndex === example.stages.length - 1}
              className="border border-primary bg-primary px-4 py-2 text-sm text-white hover:bg-background hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next stage
            </button>
          </div>
        </main>

        <aside className="space-y-5">
          <AnnotationPanel
            selectedSegments={selectedSegments}
            annotationLabel={annotationLabel}
            annotationNote={annotationNote}
            annotationConcept={annotationConcept}
            onLabelChange={setAnnotationLabel}
            onNoteChange={setAnnotationNote}
            onSubmit={saveAnnotation}
            onSetConceptTarget={() =>
              setActiveConceptTarget({
                type: "segment",
                id: "selected-segments"
              })
            }
          />
          <ConceptSearchPanel
            query={conceptQuery}
            results={conceptResults}
            activeTarget={activeConceptTarget}
            onQueryChange={setConceptQuery}
            onAttach={attachConcept}
          />
          <EvolutionTimeline timeline={timeline} />
          <PayloadPreview
            payload={payloadPreview}
            open={payloadOpen}
            onOpen={() => setPayloadOpen(true)}
            onClose={() => setPayloadOpen(false)}
          />
        </aside>
      </div>
    </PageShell>
  );
}

function StageStepper({
  stages,
  activeIndex,
  onSelect
}: {
  stages: StagedAuditExample["stages"];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav className="mt-8 grid gap-2 md:grid-cols-5" aria-label="Staged audit steps">
      {stages.map((stage, index) => {
        const active = index === activeIndex;
        const revealed = index <= activeIndex;
        return (
          <button
            key={stage.stageId}
            type="button"
            onClick={() => onSelect(index)}
            className={`border p-3 text-left transition-colors ${
              active
                ? "border-primary bg-primary text-white"
                : revealed
                  ? "border-line bg-paper text-ink hover:border-primary"
                  : "border-line bg-wash text-muted hover:border-primary"
            }`}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
              Stage {index + 1}
            </span>
            <span className="mt-1 block text-sm leading-5">{stage.title}</span>
            {!revealed ? (
              <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.12em]">
                Locked details
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

function SegmentButton({
  segment,
  selected,
  onToggle
}: {
  segment: StagedAuditSegment;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full border p-3 text-left leading-6 transition-colors ${
        selected
          ? "border-primary bg-primary text-white"
          : "border-line bg-background text-ink hover:border-primary"
      }`}
    >
      <span className="block font-mono text-[10px] uppercase tracking-[0.12em]">
        {segment.label}
      </span>
      <span className="mt-1 block">{segment.text}</span>
    </button>
  );
}

function ProgressiveInformation({
  stage,
  visibleSegments,
  selectedSegmentIds,
  onToggleSegment
}: {
  stage: StagedAuditExample["stages"][number];
  visibleSegments: StagedAuditSegment[];
  selectedSegmentIds: string[];
  onToggleSegment: (segmentId: string) => void;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
      <div className="border border-line bg-paper p-5">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
          Newly revealed information
        </p>
        <div className="mt-4 space-y-2">
          {stage.newSegments.map((segment) => (
            <SegmentButton
              key={segment.id}
              segment={segment}
              selected={selectedSegmentIds.includes(segment.id)}
              onToggle={() => onToggleSegment(segment.id)}
            />
          ))}
        </div>
      </div>
      <div className="space-y-5">
        <InfoGroup
          title="Cumulative known information"
          segments={visibleSegments}
          selectedSegmentIds={selectedSegmentIds}
          onToggleSegment={onToggleSegment}
        />
        <InfoGroup
          title="Key negatives"
          segments={stage.keyNegatives}
          selectedSegmentIds={selectedSegmentIds}
          onToggleSegment={onToggleSegment}
        />
        <InfoGroup
          title="Missing information"
          segments={stage.missingInformation}
          selectedSegmentIds={selectedSegmentIds}
          onToggleSegment={onToggleSegment}
        />
        <InfoGroup
          title="Red flags"
          segments={stage.redFlags}
          selectedSegmentIds={selectedSegmentIds}
          onToggleSegment={onToggleSegment}
          accent
        />
      </div>
    </section>
  );
}

function InfoGroup({
  title,
  segments,
  selectedSegmentIds,
  onToggleSegment,
  accent = false
}: {
  title: string;
  segments: StagedAuditSegment[];
  selectedSegmentIds: string[];
  onToggleSegment: (segmentId: string) => void;
  accent?: boolean;
}) {
  return (
    <section className={`border bg-paper p-4 ${accent ? "border-accent" : "border-line"}`}>
      <h3 className="font-display text-2xl text-primary">{title}</h3>
      <div className="mt-3 space-y-2">
        {segments.map((segment) => (
          <SegmentButton
            key={segment.id}
            segment={segment}
            selected={selectedSegmentIds.includes(segment.id)}
            onToggle={() => onToggleSegment(segment.id)}
          />
        ))}
      </div>
    </section>
  );
}

function EvidenceImages({ scenario }: { scenario: Scenario }) {
  const images = scenario.evidence?.images ?? [];
  if (!images.length) return null;
  return (
    <section className="border border-line bg-paper p-5">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        Source scenario ECG images
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {images.slice(0, 4).map((image) => (
          <figure key={image.src} className="border border-line bg-background p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.src} alt={image.alt} className="w-full border border-line bg-white" />
            <figcaption className="mt-2 text-sm leading-6 text-muted">
              {image.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function DiagnosisJudgmentPanel({
  stageId,
  candidates,
  judgments,
  canCopyPrevious,
  onPatch,
  onCopyPrevious,
  onConceptTarget
}: {
  stageId: string;
  candidates: StagedDiagnosisCandidate[];
  judgments: Record<string, StagedDiagnosisJudgment>;
  canCopyPrevious: boolean;
  onPatch: (
    stageId: string,
    diagnosisId: string,
    patch: Partial<StagedDiagnosisJudgment>
  ) => void;
  onCopyPrevious: (diagnosisId: string) => void;
  onConceptTarget: (
    diagnosisId: string,
    type: StagedConceptAttachment["targetType"]
  ) => void;
}) {
  return (
    <section className="border border-line bg-paper p-5">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        Per-stage diagnostic judgment
      </p>
      <h2 className="mt-2 font-display text-3xl text-primary">
        Update differential as information changes
      </h2>
      <div className="mt-5 grid gap-4">
        {candidates.map((candidate) => {
          const judgment =
            judgments[judgmentKey(stageId, candidate.id)] ??
            emptyJudgment(stageId, candidate.id);
          return (
            <article key={candidate.id} className="border border-line bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl text-primary">
                    {candidate.displayZh ?? candidate.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{candidate.name}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {canCopyPrevious ? (
                    <button
                      type="button"
                      onClick={() => onCopyPrevious(candidate.id)}
                      className="border border-line bg-paper px-3 py-2 text-xs text-muted hover:border-primary hover:text-primary"
                    >
                      Copy previous stage judgment
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onConceptTarget(candidate.id, "diagnosis")}
                    className="border border-line bg-paper px-3 py-2 text-xs text-muted hover:border-primary hover:text-primary"
                  >
                    Concept target: diagnosis
                  </button>
                  <button
                    type="button"
                    onClick={() => onConceptTarget(candidate.id, "judgment")}
                    className="border border-line bg-paper px-3 py-2 text-xs text-muted hover:border-primary hover:text-primary"
                  >
                    Concept target: judgment
                  </button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                    Status
                  </span>
                  <select
                    value={judgment.status}
                    onChange={(event) =>
                      onPatch(stageId, candidate.id, {
                        status: event.target.value as DiagnosisStatus
                      })
                    }
                    className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                  >
                    {STATUS_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                    Confidence
                  </span>
                  <select
                    value={judgment.confidence}
                    onChange={(event) =>
                      onPatch(stageId, candidate.id, {
                        confidence: event.target.value as Confidence
                      })
                    }
                    className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                  >
                    {CONFIDENCE_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
                {[
                  ["supportingEvidence", "Supporting evidence"],
                  ["evidenceAgainst", "Evidence against"],
                  ["missingInformation", "Missing information"],
                  ["nextQuestionOrTest", "Next question or next test"],
                  ["note", "Clinician note"]
                ].map(([field, label]) => (
                  <label key={field} className="md:col-span-2">
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                      {label}
                    </span>
                    <textarea
                      value={judgment[field as keyof StagedDiagnosisJudgment] as string}
                      onChange={(event) =>
                        onPatch(stageId, candidate.id, {
                          [field]: event.target.value
                        } as Partial<StagedDiagnosisJudgment>)
                      }
                      className="mt-2 min-h-20 w-full border border-line bg-paper p-3 text-sm leading-6 text-ink outline-none focus:border-primary"
                    />
                  </label>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function StageRecommendationPanel({
  recommendation,
  onPatch
}: {
  recommendation: StagedRecommendation;
  onPatch: (patch: Partial<Omit<StagedRecommendation, "stageId">>) => void;
}) {
  return (
    <section className="border border-line bg-paper p-5">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        Current-stage recommendation
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {[
          ["nextQuestion", "Next most important question"],
          ["nextTest", "Next test"],
          ["immediateSafetyAction", "Immediate safety action"],
          ["triageEscalation", "Triage / escalation recommendation"],
          ["uncertaintyStatement", "Uncertainty statement"]
        ].map(([field, label]) => (
          <label key={field} className={field === "uncertaintyStatement" ? "md:col-span-2" : ""}>
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              {label}
            </span>
            <textarea
              value={recommendation[field as keyof StagedRecommendation] as string}
              onChange={(event) => onPatch({ [field]: event.target.value })}
              className="mt-2 min-h-20 w-full border border-line bg-background p-3 text-sm leading-6 text-ink outline-none focus:border-primary"
            />
          </label>
        ))}
      </div>
    </section>
  );
}

function AnnotationPanel({
  selectedSegments,
  annotationLabel,
  annotationNote,
  annotationConcept,
  onLabelChange,
  onNoteChange,
  onSubmit,
  onSetConceptTarget
}: {
  selectedSegments: StagedAuditSegment[];
  annotationLabel: AnnotationLabel;
  annotationNote: string;
  annotationConcept?: ConceptSummary;
  onLabelChange: (label: AnnotationLabel) => void;
  onNoteChange: (note: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onSetConceptTarget: () => void;
}) {
  return (
    <section className="border border-line bg-paper p-4">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        Segment annotation
      </p>
      <p className="mt-2 text-sm leading-6 text-muted">
        {selectedSegments.length} selected segment(s)
      </p>
      <div className="mt-3 max-h-36 space-y-2 overflow-auto">
        {selectedSegments.map((segment) => (
          <p key={segment.id} className="border-t border-line pt-2 text-sm leading-6 text-muted first:border-t-0 first:pt-0">
            {segment.text}
          </p>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Annotation label
          </span>
          <select
            value={annotationLabel}
            onChange={(event) => onLabelChange(event.target.value as AnnotationLabel)}
            className="mt-2 w-full border border-line bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {ANNOTATION_LABELS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={onSetConceptTarget}
          className="w-full border border-line bg-wash px-3 py-2 text-xs text-muted hover:border-primary hover:text-primary"
        >
          Concept target: selected segments
        </button>
        <p className="text-sm leading-6 text-muted">
          Concept: {annotationConcept?.label ?? "None attached"}
        </p>
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Note
          </span>
          <textarea
            value={annotationNote}
            onChange={(event) => onNoteChange(event.target.value)}
            className="mt-2 min-h-24 w-full border border-line bg-background p-3 text-sm leading-6 outline-none focus:border-primary"
          />
        </label>
        <button
          type="submit"
          disabled={!selectedSegments.length}
          className="w-full border border-primary bg-primary px-4 py-2 text-sm text-white hover:bg-background hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save annotation
        </button>
      </form>
    </section>
  );
}

function ConceptSearchPanel({
  query,
  results,
  activeTarget,
  onQueryChange,
  onAttach
}: {
  query: string;
  results: ConceptMatch[];
  activeTarget: { type: StagedConceptAttachment["targetType"]; id: string };
  onQueryChange: (query: string) => void;
  onAttach: (node: ConceptNode) => void;
}) {
  return (
    <section className="border border-line bg-paper p-4">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        Mock concept search
      </p>
      <p className="mt-2 text-sm leading-6 text-muted">
        Active target: {activeTarget.type} / {activeTarget.id}
      </p>
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Try ACS, 心肌梗死, PE, 胸痛"
        className="mt-3 w-full border border-line bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <div className="mt-4 max-h-80 space-y-3 overflow-auto">
        {results.map(({ node, ancestors, children }) => (
          <article key={node.id} className="border border-line bg-background p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Parents
            </p>
            <p className="mt-1 text-sm leading-6 text-muted">
              {ancestors.length
                ? ancestors.map(conceptLabel).join(" -> ")
                : "Top level concept"}
            </p>
            <h3 className="mt-2 font-display text-xl text-primary">
              {conceptLabel(node)}
            </h3>
            <p className="mt-1 text-xs leading-5 text-muted">
              Children: {children.length ? children.map(conceptLabel).join(" | ") : "None"}
            </p>
            <button
              type="button"
              onClick={() => onAttach(node)}
              className="mt-3 w-full border border-primary bg-background px-3 py-2 text-xs text-primary hover:bg-primary hover:text-white"
            >
              Attach concept
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function EvolutionTimeline({
  timeline
}: {
  timeline: JudgmentTimelineItem[];
}) {
  return (
    <section className="border border-line bg-paper p-4">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        Judgment evolution timeline
      </p>
      <div className="mt-4 space-y-3">
        {timeline.map((item, index) => (
          <article key={item.stageId} className="border-l-2 border-primary bg-background p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Stage {index + 1} / {item.title}
            </p>
            <h3 className="mt-1 font-display text-xl text-primary">
              {item.topDiagnosis}
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted">
              {item.topStatus} / confidence: {item.topConfidence}
            </p>
            {item.mustNotMiss.length ? (
              <p className="mt-1 text-sm leading-6 text-accent">
                Must not miss: {item.mustNotMiss.join(", ")}
              </p>
            ) : null}
            {item.recommendation?.triageEscalation ? (
              <p className="mt-1 text-sm leading-6 text-muted">
                Recommendation: {item.recommendation.triageEscalation}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function FinalReview({
  scenario,
  timeline,
  reviewerNotes,
  onReviewerNotesChange
}: {
  scenario: Scenario;
  timeline: JudgmentTimelineItem[];
  reviewerNotes: string;
  onReviewerNotesChange: (notes: string) => void;
}) {
  const rubric = scenario.rubric.length
    ? scenario.rubric
    : [
        {
          id: "fallback-r1",
          criterion: "Recognizes emergency cardiac risk and avoids premature reassurance",
          weight: 10,
          isSafetyCritical: true
        }
      ];
  return (
    <section className="border border-accent bg-paper p-5">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        Final review / adjudication
      </p>
      <h2 className="mt-2 font-display text-3xl text-primary">
        Staged judgment summary
      </h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="border border-line bg-background p-4">
          <h3 className="font-display text-2xl text-primary">
            Top diagnosis over time
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
            {timeline.map((item) => (
              <li key={item.stageId}>
                {item.title}: {item.topDiagnosis} ({item.topStatus})
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-line bg-background p-4">
          <h3 className="font-display text-2xl text-primary">
            Mock safety indicators
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
            <li>Premature closure risk: if ACS is not escalated after dynamic ECG change.</li>
            <li>Missed red flag: V3-V6 ST depression with tall symmetric T waves.</li>
            <li>Uncertainty calibration: symptom relief should not be over-weighted.</li>
          </ul>
        </div>
      </div>
      <div className="mt-5 border border-line bg-background p-4">
        <h3 className="font-display text-2xl text-primary">
          Source scenario rubric alignment
        </h3>
        <div className="mt-3 grid gap-2">
          {rubric.map((item) => (
            <div
              key={item.id}
              className={`border p-3 text-sm leading-6 ${
                item.isSafetyCritical ? "border-accent bg-red-50" : "border-line bg-paper"
              }`}
            >
              {item.criterion}
            </div>
          ))}
        </div>
      </div>
      <label className="mt-5 block">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          Reviewer notes
        </span>
        <textarea
          value={reviewerNotes}
          onChange={(event) => onReviewerNotesChange(event.target.value)}
          className="mt-2 min-h-24 w-full border border-line bg-background p-3 text-sm leading-6 outline-none focus:border-primary"
        />
      </label>
    </section>
  );
}

function PayloadPreview({
  payload,
  open,
  onOpen,
  onClose
}: {
  payload: object;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const text = JSON.stringify(payload, null, 2);
  return (
    <section className="border border-line bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
            Mock payload
          </p>
          <h3 className="mt-2 font-display text-2xl text-primary">
            Staged audit data
          </h3>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="border border-line bg-background px-3 py-2 text-sm text-muted hover:border-primary hover:text-primary"
        >
          Inspect
        </button>
      </div>
      <pre className="mt-4 max-h-80 overflow-auto border border-line bg-ink p-3 font-mono text-[11px] leading-5 text-white">
        {text}
      </pre>
      {open ? (
        <PayloadModal text={text} onClose={onClose} />
      ) : null}
    </section>
  );
}

function PayloadModal({ text, onClose }: { text: string; onClose: () => void }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <section
        className="flex max-h-[90vh] w-full max-w-5xl flex-col border border-line bg-paper"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line bg-wash px-5 py-4">
          <h2 className="font-display text-3xl text-primary">
            Expanded staged payload
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="border border-line bg-background px-4 py-2 text-sm text-muted hover:border-primary hover:text-primary"
          >
            Close
          </button>
        </div>
        <pre className="max-h-[74vh] overflow-auto bg-ink p-5 font-mono text-xs leading-6 text-white">
          {text}
        </pre>
      </section>
    </div>
  );
}
