import scenarios from "@/data/scenarios.json";
import type { Scenario } from "@/types";
import { EvaluateScenarioList } from "./EvaluateScenarioList";

const scenarioData = scenarios as Scenario[];

export default function EvaluatePage() {
  return <EvaluateScenarioList scenarios={scenarioData} />;
}
