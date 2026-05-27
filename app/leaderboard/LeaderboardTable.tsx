"use client";

import { useState } from "react";
import leaderboard from "@/data/leaderboard.json";
import type { LeaderboardData } from "@/types";
import { PageShell } from "@/components/PageShell";
import { LanguageToggle, useLanguage } from "@/components/LanguageProvider";

const leaderboardData = leaderboard as LeaderboardData;

export function LeaderboardTable() {
  const { language } = useLanguage();
  const [track, setTrack] = useState<"routine" | "highStakes">("routine");
  const rows = leaderboardData[track];
  const copy =
    language === "zh"
      ? {
          eyebrow: "模拟排行榜",
          title: "安全感知 Bradley-Terry 排名",
          intro:
            "演示版将常规临床任务与高风险场景分开展示，因为总体偏好可能掩盖安全敏感失败模式。",
          routine: "常规临床",
          highStakes: "高风险",
          rank: "排名",
          model: "模型",
          score: "Bradley-Terry 分数",
          evaluations: "测评数",
          failures: "安全失败",
          note: "演示用模拟数据。真实测评计划于2026年第三季度启动。"
        }
      : {
          eyebrow: "Mock leaderboard",
          title: "Safety-aware Bradley-Terry ranking",
          intro:
            "The demo separates routine clinical tasks from high-stakes scenarios, because aggregate preference can hide safety-sensitive failure modes.",
          routine: "Routine Clinical",
          highStakes: "High-Stakes",
          rank: "Rank",
          model: "Model",
          score: "Bradley-Terry Score",
          evaluations: "# Evaluations",
          failures: "Safety Failures",
          note: "Mock data for demonstration. Real evaluations launching Q3 2026."
        };

  return (
    <PageShell
      eyebrow={copy.eyebrow}
      title={copy.title}
      intro={copy.intro}
    >
      <div className="mt-6 flex justify-end">
        <LanguageToggle />
      </div>
      <section className="py-9">
        <div className="mb-6 flex border border-line bg-paper p-1">
          {[
            ["routine", copy.routine],
            ["highStakes", copy.highStakes]
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTrack(value as "routine" | "highStakes")}
              className={`flex-1 rounded-button px-4 py-3 text-sm transition-colors ${
                track === value
                  ? "bg-primary text-white"
                  : "text-muted hover:bg-wash hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto border border-line bg-paper">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-b border-line bg-wash text-left font-mono text-xs uppercase tracking-[0.14em] text-muted">
                <th className="px-4 py-3 font-medium">{copy.rank}</th>
                <th className="px-4 py-3 font-medium">{copy.model}</th>
                <th className="px-4 py-3 text-right font-medium">
                  {copy.score}
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  {copy.evaluations}
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  {copy.failures}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.model} className="border-b border-line last:border-0">
                  <td className="px-4 py-4 font-mono text-sm text-muted">
                    {row.rank}
                  </td>
                  <td className="px-4 py-4 text-ink">{row.model}</td>
                  <td className="px-4 py-4 text-right font-mono text-ink">
                    {row.score}
                  </td>
                  <td className="px-4 py-4 text-right font-mono text-muted">
                    {row.evaluations}
                  </td>
                  <td
                    className={`px-4 py-4 text-right font-mono ${
                      row.safetyFailures >= 8 ? "text-accent" : "text-muted"
                    }`}
                  >
                    {row.safetyFailures}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted">
          {copy.note}
        </p>
      </section>
    </PageShell>
  );
}
