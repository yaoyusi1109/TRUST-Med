import { notFound } from "next/navigation";
import scenarios from "@/data/scenarios.json";
import type { Scenario } from "@/types";
import { EvaluationForm } from "./EvaluationForm";

const scenarioData = scenarios as Scenario[];

export function generateStaticParams() {
  return scenarioData.map((scenario) => ({ scenarioId: scenario.id }));
}

export default function ScenarioEvaluationPage({
  params
}: {
  params: { scenarioId: string };
}) {
  const scenario = scenarioData.find((item) => item.id === params.scenarioId);

  if (!scenario) {
    notFound();
  }

  return <EvaluationForm scenario={scenario} />;
}
