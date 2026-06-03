import Link from "next/link";
import examples from "@/data/examples.json";
import type { ExamplesData } from "@/types";
import { CaseAuditExample } from "./CaseAuditExample";

const examplesData = examples as ExamplesData;

export default function CaseAuditPage() {
  return (
    <>
      <div className="mx-auto max-w-content px-5 pt-6">
        <Link
          href="/examples/case-audit/staged-chest-pain"
          className="inline-flex border border-accent bg-background px-4 py-2 text-sm text-accent hover:bg-accent hover:text-white"
        >
          Try staged chest pain audit
        </Link>
      </div>
      <CaseAuditExample
        example={examplesData.caseAudit}
        concepts={examplesData.conceptHierarchy}
      />
    </>
  );
}
