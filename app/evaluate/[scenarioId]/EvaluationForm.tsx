"use client";

import { useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import type { Scenario } from "@/types";

type Checks = Record<string, { a: boolean; b: boolean }>;

type Action =
  | { type: "toggle"; rubricId: string; model: "a" | "b" }
  | { type: "reset"; rubric: Scenario["rubric"] };

function makeInitialChecks(rubric: Scenario["rubric"]): Checks {
  return Object.fromEntries(
    rubric.map((item) => [item.id, { a: false, b: false }])
  );
}

function reducer(state: Checks, action: Action): Checks {
  if (action.type === "reset") {
    return makeInitialChecks(action.rubric);
  }

  const current = state[action.rubricId];
  return {
    ...state,
    [action.rubricId]: {
      ...current,
      [action.model]: !current[action.model]
    }
  };
}

export function EvaluationForm({ scenario }: { scenario: Scenario }) {
  const router = useRouter();
  const isChinese = scenario.language === "中文";
  const copy = isChinese
    ? {
        difficulty:
          scenario.difficulty === "High-Stakes" ? "高风险" : "常规场景",
        modelA: "模型 A",
        modelB: "模型 B",
        rubricTitle: "场景专属测评量表",
        rubricIntro: "请先完成各项标准核对，再进行模型偏好选择。",
        criterion: "评价标准",
        weight: "权重",
        modelAMeets: "模型 A 符合",
        modelBMeets: "模型 B 符合",
        safetyCritical: "安全关键项",
        preferenceTitle: "总体来看，你更倾向于哪一个回答？",
        options: [
          "模型 A 明显更好",
          "模型 A 略好",
          "模型 B 略好",
          "模型 B 明显更好"
        ],
        notes: "补充说明（选填）",
        submit: "提交测评"
      }
    : {
        difficulty: scenario.difficulty,
        modelA: "Model A",
        modelB: "Model B",
        rubricTitle: "Scenario-specific rubric",
        rubricIntro:
          "Complete the rubric before making the pairwise preference choice.",
        criterion: "Criterion",
        weight: "Weight",
        modelAMeets: "Model A meets this",
        modelBMeets: "Model B meets this",
        safetyCritical: "Safety-critical",
        preferenceTitle: "Overall, which response do you prefer?",
        options: [
          "Model A is clearly better",
          "Model A is slightly better",
          "Model B is slightly better",
          "Model B is clearly better"
        ],
        notes: "Any additional notes? (Optional)",
        submit: "Submit evaluation"
      };
  const [checks, dispatch] = useReducer(
    reducer,
    scenario.rubric,
    makeInitialChecks
  );
  const [preference, setPreference] = useState("");
  const [comment, setComment] = useState("");

  function submitEvaluation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/results/${scenario.id}`);
  }

  return (
    <main className="mx-auto max-w-content px-5 py-10">
      <form onSubmit={submitEvaluation} className="space-y-8">
        <section className="border border-line bg-paper p-6">
          <div className="mb-5 flex flex-wrap gap-2">
            <span className="border border-line px-3 py-1 font-mono text-xs text-muted">
              {scenario.category}
            </span>
            <span className="border border-line px-3 py-1 font-mono text-xs text-muted">
              {scenario.language}
            </span>
            <span
              className={`border px-3 py-1 font-mono text-xs ${
                scenario.difficulty === "High-Stakes"
                  ? "border-accent text-accent"
                  : "border-line text-muted"
              }`}
            >
              {copy.difficulty}
            </span>
          </div>
          <h1 className="font-display text-3xl leading-tight text-primary">
            {scenario.title}
          </h1>
          <p className="mt-5 leading-8 text-ink">{scenario.vignette}</p>
          <p className="mt-5 border-t border-line pt-5 font-display text-xl leading-8 text-ink">
            {scenario.query}
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {[
            [copy.modelA, scenario.modelA.response],
            [copy.modelB, scenario.modelB.response]
          ].map(([label, response]) => (
            <article key={label} className="border border-line bg-paper">
              <div className="border-b border-line bg-wash px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] text-primary">
                {label}
              </div>
              <div className="space-y-4 p-5 leading-7 text-muted">
                {response.split("\n\n").map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="border border-line bg-paper p-6">
          <div className="mb-5">
            <h2 className="font-display text-3xl text-primary">
              {copy.rubricTitle}
            </h2>
            <p className="mt-2 text-muted">{copy.rubricIntro}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="border-b border-line text-left font-mono text-xs uppercase tracking-[0.14em] text-muted">
                  <th className="py-3 pr-4 font-medium">{copy.criterion}</th>
                  <th className="px-4 py-3 text-center font-medium">
                    {copy.weight}
                  </th>
                  <th className="px-4 py-3 text-center font-medium">
                    {copy.modelAMeets}
                  </th>
                  <th className="px-4 py-3 text-center font-medium">
                    {copy.modelBMeets}
                  </th>
                </tr>
              </thead>
              <tbody>
                {scenario.rubric.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-b border-line last:border-b-0 ${
                      item.isSafetyCritical ? "bg-red-50/50" : ""
                    }`}
                  >
                    <td className="py-4 pr-4 leading-6 text-ink">
                      {item.criterion}
                      {item.isSafetyCritical ? (
                        <span className="ml-3 font-mono text-xs uppercase tracking-[0.12em] text-accent">
                          {copy.safetyCritical}
                        </span>
                      ) : null}
                    </td>
                    <td
                      className={`px-4 py-4 text-center font-mono text-sm ${
                        item.weight < 0 ? "text-accent" : "text-muted"
                      }`}
                    >
                      {item.weight > 0 ? `+${item.weight}` : item.weight}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        aria-label={`${copy.modelAMeets}: ${item.criterion}`}
                        type="checkbox"
                        checked={checks[item.id].a}
                        onChange={() =>
                          dispatch({
                            type: "toggle",
                            rubricId: item.id,
                            model: "a"
                          })
                        }
                      />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input
                        aria-label={`${copy.modelBMeets}: ${item.criterion}`}
                        type="checkbox"
                        checked={checks[item.id].b}
                        onChange={() =>
                          dispatch({
                            type: "toggle",
                            rubricId: item.id,
                            model: "b"
                          })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border border-line bg-paper p-6">
          <h2 className="font-display text-3xl text-primary">
            {copy.preferenceTitle}
          </h2>
          <fieldset className="mt-5 grid gap-3 md:grid-cols-2">
            {copy.options.map((option) => (
              <label
                key={option}
                className="flex items-center gap-3 border border-line bg-background p-4 text-ink"
              >
                <input
                  required
                  type="radio"
                  name="preference"
                  value={option}
                  checked={preference === option}
                  onChange={(event) => setPreference(event.target.value)}
                />
                {option}
              </label>
            ))}
          </fieldset>
          <label className="mt-6 block">
            <span className="text-sm text-muted">
              {copy.notes}
            </span>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="mt-2 min-h-28 w-full border border-line bg-background p-3 text-ink outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            className="mt-6 rounded-button border border-accent bg-accent px-6 py-3 text-sm text-white transition-colors hover:bg-background hover:text-accent"
          >
            {copy.submit}
          </button>
        </section>
      </form>
    </main>
  );
}
