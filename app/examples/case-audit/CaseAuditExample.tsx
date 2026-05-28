"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import type { ConceptNode, ExampleCaseAudit, ExampleSegment } from "@/types";

const SECTION_ORDER = [
  ["chiefComplaint", "Chief complaint"],
  ["hpi", "HPI"],
  ["pastMedicalHistory", "Past medical history"],
  ["medications", "Medications"],
  ["allergies", "Allergies"],
  ["vitals", "Vitals"],
  ["exam", "Exam"],
  ["labs", "Labs"],
  ["imaging", "Imaging/report text"],
  ["negativeFindings", "Negative findings"],
  ["missingInformation", "Missing information"]
] as const;

const AUDIT_LABELS = [
  "supporting evidence",
  "evidence against",
  "missing key information",
  "red flag",
  "safety concern",
  "uncertainty",
  "hallucination risk",
  "guideline/evidence needed",
  "useful clinical clue"
] as const;

const LIKELIHOODS = [
  ["more_likely", "More likely"],
  ["less_likely", "Less likely"],
  ["must_not_miss", "Must not miss"]
] as const;

type AuditLabel = (typeof AUDIT_LABELS)[number];
type Likelihood = (typeof LIKELIHOODS)[number][0];

type ConceptSummary = {
  id: string;
  display: string;
  displayZh?: string;
};

type Annotation = {
  id: string;
  targetId: string;
  targetText: string;
  label: AuditLabel;
  concept?: ConceptSummary;
  note: string;
};

type ReasoningEntry = {
  id: string;
  diagnosis: string;
  likelihood: Likelihood;
  supportingEvidence: string;
  evidenceAgainst: string;
  missingInformation: string;
  concept?: ConceptSummary;
};

type ConceptMatch = {
  node: ConceptNode;
  ancestors: ConceptNode[];
  children: ConceptNode[];
};

type ReasoningDraft = {
  diagnosis: string;
  likelihood: Likelihood;
  supportingEvidence: string;
  evidenceAgainst: string;
  missingInformation: string;
  concept?: ConceptSummary;
};

const INITIAL_REASONING: ReasoningDraft = {
  diagnosis: "Viral upper respiratory infection",
  likelihood: "more_likely",
  supportingEvidence: "",
  evidenceAgainst: "",
  missingInformation: ""
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function conceptSummary(node: ConceptNode): ConceptSummary {
  return {
    id: node.id,
    display: node.display,
    displayZh: node.displayZh
  };
}

function conceptLabel(concept: ConceptSummary | ConceptNode) {
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

function findSegment(segments: ExampleSegment[], id: string | null) {
  if (!id) {
    return undefined;
  }
  return segments.find((segment) => segment.id === id);
}

export function CaseAuditExample({
  example,
  concepts
}: {
  example: ExampleCaseAudit;
  concepts: ConceptNode[];
}) {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    example.segments[0]?.id ?? null
  );
  const [annotationLabel, setAnnotationLabel] =
    useState<AuditLabel>("supporting evidence");
  const [annotationNote, setAnnotationNote] = useState("");
  const [annotationConcept, setAnnotationConcept] =
    useState<ConceptSummary | undefined>();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [conceptQuery, setConceptQuery] = useState("viral cold");
  const [reasoningDraft, setReasoningDraft] =
    useState<ReasoningDraft>(INITIAL_REASONING);
  const [reasoningEntries, setReasoningEntries] = useState<ReasoningEntry[]>(
    []
  );

  const selectedSegment = findSegment(example.segments, selectedSegmentId);
  const flattenedConcepts = useMemo(() => flattenConcepts(concepts), [concepts]);
  const conceptResults = useMemo(() => {
    const q = normalize(conceptQuery);
    if (!q) {
      return flattenedConcepts.slice(0, 4);
    }
    return flattenedConcepts
      .filter(({ node }) => {
        const values = [
          node.display,
          node.displayZh ?? "",
          ...node.synonyms
        ].map(normalize);
        return values.some((value) => value.includes(q));
      })
      .slice(0, 6);
  }, [conceptQuery, flattenedConcepts]);

  const payloadPreview = {
    caseId: example.id,
    annotations,
    diagnosticReasoning: reasoningEntries
  };

  function saveAnnotation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSegment) {
      return;
    }
    setAnnotations((current) => [
      ...current,
      {
        id: `annotation-${Date.now()}`,
        targetId: selectedSegment.id,
        targetText: selectedSegment.text,
        label: annotationLabel,
        concept: annotationConcept,
        note: annotationNote.trim()
      }
    ]);
    setAnnotationNote("");
  }

  function addReasoningEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReasoningEntries((current) => [
      ...current,
      {
        id: `reasoning-${Date.now()}`,
        ...reasoningDraft
      }
    ]);
    setReasoningDraft({
      ...INITIAL_REASONING,
      diagnosis: reasoningDraft.diagnosis
    });
  }

  function annotationsForSegment(segmentId: string) {
    return annotations.filter((annotation) => annotation.targetId === segmentId);
  }

  return (
    <PageShell
      eyebrow="Mock case audit"
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
          Simulated demo data
        </span>
      </div>

      <div className="grid gap-6 py-9 xl:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <article className="border border-line bg-paper p-5">
            <div className="border-b border-line pb-4">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                Structured case context
              </p>
              <h2 className="mt-2 font-display text-3xl text-primary">
                Select a predefined segment
              </h2>
            </div>

            <div className="mt-5 grid gap-4">
              {SECTION_ORDER.map(([sectionId, sectionLabel]) => {
                const sectionSegments = example.segments.filter(
                  (segment) => segment.section === sectionId
                );
                if (!sectionSegments.length) {
                  return null;
                }
                return (
                  <section key={sectionId} className="border border-line bg-background p-4">
                    <h3 className="font-display text-2xl text-primary">
                      {sectionLabel}
                    </h3>
                    <div className="mt-3 space-y-2">
                      {sectionSegments.map((segment) => {
                        const selected = selectedSegmentId === segment.id;
                        const segmentAnnotations = annotationsForSegment(segment.id);
                        return (
                          <button
                            key={segment.id}
                            type="button"
                            onClick={() => setSelectedSegmentId(segment.id)}
                            className={`w-full border p-3 text-left leading-6 transition-colors ${
                              selected
                                ? "border-primary bg-primary text-white"
                                : segmentAnnotations.length
                                  ? "border-[#C8A442] bg-[#FFF4BF] text-ink"
                                  : "border-line bg-paper text-ink hover:border-primary"
                            }`}
                          >
                            <span className="block">{segment.text}</span>
                            <span
                              className={`mt-2 block font-mono text-[10px] uppercase tracking-[0.12em] ${
                                selected ? "text-white/75" : "text-muted"
                              }`}
                            >
                              {segmentAnnotations.length
                                ? `${segmentAnnotations.length} annotation(s)`
                                : "Click to select"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </article>

          <DiagnosticReasoningPanel
            diagnoses={example.diagnosticOptions}
            draft={reasoningDraft}
            entries={reasoningEntries}
            onDraftChange={setReasoningDraft}
            onSubmit={addReasoningEntry}
          />
        </section>

        <aside className="space-y-5">
          <AnnotationPanel
            selectedSegment={selectedSegment}
            annotationLabel={annotationLabel}
            annotationNote={annotationNote}
            annotationConcept={annotationConcept}
            onLabelChange={setAnnotationLabel}
            onNoteChange={setAnnotationNote}
            onSubmit={saveAnnotation}
          />

          <ConceptSearchPanel
            query={conceptQuery}
            results={conceptResults}
            onQueryChange={setConceptQuery}
            onAttachToSegment={(concept) => setAnnotationConcept(concept)}
            onAttachToReasoning={(concept) =>
              setReasoningDraft((current) => ({
                ...current,
                concept
              }))
            }
            hasSelectedSegment={Boolean(selectedSegment)}
          />

          <SummaryPanel
            annotations={annotations}
            reasoningEntries={reasoningEntries}
            payloadPreview={payloadPreview}
          />
        </aside>
      </div>
    </PageShell>
  );
}

function AnnotationPanel({
  selectedSegment,
  annotationLabel,
  annotationNote,
  annotationConcept,
  onLabelChange,
  onNoteChange,
  onSubmit
}: {
  selectedSegment?: ExampleSegment;
  annotationLabel: AuditLabel;
  annotationNote: string;
  annotationConcept?: ConceptSummary;
  onLabelChange: (label: AuditLabel) => void;
  onNoteChange: (note: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="border border-line bg-paper p-4">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        Annotation
      </p>
      <h2 className="mt-2 font-display text-2xl text-primary">
        Tag selected evidence
      </h2>
      <div className="mt-4 border border-line bg-background p-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          Selected segment
        </p>
        <p className="mt-2 text-sm leading-6 text-ink">
          {selectedSegment?.text ?? "Select a case segment first."}
        </p>
      </div>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Label
          </span>
          <select
            value={annotationLabel}
            onChange={(event) => onLabelChange(event.target.value as AuditLabel)}
            className="mt-2 w-full border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-primary"
          >
            {AUDIT_LABELS.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="border border-line bg-wash p-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Attached concept
          </p>
          <p className="mt-1 text-sm leading-6 text-ink">
            {annotationConcept ? conceptLabel(annotationConcept) : "None selected"}
          </p>
        </div>
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Note
          </span>
          <textarea
            value={annotationNote}
            onChange={(event) => onNoteChange(event.target.value)}
            className="mt-2 min-h-24 w-full border border-line bg-background p-3 text-sm leading-6 text-ink outline-none focus:border-primary"
            placeholder="Add why this segment matters..."
          />
        </label>
        <button
          type="submit"
          disabled={!selectedSegment}
          className="w-full border border-primary bg-primary px-4 py-2 text-sm text-white hover:bg-background hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add annotation
        </button>
      </form>
    </section>
  );
}

function ConceptSearchPanel({
  query,
  results,
  onQueryChange,
  onAttachToSegment,
  onAttachToReasoning,
  hasSelectedSegment
}: {
  query: string;
  results: ConceptMatch[];
  onQueryChange: (query: string) => void;
  onAttachToSegment: (concept: ConceptSummary) => void;
  onAttachToReasoning: (concept: ConceptSummary) => void;
  hasSelectedSegment: boolean;
}) {
  return (
    <section className="border border-line bg-paper p-4">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        Mock concept search
      </p>
      <h2 className="mt-2 font-display text-2xl text-primary">
        Hierarchical tag lookup
      </h2>
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        className="mt-4 w-full border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-primary"
        placeholder="Try viral cold or 病毒性感冒"
      />
      <div className="mt-4 space-y-3">
        {results.map(({ node, ancestors, children }) => (
          <article key={node.id} className="border border-line bg-background p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Parents
            </div>
            <p className="mt-1 text-sm leading-6 text-muted">
              {ancestors.length
                ? ancestors.map(conceptLabel).join(" -> ")
                : "Top level concept"}
            </p>
            <div className="mt-3 border-l-2 border-primary pl-3">
              <p className="font-display text-xl text-primary">
                {conceptLabel(node)}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Synonyms: {node.synonyms.join(", ")}
              </p>
            </div>
            <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Children
            </div>
            <p className="mt-1 text-sm leading-6 text-muted">
              {children.length
                ? children.map(conceptLabel).join(" | ")
                : "No child concepts in mock hierarchy"}
            </p>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                disabled={!hasSelectedSegment}
                onClick={() => onAttachToSegment(conceptSummary(node))}
                className="border border-primary bg-background px-3 py-2 text-xs text-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Attach to selected segment
              </button>
              <button
                type="button"
                onClick={() => onAttachToReasoning(conceptSummary(node))}
                className="border border-line bg-wash px-3 py-2 text-xs text-muted hover:border-primary hover:text-primary"
              >
                Attach to reasoning draft
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DiagnosticReasoningPanel({
  diagnoses,
  draft,
  entries,
  onDraftChange,
  onSubmit
}: {
  diagnoses: string[];
  draft: ReasoningDraft;
  entries: ReasoningEntry[];
  onDraftChange: (draft: ReasoningDraft) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="border border-line bg-paper p-5">
      <div className="border-b border-line pb-4">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
          Diagnostic reasoning
        </p>
        <h2 className="mt-2 font-display text-3xl text-primary">
          Differential and missing evidence
        </h2>
      </div>
      <form onSubmit={onSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Diagnosis
          </span>
          <select
            value={draft.diagnosis}
            onChange={(event) =>
              onDraftChange({ ...draft, diagnosis: event.target.value })
            }
            className="mt-2 w-full border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-primary"
          >
            {diagnoses.map((diagnosis) => (
              <option key={diagnosis} value={diagnosis}>
                {diagnosis}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Likelihood
          </span>
          <select
            value={draft.likelihood}
            onChange={(event) =>
              onDraftChange({
                ...draft,
                likelihood: event.target.value as Likelihood
              })
            }
            className="mt-2 w-full border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-primary"
          >
            {LIKELIHOODS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {[
          ["supportingEvidence", "Supporting evidence"],
          ["evidenceAgainst", "Evidence against"],
          ["missingInformation", "Missing information"]
        ].map(([field, label]) => (
          <label key={field} className="block md:col-span-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              {label}
            </span>
            <textarea
              value={draft[field as keyof ReasoningDraft] as string}
              onChange={(event) =>
                onDraftChange({
                  ...draft,
                  [field]: event.target.value
                })
              }
              className="mt-2 min-h-20 w-full border border-line bg-background p-3 text-sm leading-6 text-ink outline-none focus:border-primary"
            />
          </label>
        ))}
        <div className="border border-line bg-wash p-3 md:col-span-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Concept attached to draft
          </p>
          <p className="mt-1 text-sm leading-6 text-ink">
            {draft.concept ? conceptLabel(draft.concept) : "None selected"}
          </p>
        </div>
        <button
          type="submit"
          className="border border-accent bg-accent px-4 py-3 text-sm text-white hover:bg-background hover:text-accent md:col-span-2"
        >
          Add reasoning entry
        </button>
      </form>

      <div className="mt-5 grid gap-3">
        {entries.length ? (
          entries.map((entry) => (
            <article key={entry.id} className="border border-line bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-display text-2xl text-primary">
                  {entry.diagnosis}
                </h3>
                <span className="border border-line bg-paper px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                  {LIKELIHOODS.find(([value]) => value === entry.likelihood)?.[1]}
                </span>
              </div>
              {entry.concept ? (
                <p className="mt-2 font-mono text-xs text-accent">
                  {conceptLabel(entry.concept)}
                </p>
              ) : null}
              <dl className="mt-3 grid gap-3 text-sm leading-6 text-muted">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em]">
                    Supports
                  </dt>
                  <dd>{entry.supportingEvidence || "Not entered"}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em]">
                    Against
                  </dt>
                  <dd>{entry.evidenceAgainst || "Not entered"}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em]">
                    Missing
                  </dt>
                  <dd>{entry.missingInformation || "Not entered"}</dd>
                </div>
              </dl>
            </article>
          ))
        ) : (
          <p className="border border-line bg-background p-4 text-sm leading-6 text-muted">
            No diagnostic reasoning entries yet.
          </p>
        )}
      </div>
    </section>
  );
}

function SummaryPanel({
  annotations,
  reasoningEntries,
  payloadPreview
}: {
  annotations: Annotation[];
  reasoningEntries: ReasoningEntry[];
  payloadPreview: object;
}) {
  return (
    <section className="border border-line bg-paper p-4">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        Mock payload preview
      </p>
      <h2 className="mt-2 font-display text-2xl text-primary">
        Annotation summary
      </h2>
      <div className="mt-4 space-y-3">
        <div className="border border-line bg-background p-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Segment annotations
          </p>
          <p className="mt-1 text-sm text-ink">{annotations.length}</p>
        </div>
        <div className="border border-line bg-background p-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Diagnostic reasoning entries
          </p>
          <p className="mt-1 text-sm text-ink">{reasoningEntries.length}</p>
        </div>
      </div>
      <pre className="mt-4 max-h-[360px] overflow-auto border border-line bg-ink p-3 font-mono text-[11px] leading-5 text-white">
        {JSON.stringify(payloadPreview, null, 2)}
      </pre>
    </section>
  );
}
