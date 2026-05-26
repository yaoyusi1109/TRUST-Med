"use client";

import { useState } from "react";
import leaderboard from "@/data/leaderboard.json";
import type { LeaderboardData } from "@/types";
import { PageShell } from "@/components/PageShell";

const leaderboardData = leaderboard as LeaderboardData;

export function LeaderboardTable() {
  const [track, setTrack] = useState<"routine" | "highStakes">("routine");
  const rows = leaderboardData[track];

  return (
    <PageShell
      eyebrow="Mock leaderboard"
      title="Safety-aware Bradley-Terry ranking"
      intro="The demo separates routine clinical tasks from high-stakes scenarios, because aggregate preference can hide safety-sensitive failure modes."
    >
      <section className="py-9">
        <div className="mb-6 flex border border-line bg-paper p-1">
          {[
            ["routine", "Routine Clinical"],
            ["highStakes", "High-Stakes"]
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
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 text-right font-medium">
                  Bradley-Terry Score
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  # Evaluations
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  Safety Failures
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
          Mock data for demonstration. Real evaluations launching Q3 2026.
        </p>
      </section>
    </PageShell>
  );
}
