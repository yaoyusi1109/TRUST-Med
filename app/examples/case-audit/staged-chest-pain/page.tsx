import examples from "@/data/examples.json";
import scenarios from "@/data/scenarios.json";
import type { ExamplesData, Scenario } from "@/types";
import { StagedChestPainAuditExample } from "./StagedChestPainAuditExample";

const examplesData = examples as ExamplesData;
const scenarioData = scenarios as Scenario[];

export default function StagedChestPainAuditPage() {
  const scenario = scenarioData.find(
    (item) => item.id === examplesData.stagedChestPainAudit.sourceScenarioId
  );

  return (
    <StagedChestPainAuditExample
      example={examplesData.stagedChestPainAudit}
      scenario={scenario}
      concepts={examplesData.conceptHierarchy}
    />
  );
}
