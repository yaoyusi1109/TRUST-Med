"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { ClinicalEvidencePanel } from "@/components/ClinicalEvidencePanel";
import { LanguageToggle, useLanguage } from "@/components/LanguageProvider";
import scenarios from "@/data/scenarios.json";
import leaderboard from "@/data/leaderboard.json";
import type { LeaderboardData, Scenario } from "@/types";
import {
  difficultyLabel,
  rubricCriterion,
  scenarioCategory,
  scenarioModality,
  scenarioQuery,
  scenarioTitle,
  scenarioVignette,
  translatedEvidence,
  workbenchCopy
} from "@/lib/i18n";

const scenarioData = scenarios as Scenario[];
const leaderboardData = leaderboard as LeaderboardData;

type SectionId = "about" | "battle" | "map" | "leaderboard" | "search";

type CollaborationSite = {
  city: string;
  institution: string;
  country: "United States" | "China";
  clinicians: number;
  latitude: number;
  longitude: number;
  role: string;
};

const LeafletClinicalMap = dynamic(
  () =>
    import("@/components/LeafletClinicalMap").then(
      (module) => module.LeafletClinicalMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[440px] items-center justify-center border border-line bg-[#F7F3EA] text-sm text-muted">
        Loading clinical atlas...
      </div>
    )
  }
);

// ── Icons ──────────────────────────────────────────────────────────────────

function IconInfo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function IconSwords() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
      <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
      <line x1="5" y1="14" x2="9" y2="18" />
      <line x1="7" y1="17" x2="3" y2="21" />
    </svg>
  );
}

function IconBarChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ── Nav config ─────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: SectionId; Icon: () => React.ReactElement }[] = [
  { id: "about", Icon: IconInfo },
  { id: "battle", Icon: IconSwords },
  { id: "map", Icon: IconMap },
  { id: "leaderboard", Icon: IconBarChart },
  { id: "search", Icon: IconSearch },
];

const COLLABORATION_SITES: CollaborationSite[] = [
  {
    city: "Baltimore",
    institution: "Johns Hopkins Medicine",
    country: "United States",
    clinicians: 18,
    latitude: 39.29,
    longitude: -76.61,
    role: "Research lead"
  },
  {
    city: "Boston",
    institution: "Academic medical center",
    country: "United States",
    clinicians: 6,
    latitude: 42.36,
    longitude: -71.06,
    role: "Prospective collaborator"
  },
  {
    city: "San Francisco",
    institution: "Clinical AI safety group",
    country: "United States",
    clinicians: 5,
    latitude: 37.77,
    longitude: -122.42,
    role: "Prospective collaborator"
  },
  {
    city: "Nanjing",
    institution: "Nanjing University",
    country: "China",
    clinicians: 21,
    latitude: 32.06,
    longitude: 118.8,
    role: "Research partner"
  },
  {
    city: "Shanghai",
    institution: "Tertiary hospital network",
    country: "China",
    clinicians: 9,
    latitude: 31.23,
    longitude: 121.47,
    role: "Prospective collaborator"
  },
  {
    city: "Beijing",
    institution: "Clinical informatics group",
    country: "China",
    clinicians: 7,
    latitude: 39.9,
    longitude: 116.4,
    role: "Prospective collaborator"
  }
];

// ── Root component ─────────────────────────────────────────────────────────

export function TrustMedWorkbench() {
  const { language } = useLanguage();
  const copy = workbenchCopy[language];
  const [activeSection, setActiveSection] = useState<SectionId>("battle");
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [showRubric, setShowRubric] = useState(false);

  const activeScenario = scenarioData[activeScenarioIndex];
  const topRows = useMemo(() => leaderboardData.highStakes.slice(0, 4), []);
  const activeNav = NAV_ITEMS.find((n) => n.id === activeSection)!;
  const activeNavLabel = copy.nav[activeNav.id];

  function chooseScenario(index: number) {
    setActiveScenarioIndex(index);
    setShowRubric(false);
  }

  function moveScenario(direction: 1 | -1) {
    const next = (activeScenarioIndex + direction + scenarioData.length) % scenarioData.length;
    chooseScenario(next);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Sidebar ── */}
      <aside className="flex w-14 flex-shrink-0 flex-col border-r border-line bg-wash">
        {/* Logo mark */}
        <div className="flex h-14 flex-shrink-0 items-center justify-center border-b border-line">
          <span className="select-none font-display text-sm font-bold text-primary">TM</span>
        </div>

        {/* Nav icons */}
        <nav className="flex flex-1 flex-col items-center gap-1 py-3" aria-label="Main navigation">
          {NAV_ITEMS.map(({ id, Icon }) => {
            const label = copy.nav[id];
            return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              title={label}
              aria-label={label}
              className={`group relative flex h-10 w-10 items-center justify-center rounded transition-colors ${
                activeSection === id
                  ? "bg-primary text-white"
                  : "text-muted hover:bg-line hover:text-primary"
              }`}
            >
              <Icon />
              {/* Tooltip */}
              <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded bg-ink px-2 py-1 font-mono text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {label}
              </span>
            </button>
          );})}
        </nav>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 flex-shrink-0 items-center gap-2 border-b border-line px-6">
          <span className="font-display text-xl text-primary">TRUST-Med</span>
          <span className="font-mono text-xs text-muted">/</span>
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
            {activeNavLabel}
          </span>
          <div className="ml-auto">
            <LanguageToggle compact />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto px-6 py-6 lg:px-8">
          {activeSection === "battle" && (
            <QuestionBankPanel
              activeScenario={activeScenario}
              activeScenarioIndex={activeScenarioIndex}
              showRubric={showRubric}
              onChooseScenario={chooseScenario}
              onMoveScenario={moveScenario}
              onToggleRubric={() => setShowRubric((v) => !v)}
            />
          )}
          {activeSection === "leaderboard" && <LeaderboardPanel rows={topRows} />}
          {activeSection === "map"         && <ClinicalMapPanel />}
          {activeSection === "about"       && <AboutPanel />}
          {activeSection === "search"      && <SearchPlaceholder />}
        </main>
      </div>
    </div>
  );
}

// ── Clinical Atlas panel ───────────────────────────────────────────────────

function ClinicalMapPanel() {
  const { language } = useLanguage();
  const copy = workbenchCopy[language].map;
  const totalClinicians = COLLABORATION_SITES.reduce(
    (sum, site) => sum + site.clinicians,
    0
  );
  const usClinicians = COLLABORATION_SITES.filter(
    (site) => site.country === "United States"
  ).reduce((sum, site) => sum + site.clinicians, 0);
  const chinaClinicians = COLLABORATION_SITES.filter(
    (site) => site.country === "China"
  ).reduce((sum, site) => sum + site.clinicians, 0);

  return (
    <section>
      <div className="mb-5 border-b border-line pb-5">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          {copy.eyebrow}
        </p>
        <h2 className="mt-2 font-display text-4xl leading-tight text-primary">
          {copy.title}
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          {copy.intro}
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="border border-line bg-paper p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <h3 className="font-display text-2xl text-primary">
                {copy.atlasTitle}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {copy.atlasIntro}
              </p>
            </div>
            <span className="border border-line bg-background px-3 py-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
              {copy.badge}
            </span>
          </div>

          <div className="relative mt-5 overflow-hidden border border-line bg-[#F7F3EA]">
            <LeafletClinicalMap sites={COLLABORATION_SITES} />
            <div className="border-t border-line bg-background/90 px-4 py-3">
              <p className="text-sm leading-6 text-muted">
                {copy.privacy}
              </p>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="grid grid-cols-3 border border-line bg-paper">
            {[
              [copy.stats[0], COLLABORATION_SITES.length],
              [copy.stats[1], totalClinicians],
              [copy.stats[2], 2]
            ].map(([label, value]) => (
              <div key={label} className="border-r border-line p-4 last:border-r-0">
                <p className="font-display text-3xl text-primary">{value}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="border border-line bg-paper p-4">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
              {copy.source}
            </p>
            <h3 className="mt-2 font-display text-2xl text-primary">
              {copy.sourceTitle}
            </h3>
            <p className="mt-3 leading-7 text-muted">
              {copy.sourceBody}
            </p>
          </div>

          <div className="border border-line bg-paper p-4">
            <h3 className="font-display text-2xl text-primary">
              {copy.signal}
            </h3>
            <p className="mt-3 leading-7 text-muted">
              {copy.signalBody}
            </p>
          </div>

          <div className="border border-line bg-wash p-4">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
              {copy.balance}
            </p>
            <div className="mt-4 space-y-3">
              <MapBalance label={language === "zh" ? "美国" : "United States"} value={usClinicians} total={totalClinicians} />
              <MapBalance label={language === "zh" ? "中国" : "China"} value={chinaClinicians} total={totalClinicians} />
            </div>
          </div>

          <div className="border border-line bg-paper p-4">
            <h3 className="font-display text-2xl text-primary">
              {copy.sites}
            </h3>
            <div className="mt-4 space-y-3">
              {COLLABORATION_SITES.map((site) => (
                <div key={`${site.city}-list`} className="border-t border-line pt-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {site.city}
                      </p>
                      <p className="mt-1 text-sm leading-5 text-muted">
                        {site.institution}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-accent">
                      {site.clinicians}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    {site.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function MapBalance({
  label,
  value,
  total
}: {
  label: string;
  value: number;
  total: number;
}) {
  const pct = Math.round((value / total) * 100);

  return (
    <div>
      <div className="flex items-center justify-between font-mono text-xs text-muted">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="mt-2 h-2 border border-line bg-background">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Battle Mode panel ──────────────────────────────────────────────────────

function QuestionBankPanel({
  activeScenario,
  activeScenarioIndex,
  showRubric,
  onChooseScenario,
  onMoveScenario,
  onToggleRubric,
}: {
  activeScenario: Scenario;
  activeScenarioIndex: number;
  showRubric: boolean;
  onChooseScenario: (index: number) => void;
  onMoveScenario: (direction: 1 | -1) => void;
  onToggleRubric: () => void;
}) {
  const { language } = useLanguage();
  const copy = workbenchCopy[language].battle;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
              {copy.eyebrow}
            </p>
            <h2 className="mt-2 font-display text-4xl leading-tight text-primary">
              {copy.title}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onMoveScenario(-1)}
              className="border border-primary px-4 py-2 text-sm text-primary hover:bg-primary hover:text-white"
            >
              {copy.previous}
            </button>
            <button
              type="button"
              onClick={() => onMoveScenario(1)}
              className="border border-primary px-4 py-2 text-sm text-primary hover:bg-primary hover:text-white"
            >
              {copy.next}
            </button>
          </div>
        </div>

        <article className="border border-line bg-paper">
          <div className="border-b border-line bg-wash px-5 py-4">
            <div className="flex flex-wrap gap-2">
              <span className="border border-line bg-background px-3 py-1 font-mono text-xs text-muted">
                {scenarioCategory(activeScenario, language)}
              </span>
              <span className="border border-line bg-background px-3 py-1 font-mono text-xs text-muted">
                {activeScenario.language}
              </span>
              {activeScenario.modality ? (
                <span className="border border-primary bg-background px-3 py-1 font-mono text-xs text-primary">
                  {scenarioModality(activeScenario, language)}
                </span>
              ) : null}
              <span
                className={`border px-3 py-1 font-mono text-xs ${
                  activeScenario.difficulty === "High-Stakes"
                    ? "border-accent text-accent"
                    : "border-line text-muted"
                }`}
              >
                {difficultyLabel(activeScenario.difficulty, language)}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
              {language === "zh"
                ? `${copy.card}${activeScenarioIndex + 1}${copy.of}${scenarioData.length}题`
                : `${copy.card} ${activeScenarioIndex + 1} ${copy.of} ${scenarioData.length}`}
            </p>
            <h3 className="mt-3 max-w-4xl font-display text-4xl leading-tight text-primary">
              {scenarioTitle(activeScenario, language)}
            </h3>
            <p className="mt-6 max-w-4xl text-lg leading-8 text-ink">
              {scenarioVignette(activeScenario, language)}
            </p>
            <ClinicalEvidencePanel
              evidence={translatedEvidence(activeScenario, language)}
              language={language}
            />
            <div className="mt-6 border-l-2 border-accent pl-5">
              <p className="font-display text-2xl leading-9 text-ink">
                {scenarioQuery(activeScenario, language)}
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={onToggleRubric}
                className="border border-primary bg-background px-4 py-3 text-sm text-primary hover:bg-primary hover:text-white"
              >
                {showRubric ? copy.hideRubric : copy.previewRubric}
              </button>
              <Link
                href={`/evaluate/${activeScenario.id}`}
                className="border border-accent bg-accent px-4 py-3 text-center text-sm text-white hover:bg-background hover:text-accent"
              >
                {copy.start}
              </Link>
              <Link
                href={`/results/${activeScenario.id}`}
                className="border border-line bg-background px-4 py-3 text-center text-sm text-muted hover:border-primary hover:text-primary"
              >
                {copy.result}
              </Link>
            </div>
          </div>
        </article>

        {showRubric && (
          <section className="mt-5 border border-line bg-paper p-5">
            <h3 className="font-display text-2xl text-primary">{copy.rubricPreview}</h3>
            <div className="mt-4 grid gap-3">
              {activeScenario.rubric.map((item) => (
                <div
                  key={item.id}
                  className={`border p-4 ${
                    item.isSafetyCritical
                      ? "border-red-200 bg-red-50"
                      : "border-line bg-background"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="leading-6 text-ink">
                      {rubricCriterion(activeScenario, item.id, item.criterion, language)}
                    </p>
                    <span
                      className={`font-mono text-sm ${
                        item.weight < 0 ? "text-accent" : "text-muted"
                      }`}
                    >
                      {item.weight > 0 ? `+${item.weight}` : item.weight}
                    </span>
                  </div>
                  {item.isSafetyCritical && (
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
                      {copy.safetyCritical}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </section>

      {/* Case library sidebar */}
      <aside className="space-y-4">
        <div className="border border-line bg-paper p-4">
          <h3 className="font-display text-2xl text-primary">{copy.library}</h3>
          <div className="mt-4 space-y-2">
            {scenarioData.map((scenario, index) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => onChooseScenario(index)}
                className={`w-full border p-3 text-left transition-colors ${
                  index === activeScenarioIndex
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-background text-ink hover:bg-wash"
                }`}
              >
                <span className="block text-sm leading-5">
                  {scenarioTitle(scenario, language)}
                </span>
                <span
                  className={`mt-2 block font-mono text-[11px] uppercase tracking-[0.12em] ${
                    index === activeScenarioIndex ? "text-white/70" : "text-muted"
                  }`}
                >
                  {scenario.language} · {scenarioModality(scenario, language)} · {difficultyLabel(scenario.difficulty, language)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="border border-line bg-wash p-4">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            {copy.flow}
          </p>
          <ol className="mt-3 space-y-3 text-sm leading-6 text-muted">
            {copy.flowSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}

// ── Leaderboard panel ──────────────────────────────────────────────────────

function LeaderboardPanel({ rows }: { rows: LeaderboardData["highStakes"] }) {
  const { language } = useLanguage();
  const copy = workbenchCopy[language].leaderboard;

  return (
    <section>
      <div className="mb-5 border-b border-line pb-5">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          {copy.eyebrow}
        </p>
        <h2 className="mt-2 font-display text-4xl leading-tight text-primary">
          {copy.title}
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          {copy.intro}
        </p>
      </div>

      <div className="overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-line bg-wash text-left font-mono text-xs uppercase tracking-[0.14em] text-muted">
              <th className="px-4 py-3 font-medium">{copy.rank}</th>
              <th className="px-4 py-3 font-medium">{copy.model}</th>
              <th className="px-4 py-3 text-right font-medium">{copy.score}</th>
              <th className="px-4 py-3 text-right font-medium">{copy.evaluations}</th>
              <th className="px-4 py-3 text-right font-medium">{copy.failures}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.model} className="border-b border-line last:border-0">
                <td className="px-4 py-4 font-mono text-sm text-muted">{row.rank}</td>
                <td className="px-4 py-4 text-ink">{row.model}</td>
                <td className="px-4 py-4 text-right font-mono text-ink">{row.score}</td>
                <td className="px-4 py-4 text-right font-mono text-muted">{row.evaluations}</td>
                <td className="px-4 py-4 text-right font-mono text-accent">{row.safetyFailures}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5">
        <Link
          href="/leaderboard"
          className="inline-flex border border-primary bg-primary px-5 py-3 text-sm text-white hover:bg-background hover:text-primary"
        >
          {copy.open}
        </Link>
      </div>
    </section>
  );
}

// ── About Us panel ─────────────────────────────────────────────────────────

function AboutPanel() {
  const { language } = useLanguage();
  const copy = workbenchCopy[language].about;

  return (
    <section>
      <div className="mb-5 border-b border-line pb-5">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          {copy.eyebrow}
        </p>
        <h2 className="mt-2 font-display text-4xl leading-tight text-primary">
          TRUST-Med
        </h2>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
          {copy.acronym}
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {([
          ...copy.cards
        ] as readonly (readonly [string, string])[]).map(([title, body]) => (
          <article key={title} className="border border-line bg-paper p-5">
            <h3 className="font-display text-2xl text-primary">{title}</h3>
            <p className="mt-3 leading-7 text-muted">{body}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="border border-line bg-paper p-6">
          <h3 className="font-display text-2xl text-primary">{copy.affiliation}</h3>
          <p className="mt-3 leading-7 text-muted">
            Johns Hopkins University — Systems Engineering
          </p>
          <p className="mt-1 leading-7 text-muted">
            Nanjing University — Computer Science
          </p>
        </div>

        <div className="border border-line bg-paper p-6">
          <h3 className="font-display text-2xl text-primary">{copy.positioning}</h3>
          <p className="mt-3 leading-7 text-muted">
            {copy.positioningBody}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <Link
          href="/about"
          className="inline-flex border border-primary bg-background px-5 py-3 text-sm text-primary hover:bg-primary hover:text-white"
        >
          {copy.readMore}
        </Link>
      </div>
    </section>
  );
}

// ── Search placeholder ─────────────────────────────────────────────────────

function SearchPlaceholder() {
  const { language } = useLanguage();
  const copy = workbenchCopy[language].search;

  return (
    <section className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-line bg-wash text-muted">
        <IconSearch />
      </div>
      <h2 className="font-display text-3xl text-primary">{copy.title}</h2>
      <p className="mt-3 max-w-sm leading-7 text-muted">
        {copy.body}
      </p>
    </section>
  );
}
