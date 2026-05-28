import examples from "@/data/examples.json";
import type { ExamplesData } from "@/types";
import { CaseAuditExample } from "./CaseAuditExample";

const examplesData = examples as ExamplesData;

export default function CaseAuditPage() {
  return (
    <CaseAuditExample
      example={examplesData.caseAudit}
      concepts={examplesData.conceptHierarchy}
    />
  );
}
