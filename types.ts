export type RubricItem = {
  id: string;
  criterion: string;
  weight: number;
  isSafetyCritical: boolean;
};

export type ScenarioEvidence = {
  type: "ct" | "chat" | "genomics" | "table";
  title: string;
  subtitle?: string;
  caption?: string;
  items?: string[];
  transcript?: {
    speaker: string;
    text: string;
  }[];
  rows?: {
    label: string;
    value: string;
    note?: string;
  }[];
  images?: {
    src: string;
    alt: string;
    caption?: string;
  }[];
  sourceUrl?: string;
};

export type Scenario = {
  id: string;
  title: string;
  category: string;
  difficulty: "Routine" | "High-Stakes";
  language: "EN" | "中文";
  modality?:
    | "Text"
    | "Imaging"
    | "Patient chat"
    | "Genomics"
    | "Medication list"
    | "ECG";
  vignette: string;
  evidence?: ScenarioEvidence;
  query: string;
  modelA: {
    trueName: string;
    response: string;
  };
  modelB: {
    trueName: string;
    response: string;
  };
  rubric: RubricItem[];
  mockAggregate: {
    totalEvaluations: number;
    preferenceB: number;
  };
};

export type LeaderboardRow = {
  rank: number;
  model: string;
  score: number;
  evaluations: number;
  safetyFailures: number;
};

export type LeaderboardData = {
  routine: LeaderboardRow[];
  highStakes: LeaderboardRow[];
};

export type ExampleSegment = {
  id: string;
  section: string;
  label: string;
  text: string;
};

export type ConceptNode = {
  id: string;
  display: string;
  displayZh?: string;
  synonyms: string[];
  children?: ConceptNode[];
};

export type ExampleDiagnosisCandidate = {
  id: string;
  name: string;
  status: "more_likely" | "less_likely" | "must_not_miss";
  note?: string;
  relatedConceptIds?: string[];
  relatedSegmentIds?: string[];
};

export type ExampleCaseAudit = {
  id: string;
  title: string;
  category: string;
  disclaimer: string;
  segments: ExampleSegment[];
  diagnosticOptions: string[];
  diagnosticCandidates?: ExampleDiagnosisCandidate[];
};

export type ExampleResponse = {
  label: string;
  trueName: string;
  segments: ExampleSegment[];
};

export type ExamplePreferenceReview = {
  id: string;
  title: string;
  category: string;
  disclaimer: string;
  caseSummary: ExampleSegment[];
  responses: {
    a: ExampleResponse;
    b: ExampleResponse;
  };
};

export type ExamplesData = {
  caseAudit: ExampleCaseAudit;
  preferenceReview: ExamplePreferenceReview;
  conceptHierarchy: ConceptNode[];
};
