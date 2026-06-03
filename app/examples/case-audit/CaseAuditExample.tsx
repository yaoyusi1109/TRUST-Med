"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LanguageToggle, useLanguage } from "@/components/LanguageProvider";
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

const caseAuditCopy = {
  en: {
    eyebrow: "Mock case audit",
    title: "Single-Patient Case Audit",
    subtitle: "单患者病历审计",
    intro:
      "Simulated demo case only. No PHI, no real patient data, and not clinical guidance.",
    secondaryIntro: "仅用于模拟演示。不含 PHI、无真实患者数据，且非临床指导。",
    back: "Back to examples",
    badge: "Simulated demo data / Not clinical guidance",
    caseContext: "Case Context",
    caseContextSubtitle: "Select one or more predefined segments",
    selected: "selected",
    selectedState: "Selected",
    clickToSelect: "Click to select",
    savedGroupedAnnotations: "saved grouped annotation(s)",
    clearSelection: "Clear selection",
    annotationControls: "Annotation Controls",
    annotateSelected: "Annotate selected",
    currentSelection: "Current selection",
    selectedSegments: "Selected Segments",
    emptySelection:
      "Select one or more chart segments to annotate them together.",
    focusedWorkspace: "Focused Annotation Workspace",
    addGroupedNote: "Add grouped clinical note",
    cancel: "Cancel",
    annotationLabel: "Annotation label",
    clinicianNote: "Clinician note / opinion",
    notePlaceholder: "Explain why these selected segments matter together...",
    selectedConcept: "Selected concept",
    noConcept: "No concept attached",
    medicalConceptSearch: "Medical Concept Search",
    attachConcept: "Attach a static medical concept",
    conceptSearchLabel: "Search concept names and synonyms",
    conceptPlaceholder: "Try common cold or 病毒性感冒",
    parents: "Parent concept(s)",
    topLevelConcept: "Top level concept",
    children: "Child concept(s)",
    noChildren: "No child concepts in mock hierarchy",
    attachThisConcept: "Attach this concept",
    noConceptResults: "No static mock concepts matched this query.",
    saveAnnotation: "Save annotation",
    mockPayloadPreview: "Mock Payload Preview",
    groupedAnnotation: "Grouped Annotation",
    inspectPayload: "Inspect payload",
    noAnnotations: "No saved grouped annotations yet.",
    noNote: "No note entered.",
    expandedPayload: "Expanded mock payload",
    payloadTitle: "Case audit annotation data",
    close: "Close",
    diagnosticTray: "Diagnostic Reasoning Tray",
    diagnosticTraySubtitle: "Mock ranked diagnoses",
    openTray: "Open mock ranking tray",
    rankingDisclaimer: "Mock ranking based on demo annotations only",
    collapse: "Collapse",
    mockDiagnosisCandidate: "Mock diagnosis candidate",
    diagnosisStatus: "Diagnosis status",
    delete: "Delete",
    addClinicianDiagnosis: "Add clinician diagnosis",
    diagnosis: "Diagnosis",
    status: "Status",
    note: "Note",
    addDiagnosis: "Add diagnosis"
  },
  zh: {
    eyebrow: "模拟病历审计",
    title: "单患者病历审计",
    subtitle: "Single-Patient Case Audit",
    intro: "仅用于模拟演示。不含 PHI、无真实患者数据，且非临床指导。",
    secondaryIntro:
      "Simulated demo case only. No PHI, no real patient data, and not clinical guidance.",
    back: "返回示例",
    badge: "模拟演示数据 / 非临床指导",
    caseContext: "病例背景",
    caseContextSubtitle: "选择一个或多个预定义片段",
    selected: "已选",
    selectedState: "已选择",
    clickToSelect: "点击选择",
    savedGroupedAnnotations: "条已保存组合标注",
    clearSelection: "清除选择",
    annotationControls: "标注控制",
    annotateSelected: "标注已选片段",
    currentSelection: "当前选择",
    selectedSegments: "已选片段",
    emptySelection: "选择一个或多个病历片段后，可将它们作为一组进行标注。",
    focusedWorkspace: "聚焦标注工作区",
    addGroupedNote: "添加组合临床意见",
    cancel: "取消",
    annotationLabel: "标注标签",
    clinicianNote: "临床医生备注 / 判断",
    notePlaceholder: "说明这些已选片段为何需要合并解读...",
    selectedConcept: "已选概念",
    noConcept: "未附加概念",
    medicalConceptSearch: "医学概念检索",
    attachConcept: "附加静态医学概念",
    conceptSearchLabel: "检索概念名称和同义词",
    conceptPlaceholder: "可尝试 common cold 或 病毒性感冒",
    parents: "父级概念",
    topLevelConcept: "顶层概念",
    children: "子级概念",
    noChildren: "模拟层级中无子概念",
    attachThisConcept: "附加此概念",
    noConceptResults: "没有匹配该查询的静态模拟概念。",
    saveAnnotation: "保存标注",
    mockPayloadPreview: "模拟数据负载预览",
    groupedAnnotation: "组合标注",
    inspectPayload: "查看数据负载",
    noAnnotations: "尚无已保存的组合标注。",
    noNote: "未填写备注。",
    expandedPayload: "展开的模拟数据负载",
    payloadTitle: "病历审计标注数据",
    close: "关闭",
    diagnosticTray: "诊断推理面板",
    diagnosticTraySubtitle: "模拟排序诊断",
    openTray: "打开模拟排序面板",
    rankingDisclaimer: "仅基于演示标注的模拟排序",
    collapse: "收起",
    mockDiagnosisCandidate: "模拟诊断候选",
    diagnosisStatus: "诊断状态",
    delete: "删除",
    addClinicianDiagnosis: "添加临床医生诊断",
    diagnosis: "诊断",
    status: "状态",
    note: "备注",
    addDiagnosis: "添加诊断"
  }
} as const;

type CaseAuditCopy = Record<keyof (typeof caseAuditCopy)["en"], string>;

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
  const { language } = useLanguage();
  const copy = caseAuditCopy[language];
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

      <div className="grid gap-6 pb-[360px] pt-9 xl:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <article className="border border-line bg-paper p-5">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
                  {copy.caseContext}
                </p>
                <h2 className="mt-2 font-display text-3xl text-primary">
                  {copy.caseContextSubtitle}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-line bg-background px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-muted">
                  {selectedSegmentIds.length} {copy.selected}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSegmentIds([]);
                    setSelectionWarning("");
                  }}
                  className="border border-line bg-background px-3 py-2 text-sm text-muted hover:border-primary hover:text-primary"
                >
                  {copy.clearSelection}
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
                                ? copy.selectedState
                                : segmentAnnotations.length
                                  ? `${segmentAnnotations.length} ${copy.savedGroupedAnnotations}`
                                  : copy.clickToSelect}
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
            copy={copy}
            onOpenWorkspace={openWorkspace}
            onClearSelection={() => {
              setSelectedSegmentIds([]);
              setSelectionWarning("");
            }}
          />

          <SummaryPanel
            annotations={annotations}
            payloadPreview={payloadPreview}
            copy={copy}
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
          copy={copy}
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
        copy={copy}
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
  copy,
  onOpenWorkspace,
  onClearSelection
}: {
  selectedSegments: ExampleSegment[];
  warning: string;
  copy: CaseAuditCopy;
  onOpenWorkspace: () => void;
  onClearSelection: () => void;
}) {
  return (
    <section className="border border-line bg-paper">
      <div className="sticky top-0 z-20 border-b border-line bg-paper p-4">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
          {copy.annotationControls}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <button
            type="button"
            onClick={onOpenWorkspace}
            className="border border-primary bg-primary px-4 py-3 text-sm text-white hover:bg-background hover:text-primary"
          >
            {copy.annotateSelected}
          </button>
          <button
            type="button"
            onClick={onClearSelection}
            className="border border-line bg-background px-4 py-3 text-sm text-muted hover:border-primary hover:text-primary"
          >
            {copy.clearSelection}
          </button>
        </div>
      </div>

      <div className="p-4">
        <h2 className="font-display text-2xl text-primary">
          {copy.currentSelection}
        </h2>
        <div className="mt-4 border border-line bg-background p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            {copy.selectedSegments}
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
              {copy.emptySelection}
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
  copy,
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
  copy: CaseAuditCopy;
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
              {copy.focusedWorkspace}
            </p>
            <h2 className="mt-1 font-display text-3xl text-primary">
              {copy.addGroupedNote}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-line bg-background px-3 py-2 text-sm text-muted hover:border-primary hover:text-primary"
          >
            {copy.cancel}
          </button>
        </div>

        <form onSubmit={onSubmit} className="grid gap-5 p-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <section className="border border-line bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                  {copy.selectedSegments}
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
                {copy.annotationLabel}
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
                {copy.clinicianNote}
              </span>
              <textarea
                value={annotationNote}
                onChange={(event) => onNoteChange(event.target.value)}
                className="mt-2 min-h-40 w-full border border-line bg-background p-3 text-sm leading-6 text-ink outline-none focus:border-primary"
                placeholder={copy.notePlaceholder}
              />
            </label>

            <div className="border border-line bg-wash p-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                {copy.selectedConcept}
              </p>
              <p className="mt-1 text-sm leading-6 text-ink">
                {annotationConcept ? conceptLabel(annotationConcept) : copy.noConcept}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <ConceptSearchWorkspace
              query={conceptQuery}
              results={conceptResults}
              copy={copy}
              onQueryChange={onConceptQueryChange}
              onConceptSelect={onConceptSelect}
            />
            <div className="flex flex-wrap justify-end gap-3 border-t border-line pt-4">
              <button
                type="button"
                onClick={onClose}
                className="border border-line bg-background px-5 py-3 text-sm text-muted hover:border-primary hover:text-primary"
              >
                {copy.cancel}
              </button>
              <button
                type="submit"
                className="border border-accent bg-accent px-5 py-3 text-sm text-white hover:bg-background hover:text-accent"
              >
                {copy.saveAnnotation}
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
  copy,
  onQueryChange,
  onConceptSelect
}: {
  query: string;
  results: ConceptMatch[];
  copy: CaseAuditCopy;
  onQueryChange: (query: string) => void;
  onConceptSelect: (concept: ConceptSummary) => void;
}) {
  return (
    <section className="border border-line bg-background p-4">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
        {copy.medicalConceptSearch}
      </p>
      <h3 className="mt-2 font-display text-2xl text-primary">
        {copy.attachConcept}
      </h3>
      <label className="mt-4 block">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          {copy.conceptSearchLabel}
        </span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-primary"
          placeholder={copy.conceptPlaceholder}
        />
      </label>
      <div className="mt-4 max-h-[460px] space-y-3 overflow-auto">
        {results.length ? (
          results.map(({ node, ancestors, children }) => (
            <article key={node.id} className="border border-line bg-paper p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                {copy.parents}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {ancestors.length
                  ? ancestors.map(conceptLabel).join(" -> ")
                  : copy.topLevelConcept}
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
                {copy.children}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                {children.length
                  ? children.map(conceptLabel).join(" | ")
                  : copy.noChildren}
              </p>
              <button
                type="button"
                onClick={() => onConceptSelect(conceptSummary(node))}
                className="mt-3 w-full border border-primary bg-background px-3 py-2 text-xs text-primary hover:bg-primary hover:text-white"
              >
                {copy.attachThisConcept}
              </button>
            </article>
          ))
        ) : (
          <p className="border border-line bg-paper p-3 text-sm leading-6 text-muted">
            {copy.noConceptResults}
          </p>
        )}
      </div>
    </section>
  );
}

function SummaryPanel({
  annotations,
  payloadPreview,
  copy
}: {
  annotations: GroupedAnnotation[];
  payloadPreview: object;
  copy: CaseAuditCopy;
}) {
  const [expanded, setExpanded] = useState(false);
  const payloadText = JSON.stringify(payloadPreview, null, 2);

  return (
    <section className="border border-line bg-paper p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">
            {copy.mockPayloadPreview}
          </p>
          <h2 className="mt-2 font-display text-2xl text-primary">
            {copy.groupedAnnotation}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="border border-line bg-background px-3 py-2 text-sm text-muted hover:border-primary hover:text-primary"
        >
          {copy.inspectPayload}
        </button>
      </div>
      <div className="mt-4 space-y-3">
        {annotations.length ? (
          annotations.map((annotation) => (
            <article key={annotation.id} className="border border-line bg-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {copy.groupedAnnotation} #{annotation.sequence}
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
                {annotation.note || copy.noNote}
              </p>
            </article>
          ))
        ) : (
          <p className="border border-line bg-background p-3 text-sm leading-6 text-muted">
            {copy.noAnnotations}
          </p>
        )}
      </div>
      <pre className="mt-4 max-h-[360px] overflow-auto border border-line bg-ink p-3 font-mono text-[11px] leading-5 text-white">
        {payloadText}
      </pre>
      {expanded ? (
        <PayloadModal
          payloadText={payloadText}
          copy={copy}
          onClose={() => setExpanded(false)}
        />
      ) : null}
    </section>
  );
}

function PayloadModal({
  payloadText,
  copy,
  onClose
}: {
  payloadText: string;
  copy: CaseAuditCopy;
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
              {copy.expandedPayload}
            </p>
            <h2 className="mt-1 font-display text-3xl text-primary">
              {copy.payloadTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-line bg-background px-4 py-2 text-sm text-muted hover:border-primary hover:text-primary"
          >
            {copy.close}
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
  copy,
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
  copy: CaseAuditCopy;
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
              {copy.diagnosticTray} / {copy.diagnosticTraySubtitle}
            </p>
            <h2 className="font-display text-2xl text-primary">
              {isCollapsed
                ? copy.openTray
                : copy.rankingDisclaimer}
            </h2>
          </div>
          <span className="border border-primary bg-primary px-4 py-2 text-sm text-white">
            {isExpanded ? copy.collapse : isPeek ? "Peek" : isIntro ? "Preview" : "Open"}
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
                  {copy.collapse}
                </button>
              </div>
            ) : null}
            <div className="grid gap-3 lg:grid-cols-2">
              {rankedDiagnoses.map((diagnosis) => (
                <article key={diagnosis.id} className="border border-line bg-paper p-4">
                  <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                        {copy.mockDiagnosisCandidate}
                      </p>
                      <h3 className="mt-1 font-display text-2xl leading-7 text-primary">
                      {diagnosis.name}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-start gap-2 xl:justify-end">
                      <label className="block">
                        <span className="sr-only">{copy.diagnosisStatus}</span>
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
                        {copy.delete}
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
                {copy.addClinicianDiagnosis}
              </p>
              <label className="mt-3 block">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                  {copy.diagnosis}
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
                  {copy.status}
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
                  {copy.note}
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
                {copy.addDiagnosis}
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
