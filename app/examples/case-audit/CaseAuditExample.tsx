"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import type {
  ConceptNode,
  ExampleCaseAudit,
  ExampleDiagnosisCandidate,
  ExampleSegment
} from "@/types";

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

const DIAGNOSIS_STATUSES = [
  ["more_likely", "More likely"],
  ["less_likely", "Less likely"],
  ["must_not_miss", "Must not miss"]
] as const;

type AuditLabel = (typeof AUDIT_LABELS)[number];
type DiagnosisStatus = (typeof DIAGNOSIS_STATUSES)[number][0];

type ConceptSummary = {
  id: string;
  display: string;
  displayZh?: string;
};

type GroupedAnnotation = {
  id: string;
  sequence: number;
  selectedSegmentIds: string[];
  segments: {
    id: string;
    label: string;
    text: string;
  }[];
  label: AuditLabel;
  concept?: ConceptSummary;
  note: string;
  createdAt: string;
};

type ConceptMatch = {
  node: ConceptNode;
  ancestors: ConceptNode[];
  children: ConceptNode[];
};

type RankedDiagnosis = ExampleDiagnosisCandidate & {
  score: number;
  supportingCount: number;
  againstCount: number;
  missingUncertaintyCount: number;
  conceptMatchCount: number;
};

type UserDiagnosisDraft = {
  name: string;
  status: DiagnosisStatus;
  note: string;
};

type TrayMode = "collapsed" | "peek" | "intro" | "expanded";

const INITIAL_USER_DIAGNOSIS: UserDiagnosisDraft = {
  name: "",
  status: "more_likely",
  note: ""
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

function statusLabel(status: DiagnosisStatus) {
  return (
    DIAGNOSIS_STATUSES.find(([value]) => value === status)?.[1] ?? status
  );
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

function defaultCandidates(example: ExampleCaseAudit): ExampleDiagnosisCandidate[] {
  if (example.diagnosticCandidates?.length) {
    return example.diagnosticCandidates;
  }

  return example.diagnosticOptions.map((name, index) => ({
    id: `dx-${index}`,
    name,
    status: "more_likely"
  }));
}

function labelWeight(label: AuditLabel) {
  switch (label) {
    case "supporting evidence":
      return 2;
    case "useful clinical clue":
      return 1.5;
    case "red flag":
      return 2;
    case "safety concern":
      return 1;
    case "evidence against":
      return -2;
    case "missing key information":
    case "uncertainty":
      return 0;
    case "hallucination risk":
    case "guideline/evidence needed":
      return 0.5;
    default:
      return 0;
  }
}

function isAnnotationRelevant(
  candidate: ExampleDiagnosisCandidate,
  annotation: GroupedAnnotation
) {
  const relatedSegmentIds = candidate.relatedSegmentIds ?? [];
  const relatedConceptIds = candidate.relatedConceptIds ?? [];
  const segmentMatch = annotation.selectedSegmentIds.some((segmentId) =>
    relatedSegmentIds.includes(segmentId)
  );
  const conceptMatch = annotation.concept
    ? relatedConceptIds.includes(annotation.concept.id)
    : false;

  if (segmentMatch || conceptMatch) {
    return true;
  }

  const candidateWords = normalize(candidate.name)
    .split(/\s+/)
    .filter((word) => word.length > 4);
  const annotationText = normalize(
    `${annotation.note} ${annotation.segments.map((segment) => segment.text).join(" ")}`
  );

  return candidateWords.some((word) => annotationText.includes(word));
}

function rankDiagnoses(
  candidates: ExampleDiagnosisCandidate[],
  annotations: GroupedAnnotation[]
): RankedDiagnosis[] {
  return candidates
    .map((candidate) => {
      let score = 0;
      let supportingCount = 0;
      let againstCount = 0;
      let missingUncertaintyCount = 0;
      let conceptMatchCount = 0;

      annotations.forEach((annotation) => {
        if (!isAnnotationRelevant(candidate, annotation)) {
          return;
        }

        score += labelWeight(annotation.label);

        if (
          annotation.concept &&
          candidate.relatedConceptIds?.includes(annotation.concept.id)
        ) {
          score += 1;
          conceptMatchCount += 1;
        }

        if (
          annotation.label === "supporting evidence" ||
          annotation.label === "useful clinical clue" ||
          annotation.label === "red flag"
        ) {
          supportingCount += 1;
        }
        if (annotation.label === "evidence against") {
          againstCount += 1;
        }
        if (
          annotation.label === "missing key information" ||
          annotation.label === "uncertainty"
        ) {
          missingUncertaintyCount += 1;
        }
      });

      if (candidate.status === "must_not_miss") {
        score += 0.5;
      }

      return {
        ...candidate,
        score,
        supportingCount,
        againstCount,
        missingUncertaintyCount,
        conceptMatchCount
      };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

export function CaseAuditExample({
  example,
  concepts
}: {
  example: ExampleCaseAudit;
  concepts: ConceptNode[];
}) {
  const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([]);
  const [annotations, setAnnotations] = useState<GroupedAnnotation[]>([]);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [selectionWarning, setSelectionWarning] = useState("");
  const [annotationLabel, setAnnotationLabel] =
    useState<AuditLabel>("supporting evidence");
  const [annotationNote, setAnnotationNote] = useState("");
  const [annotationConcept, setAnnotationConcept] =
    useState<ConceptSummary | undefined>();
  const [conceptQuery, setConceptQuery] = useState("viral cold");
  const [isTrayExpanded, setIsTrayExpanded] = useState(false);
  const [isTrayHovered, setIsTrayHovered] = useState(false);
  const [introPreview, setIntroPreview] = useState(true);
  const [diagnosisCandidates, setDiagnosisCandidates] = useState<
    ExampleDiagnosisCandidate[]
  >(() => defaultCandidates(example));
  const [userDiagnosisDraft, setUserDiagnosisDraft] =
    useState<UserDiagnosisDraft>(INITIAL_USER_DIAGNOSIS);

  const selectedSegments = useMemo(
    () =>
      example.segments.filter((segment) =>
        selectedSegmentIds.includes(segment.id)
      ),
    [example.segments, selectedSegmentIds]
  );
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
  const rankedDiagnoses = useMemo(
    () => rankDiagnoses(diagnosisCandidates, annotations),
    [diagnosisCandidates, annotations]
  );
  const trayMode: TrayMode = isTrayExpanded
    ? "expanded"
    : introPreview
      ? "intro"
      : isTrayHovered
        ? "peek"
        : "collapsed";
  const payloadPreview = {
    caseId: example.id,
    groupedAnnotations: annotations,
    diagnosisRanking: rankedDiagnoses.map((diagnosis) => ({
      id: diagnosis.id,
      name: diagnosis.name,
      status: diagnosis.status,
      mockScore: diagnosis.score,
      supportingAnnotationCount: diagnosis.supportingCount,
      evidenceAgainstAnnotationCount: diagnosis.againstCount,
      missingUncertaintyCount: diagnosis.missingUncertaintyCount
    })),
    userEnteredDiagnoses: diagnosisCandidates.filter((diagnosis) =>
      diagnosis.id.startsWith("user-dx-")
    )
  };

  function toggleSegment(segmentId: string) {
    setSelectionWarning("");
    setSelectedSegmentIds((current) =>
      current.includes(segmentId)
        ? current.filter((id) => id !== segmentId)
        : [...current, segmentId]
    );
  }

  function openWorkspace() {
    if (!selectedSegmentIds.length) {
      setSelectionWarning("Select one or more case segments before opening the note workspace.");
      return;
    }
    setSelectionWarning("");
    setWorkspaceOpen(true);
  }

  function saveAnnotation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSegments.length) {
      setSelectionWarning("Select one or more case segments before saving an annotation.");
      return;
    }

    setAnnotations((current) => [
      ...current,
      {
        id: `annotation-${Date.now()}`,
        sequence: current.length + 1,
        selectedSegmentIds: selectedSegments.map((segment) => segment.id),
        segments: selectedSegments.map((segment) => ({
          id: segment.id,
          label: segment.label,
          text: segment.text
        })),
        label: annotationLabel,
        concept: annotationConcept,
        note: annotationNote.trim(),
        createdAt: new Date().toISOString()
      }
    ]);
    setSelectedSegmentIds([]);
    setAnnotationNote("");
    setAnnotationConcept(undefined);
    setWorkspaceOpen(false);
  }

  function addUserDiagnosis(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = userDiagnosisDraft.name.trim();
    if (!name) {
      return;
    }
    setDiagnosisCandidates((current) => [
      ...current,
      {
        id: `user-dx-${Date.now()}`,
        name,
        status: userDiagnosisDraft.status,
        note: userDiagnosisDraft.note.trim()
      }
    ]);
    setUserDiagnosisDraft(INITIAL_USER_DIAGNOSIS);
  }

  function updateDiagnosisStatus(id: string, status: DiagnosisStatus) {
    setDiagnosisCandidates((current) =>
      current.map((diagnosis) =>
        diagnosis.id === id ? { ...diagnosis, status } : diagnosis
      )
    );
  }

  function deleteDiagnosis(id: string) {
    setDiagnosisCandidates((current) =>
      current.filter((diagnosis) => diagnosis.id !== id)
    );
  }

  function annotationsForSegment(segmentId: string) {
    return annotations.filter((annotation) =>
      annotation.selectedSegmentIds.includes(segmentId)
    );
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIntroPreview(false);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, []);

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

      <div className="grid gap-6 pb-[360px] pt-9 xl:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <article className="border border-line bg-paper p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                  Structured case context
                </p>
                <h2 className="mt-2 font-display text-3xl text-primary">
                  Select one or more predefined segments
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-line bg-background px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-muted">
                  {selectedSegmentIds.length} selected
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSegmentIds([]);
                    setSelectionWarning("");
                  }}
                  className="border border-line bg-background px-3 py-2 text-sm text-muted hover:border-primary hover:text-primary"
                >
                  Clear selection
                </button>
              </div>
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
                        const selected = selectedSegmentIds.includes(segment.id);
                        const segmentAnnotations = annotationsForSegment(segment.id);
                        return (
                          <button
                            key={segment.id}
                            type="button"
                            onClick={() => toggleSegment(segment.id)}
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
                              {selected
                                ? "Selected"
                                : segmentAnnotations.length
                                  ? `${segmentAnnotations.length} saved grouped annotation(s)`
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
        </section>

        <aside className="space-y-5">
          <CompactAnnotationPanel
            selectedSegments={selectedSegments}
            warning={selectionWarning}
            onOpenWorkspace={openWorkspace}
            onClearSelection={() => {
              setSelectedSegmentIds([]);
              setSelectionWarning("");
            }}
          />

          <SummaryPanel
            annotations={annotations}
            payloadPreview={payloadPreview}
          />
        </aside>
      </div>

      {workspaceOpen ? (
        <AnnotationWorkspace
          selectedSegments={selectedSegments}
          annotationLabel={annotationLabel}
          annotationNote={annotationNote}
          annotationConcept={annotationConcept}
          conceptQuery={conceptQuery}
          conceptResults={conceptResults}
          onLabelChange={setAnnotationLabel}
          onNoteChange={setAnnotationNote}
          onConceptQueryChange={setConceptQuery}
          onConceptSelect={setAnnotationConcept}
          onSubmit={saveAnnotation}
          onClose={() => setWorkspaceOpen(false)}
        />
      ) : null}

      <FloatingDiagnosisPanel
        mode={trayMode}
        rankedDiagnoses={rankedDiagnoses}
        userDiagnosisDraft={userDiagnosisDraft}
        onMouseEnter={() => {
          if (!isTrayExpanded && !introPreview) {
            setIsTrayHovered(true);
          }
        }}
        onMouseLeave={() => setIsTrayHovered(false)}
        onExpand={() => {
          setIntroPreview(false);
          setIsTrayExpanded(true);
        }}
        onCollapse={() => {
          setIntroPreview(false);
          setIsTrayExpanded(false);
          setIsTrayHovered(false);
        }}
        onDraftChange={setUserDiagnosisDraft}
        onAddDiagnosis={addUserDiagnosis}
        onDiagnosisStatusChange={updateDiagnosisStatus}
        onDeleteDiagnosis={deleteDiagnosis}
      />
    </PageShell>
  );
}

function CompactAnnotationPanel({
  selectedSegments,
  warning,
  onOpenWorkspace,
  onClearSelection
}: {
  selectedSegments: ExampleSegment[];
  warning: string;
  onOpenWorkspace: () => void;
  onClearSelection: () => void;
}) {
  return (
    <section className="border border-line bg-paper">
      <div className="sticky top-0 z-20 border-b border-line bg-paper p-4">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
          Annotation controls
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <button
            type="button"
            onClick={onOpenWorkspace}
            className="border border-primary bg-primary px-4 py-3 text-sm text-white hover:bg-background hover:text-primary"
          >
            Annotate selected
          </button>
          <button
            type="button"
            onClick={onClearSelection}
            className="border border-line bg-background px-4 py-3 text-sm text-muted hover:border-primary hover:text-primary"
          >
            Clear selection
          </button>
        </div>
      </div>

      <div className="p-4">
        <h2 className="font-display text-2xl text-primary">
          Current selection
        </h2>
        <div className="mt-4 border border-line bg-background p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Selected segments
          </p>
          <span className="font-mono text-sm text-primary">
            {selectedSegments.length}
          </span>
        </div>
        <div className="mt-3 max-h-44 space-y-2 overflow-auto">
          {selectedSegments.length ? (
            selectedSegments.map((segment) => (
              <p key={segment.id} className="border-t border-line pt-2 text-sm leading-6 text-muted first:border-t-0 first:pt-0">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
                  {segment.label}
                </span>{" "}
                {segment.text}
              </p>
            ))
          ) : (
            <p className="text-sm leading-6 text-muted">
              Select one or more chart segments to annotate them together.
            </p>
          )}
        </div>
        </div>
        {warning ? (
          <p className="mt-3 border border-accent bg-red-50 px-3 py-2 text-sm leading-6 text-accent">
            {warning}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function AnnotationWorkspace({
  selectedSegments,
  annotationLabel,
  annotationNote,
  annotationConcept,
  conceptQuery,
  conceptResults,
  onLabelChange,
  onNoteChange,
  onConceptQueryChange,
  onConceptSelect,
  onSubmit,
  onClose
}: {
  selectedSegments: ExampleSegment[];
  annotationLabel: AuditLabel;
  annotationNote: string;
  annotationConcept?: ConceptSummary;
  conceptQuery: string;
  conceptResults: ConceptMatch[];
  onLabelChange: (label: AuditLabel) => void;
  onNoteChange: (note: string) => void;
  onConceptQueryChange: (query: string) => void;
  onConceptSelect: (concept: ConceptSummary) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <section className="max-h-[92vh] w-full max-w-5xl overflow-auto border border-line bg-paper">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line bg-wash px-5 py-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
              Focused annotation workspace
            </p>
            <h2 className="mt-1 font-display text-3xl text-primary">
              Add grouped clinical note
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-line bg-background px-3 py-2 text-sm text-muted hover:border-primary hover:text-primary"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={onSubmit} className="grid gap-5 p-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <section className="border border-line bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                  Selected segments
                </p>
                <span className="font-mono text-sm text-primary">
                  {selectedSegments.length}
                </span>
              </div>
              <div className="mt-3 max-h-60 space-y-2 overflow-auto">
                {selectedSegments.map((segment) => (
                  <article key={segment.id} className="border border-line bg-paper p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
                      {segment.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-ink">
                      {segment.text}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                Annotation label
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

            <label className="block">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                Clinician note / opinion
              </span>
              <textarea
                value={annotationNote}
                onChange={(event) => onNoteChange(event.target.value)}
                className="mt-2 min-h-40 w-full border border-line bg-background p-3 text-sm leading-6 text-ink outline-none focus:border-primary"
                placeholder="Explain why these selected segments matter together..."
              />
            </label>

            <div className="border border-line bg-wash p-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                Selected concept
              </p>
              <p className="mt-1 text-sm leading-6 text-ink">
                {annotationConcept ? conceptLabel(annotationConcept) : "No concept attached"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <ConceptSearchWorkspace
              query={conceptQuery}
              results={conceptResults}
              onQueryChange={onConceptQueryChange}
              onConceptSelect={onConceptSelect}
            />
            <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-4">
              <button
                type="button"
                onClick={onClose}
                className="border border-line bg-background px-5 py-3 text-sm text-muted hover:border-primary hover:text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="border border-accent bg-accent px-5 py-3 text-sm text-white hover:bg-background hover:text-accent"
              >
                Save annotation
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

function ConceptSearchWorkspace({
  query,
  results,
  onQueryChange,
  onConceptSelect
}: {
  query: string;
  results: ConceptMatch[];
  onQueryChange: (query: string) => void;
  onConceptSelect: (concept: ConceptSummary) => void;
}) {
  return (
    <section className="border border-line bg-background p-4">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        Mock concept hierarchy search
      </p>
      <h3 className="mt-2 font-display text-2xl text-primary">
        Attach a static medical concept
      </h3>
      <label className="mt-4 block">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          Search concept names and synonyms
        </span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-primary"
          placeholder="Try viral cold or 病毒性感冒"
        />
      </label>
      <div className="mt-4 max-h-[460px] space-y-3 overflow-auto">
        {results.length ? (
          results.map(({ node, ancestors, children }) => (
            <article key={node.id} className="border border-line bg-paper p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                Parent concept(s)
              </p>
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
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                Child concept(s)
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {children.length
                  ? children.map(conceptLabel).join(" | ")
                  : "No child concepts in mock hierarchy"}
              </p>
              <button
                type="button"
                onClick={() => onConceptSelect(conceptSummary(node))}
                className="mt-3 w-full border border-primary bg-background px-3 py-2 text-xs text-primary hover:bg-primary hover:text-white"
              >
                Attach this concept
              </button>
            </article>
          ))
        ) : (
          <p className="border border-line bg-paper p-3 text-sm leading-6 text-muted">
            No static mock concepts matched this query.
          </p>
        )}
      </div>
    </section>
  );
}

function SummaryPanel({
  annotations,
  payloadPreview
}: {
  annotations: GroupedAnnotation[];
  payloadPreview: object;
}) {
  const [expanded, setExpanded] = useState(false);
  const payloadText = JSON.stringify(payloadPreview, null, 2);

  return (
    <section className="border border-line bg-paper p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
            Mock payload preview
          </p>
          <h2 className="mt-2 font-display text-2xl text-primary">
            Grouped annotations
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="border border-line bg-background px-3 py-2 text-sm text-muted hover:border-primary hover:text-primary"
        >
          Inspect payload
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {annotations.length ? (
          annotations.map((annotation) => (
            <article key={annotation.id} className="border border-line bg-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    Group #{annotation.sequence}
                  </p>
                  <h3 className="mt-1 font-display text-xl text-primary">
                    {annotation.label}
                  </h3>
                </div>
                <span className="border border-line bg-paper px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                  {annotation.selectedSegmentIds.length} segments
                </span>
              </div>
              {annotation.concept ? (
                <p className="mt-2 font-mono text-xs text-accent">
                  {conceptLabel(annotation.concept)}
                </p>
              ) : null}
              <p className="mt-2 text-sm leading-6 text-muted">
                {annotation.note || "No note entered."}
              </p>
            </article>
          ))
        ) : (
          <p className="border border-line bg-background p-3 text-sm leading-6 text-muted">
            No saved grouped annotations yet.
          </p>
        )}
      </div>
      <pre className="mt-4 max-h-[360px] overflow-auto border border-line bg-ink p-3 font-mono text-[11px] leading-5 text-white">
        {payloadText}
      </pre>
      {expanded ? (
        <PayloadModal
          payloadText={payloadText}
          onClose={() => setExpanded(false)}
        />
      ) : null}
    </section>
  );
}

function PayloadModal({
  payloadText,
  onClose
}: {
  payloadText: string;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
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
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-wash px-5 py-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
              Expanded mock payload
            </p>
            <h2 className="mt-1 font-display text-3xl text-primary">
              Case audit annotation data
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-line bg-background px-4 py-2 text-sm text-muted hover:border-primary hover:text-primary"
          >
            Close
          </button>
        </div>
        <pre className="max-h-[72vh] overflow-auto bg-ink p-5 font-mono text-xs leading-6 text-white">
          {payloadText}
        </pre>
      </section>
    </div>
  );
}

function FloatingDiagnosisPanel({
  mode,
  rankedDiagnoses,
  userDiagnosisDraft,
  onMouseEnter,
  onMouseLeave,
  onExpand,
  onCollapse,
  onDraftChange,
  onAddDiagnosis
  ,
  onDiagnosisStatusChange,
  onDeleteDiagnosis
}: {
  mode: TrayMode;
  rankedDiagnoses: RankedDiagnosis[];
  userDiagnosisDraft: UserDiagnosisDraft;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onExpand: () => void;
  onCollapse: () => void;
  onDraftChange: (draft: UserDiagnosisDraft) => void;
  onAddDiagnosis: (event: React.FormEvent<HTMLFormElement>) => void;
  onDiagnosisStatusChange: (id: string, status: DiagnosisStatus) => void;
  onDeleteDiagnosis: (id: string) => void;
}) {
  const trayRef = useRef<HTMLElement | null>(null);
  const isExpanded = mode === "expanded";
  const isIntro = mode === "intro";
  const isPeek = mode === "peek";
  const isCollapsed = mode === "collapsed";
  const contentMaxHeight =
    isExpanded ? "max-h-[70vh]" :
    isIntro ? "max-h-[360px]" :
    isPeek ? "max-h-[148px]" :
    "max-h-0";
  const contentOpacity = isCollapsed ? "opacity-0" : "opacity-100";

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        !isExpanded ||
        !trayRef.current ||
        trayRef.current.contains(event.target as Node)
      ) {
        return;
      }
      onCollapse();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isExpanded, onCollapse]);

  return (
    <section
      ref={trayRef}
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-background/95 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] transition-all duration-700"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPointerDownCapture={() => {
        if (!isExpanded) {
          onExpand();
        }
      }}
    >
      <div className="mx-auto max-w-content px-5 py-2">
        <button
          type="button"
          onClick={() => {
            if (isExpanded) {
              onCollapse();
              return;
            }
            onExpand();
          }}
          aria-expanded={isExpanded}
          className="flex w-full flex-wrap items-center justify-between gap-3 text-left"
        >
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
              Diagnostic reasoning / mock ranked diagnoses
            </p>
            <h2 className="font-display text-2xl text-primary">
              {isCollapsed
                ? "Open mock ranking tray"
                : "Mock ranking based on demo annotations only"}
            </h2>
          </div>
          <span className="border border-primary bg-primary px-4 py-2 text-sm text-white">
            {isExpanded ? "Expanded" : isPeek ? "Peek" : isIntro ? "Preview" : "Open"}
          </span>
        </button>

        <div
          className={`grid gap-4 overflow-hidden pb-2 transition-[max-height,opacity] duration-700 lg:grid-cols-[1fr_330px] ${contentMaxHeight} ${contentOpacity} ${
            isCollapsed ? "mt-0" : "mt-3"
          }`}
        >
          <div className="space-y-3 overflow-y-auto pr-1">
            {isExpanded ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onCollapse();
                  }}
                  className="border border-line bg-paper px-4 py-2 text-sm text-muted hover:border-primary hover:text-primary"
                >
                  Collapse
                </button>
              </div>
            ) : null}
            <div className="grid gap-3 lg:grid-cols-2">
              {rankedDiagnoses.map((diagnosis) => (
                <article key={diagnosis.id} className="border border-line bg-paper p-4">
                  <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                        Mock diagnosis candidate
                      </p>
                      <h3 className="mt-1 font-display text-2xl leading-7 text-primary">
                      {diagnosis.name}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-start gap-2 xl:justify-end">
                      <label className="block">
                        <span className="sr-only">Diagnosis status</span>
                        <select
                          value={diagnosis.status}
                          onChange={(event) =>
                            onDiagnosisStatusChange(
                              diagnosis.id,
                              event.target.value as DiagnosisStatus
                            )
                          }
                          className="border border-line bg-background px-2 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted outline-none focus:border-primary"
                        >
                          {DIAGNOSIS_STATUSES.map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        onClick={() => onDeleteDiagnosis(diagnosis.id)}
                        className="border border-line bg-background px-2 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted hover:border-accent hover:text-accent"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {diagnosis.note ? (
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {diagnosis.note}
                    </p>
                  ) : null}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
                    <Metric label="Score" value={diagnosis.score.toFixed(1)} />
                    <Metric label="Support" value={diagnosis.supportingCount} />
                    <Metric label="Against" value={diagnosis.againstCount} />
                    <Metric
                      label="Missing"
                      value={diagnosis.missingUncertaintyCount}
                    />
                  </div>
                  {diagnosis.conceptMatchCount ? (
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-accent">
                      {diagnosis.conceptMatchCount} concept-linked annotation(s)
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>

          <div className={isExpanded ? "block" : "hidden"}>
            <form onSubmit={onAddDiagnosis} className="border border-line bg-paper p-4">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                Add clinician diagnosis
              </p>
              <label className="mt-3 block">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                  Diagnosis
                </span>
                <input
                  value={userDiagnosisDraft.name}
                  onChange={(event) =>
                    onDraftChange({
                      ...userDiagnosisDraft,
                      name: event.target.value
                    })
                  }
                  className="mt-2 w-full border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                  placeholder="Add another candidate..."
                />
              </label>
              <label className="mt-3 block">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                  Status
                </span>
                <select
                  value={userDiagnosisDraft.status}
                  onChange={(event) =>
                    onDraftChange({
                      ...userDiagnosisDraft,
                      status: event.target.value as DiagnosisStatus
                    })
                  }
                  className="mt-2 w-full border border-line bg-background px-3 py-2 text-sm text-ink outline-none focus:border-primary"
                >
                  {DIAGNOSIS_STATUSES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-3 block">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                  Note
                </span>
                <textarea
                  value={userDiagnosisDraft.note}
                  onChange={(event) =>
                    onDraftChange({
                      ...userDiagnosisDraft,
                      note: event.target.value
                    })
                  }
                  className="mt-2 min-h-20 w-full border border-line bg-background p-2 text-sm leading-6 text-ink outline-none focus:border-primary"
                />
              </label>
              <button
                type="submit"
                className="mt-3 w-full border border-accent bg-accent px-4 py-2 text-sm text-white hover:bg-background hover:text-accent"
              >
                Add diagnosis
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-line bg-background p-2">
      <p className="font-mono text-sm text-ink">{value}</p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
        {label}
      </p>
    </div>
  );
}
