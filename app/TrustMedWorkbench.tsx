"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import scenarios from "@/data/scenarios.json";
import leaderboard from "@/data/leaderboard.json";
import type { LeaderboardData, Scenario } from "@/types";

const scenarioData = scenarios as Scenario[];
const leaderboardData = leaderboard as LeaderboardData;

type SectionId = "about" | "battle" | "map" | "leaderboard" | "search";

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

const NAV_ITEMS: { id: SectionId; label: string; Icon: () => React.ReactElement }[] = [
  { id: "about",       label: "About Us",    Icon: IconInfo     },
  { id: "battle",      label: "Battle Mode", Icon: IconSwords   },
  { id: "map",         label: "Clinical Map", Icon: IconMap     },
  { id: "leaderboard", label: "Leaderboard", Icon: IconBarChart },
  { id: "search",      label: "Search",      Icon: IconSearch   },
];

const COLLABORATION_SITES = [
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

const WORLD_REGIONS = [
  {
    name: "North America",
    path: "M12 18 L17 11 L27 8 L38 11 L43 18 L39 27 L32 30 L27 36 L20 35 L13 29 L7 25 Z"
  },
  {
    name: "South America",
    path: "M31 35 L38 39 L40 47 L36 55 L31 52 L28 44 L27 38 Z"
  },
  {
    name: "Greenland",
    path: "M31 3 L39 2 L46 6 L43 11 L34 11 L28 7 Z"
  },
  {
    name: "Europe",
    path: "M47 14 L55 10 L62 14 L61 20 L54 22 L47 20 Z"
  },
  {
    name: "Africa",
    path: "M51 22 L62 22 L69 31 L65 45 L57 49 L50 40 L48 29 Z"
  },
  {
    name: "Asia",
    path: "M61 12 L76 8 L94 16 L98 27 L90 35 L78 33 L68 26 L60 20 Z"
  },
  {
    name: "Australia",
    path: "M80 39 L90 38 L96 44 L92 50 L82 50 L77 45 Z"
  },
  {
    name: "Japan",
    path: "M89 24 L91 25 L92 28 L90 31 L88 28 Z"
  },
  {
    name: "United Kingdom",
    path: "M48 12 L50 11 L51 15 L49 16 Z"
  }
];

// ── Helpers ────────────────────────────────────────────────────────────────

function difficultyLabel(scenario: Scenario) {
  if (scenario.language === "中文") {
    return scenario.difficulty === "High-Stakes" ? "高风险" : "常规场景";
  }
  return scenario.difficulty;
}

// ── Root component ─────────────────────────────────────────────────────────

export function TrustMedWorkbench() {
  const [activeSection, setActiveSection] = useState<SectionId>("battle");
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [showRubric, setShowRubric] = useState(false);

  const activeScenario = scenarioData[activeScenarioIndex];
  const topRows = useMemo(() => leaderboardData.highStakes.slice(0, 4), []);
  const activeNav = NAV_ITEMS.find((n) => n.id === activeSection)!;

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
          {NAV_ITEMS.map(({ id, label, Icon }) => (
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
          ))}
        </nav>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 flex-shrink-0 items-center gap-2 border-b border-line px-6">
          <span className="font-display text-xl text-primary">TRUST-Med</span>
          <span className="font-mono text-xs text-muted">/</span>
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
            {activeNav.label}
          </span>
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

// ── Clinical Map panel ─────────────────────────────────────────────────────

function ClinicalMapPanel() {
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
          Clinical Map
        </p>
        <h2 className="mt-2 font-display text-4xl leading-tight text-primary">
          A living map of participating clinicians
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          When clinicians join TRUST-Med, their institution or region can be
          highlighted on this local collaboration map. No third-party visitor
          script is loaded; the demo uses static, consent-oriented site data.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="border border-line bg-paper p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <h3 className="font-display text-2xl text-primary">
                TRUST-Med collaboration footprint
              </h3>
              <p className="mt-1 text-sm text-muted">
                Local world map rendered from static project data.
              </p>
            </div>
            <span className="border border-line bg-background px-3 py-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
              No third-party scripts
            </span>
          </div>

          <LocalClinicalMap />
        </div>

        <aside className="space-y-4">
          <div className="grid grid-cols-3 border border-line bg-paper">
            {[
              ["Sites", COLLABORATION_SITES.length],
              ["Clinicians", totalClinicians],
              ["Countries", 2]
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
              Map source
            </p>
            <h3 className="mt-2 font-display text-2xl text-primary">
              Local clinical atlas
            </h3>
            <p className="mt-3 leading-7 text-muted">
              The map is rendered inside the app with static SVG regions and
              site markers projected from latitude and longitude. It does not
              send visitor or clinician data to an external mapping service.
            </p>
          </div>

          <div className="border border-line bg-paper p-4">
            <h3 className="font-display text-2xl text-primary">
              Participation signal
            </h3>
            <p className="mt-3 leading-7 text-muted">
              The goal is social proof for collaborators: after a physician or
              site agrees to participate, their cohort can be represented on the
              map as part of a growing US-China evaluation network.
            </p>
          </div>

          <div className="border border-line bg-wash p-4">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
              Current demo balance
            </p>
            <div className="mt-4 space-y-3">
              <MapBalance label="United States" value={usClinicians} total={totalClinicians} />
              <MapBalance label="China" value={chinaClinicians} total={totalClinicians} />
            </div>
          </div>

          <div className="border border-line bg-paper p-4">
            <h3 className="font-display text-2xl text-primary">
              Highlighted sites
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

function LocalClinicalMap() {
  const baltimore = projectSite(
    COLLABORATION_SITES.find((site) => site.city === "Baltimore")!
  );
  const nanjing = projectSite(
    COLLABORATION_SITES.find((site) => site.city === "Nanjing")!
  );

  return (
    <div className="relative mt-5 overflow-hidden border border-line bg-[#F7F3EA]">
      <svg
        viewBox="0 0 100 56"
        role="img"
        aria-label="Local world map showing TRUST-Med clinical collaboration sites"
        className="h-[440px] w-full"
      >
        <rect width="100" height="56" fill="#F7F3EA" />
        {[20, 40, 60, 80].map((x) => (
          <line
            key={`longitude-${x}`}
            x1={x}
            y1="3"
            x2={x}
            y2="53"
            stroke="#E5E0D5"
            strokeWidth="0.16"
          />
        ))}
        {[14, 28, 42].map((y) => (
          <line
            key={`latitude-${y}`}
            x1="3"
            y1={y}
            x2="97"
            y2={y}
            stroke="#E5E0D5"
            strokeWidth="0.16"
          />
        ))}
        <path
          d="M2 28 C16 22 28 22 41 27 S63 34 78 27 S91 22 98 26"
          fill="none"
          stroke="#E5E0D5"
          strokeWidth="0.35"
        />
        {WORLD_REGIONS.map((region) => (
          <path
            key={region.name}
            d={region.path}
            fill="#E8E1D2"
            stroke="#D5CBB8"
            strokeLinejoin="round"
            strokeWidth="0.38"
          />
        ))}
        <path
          d={`M${baltimore.x} ${baltimore.y} C43 6 63 7 ${nanjing.x} ${nanjing.y}`}
          fill="none"
          stroke="#A6192E"
          strokeDasharray="1.4 1.2"
          strokeLinecap="round"
          strokeWidth="0.75"
        />

        {COLLABORATION_SITES.map((site) => {
          const point = projectSite(site);
          const isCoreSite = site.role.includes("Research");

          return (
            <g key={`${site.city}-${site.institution}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r={Math.max(1.6, Math.min(3.2, site.clinicians / 6))}
                fill={isCoreSite ? "#A6192E" : "#002D72"}
                opacity="0.18"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="0.85"
                fill={isCoreSite ? "#A6192E" : "#002D72"}
              />
              <text
                x={point.x + 1.4}
                y={point.y - 1}
                fill="#5A5A5A"
                fontFamily="monospace"
                fontSize="1.8"
              >
                {site.city}
              </text>
            </g>
          );
        })}

        <text x="12" y="13" fill="#5A5A5A" fontSize="2.2" fontFamily="monospace">
          United States
        </text>
        <text x="76" y="13" fill="#5A5A5A" fontSize="2.2" fontFamily="monospace">
          China
        </text>
        <text x="43" y="17" fill="#A6192E" fontSize="2" fontFamily="monospace">
          JHU ⇄ NJU
        </text>
      </svg>
      <div className="border-t border-line bg-background/90 px-4 py-3">
        <p className="text-sm leading-6 text-muted">
          Static demo map. No IP address, browser fingerprint, or visit event is
          sent to a third-party map service.
        </p>
      </div>
    </div>
  );
}

function projectSite(site: { latitude: number; longitude: number }) {
  return {
    x: ((site.longitude + 180) / 360) * 100,
    y: ((90 - site.latitude) / 180) * 56
  };
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
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
              Battle Mode
            </p>
            <h2 className="mt-2 font-display text-4xl leading-tight text-primary">
              Review one clinical case at a time
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onMoveScenario(-1)}
              className="border border-primary px-4 py-2 text-sm text-primary hover:bg-primary hover:text-white"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => onMoveScenario(1)}
              className="border border-primary px-4 py-2 text-sm text-primary hover:bg-primary hover:text-white"
            >
              Next
            </button>
          </div>
        </div>

        <article className="border border-line bg-paper">
          <div className="border-b border-line bg-wash px-5 py-4">
            <div className="flex flex-wrap gap-2">
              <span className="border border-line bg-background px-3 py-1 font-mono text-xs text-muted">
                {activeScenario.category}
              </span>
              <span className="border border-line bg-background px-3 py-1 font-mono text-xs text-muted">
                {activeScenario.language}
              </span>
              <span
                className={`border px-3 py-1 font-mono text-xs ${
                  activeScenario.difficulty === "High-Stakes"
                    ? "border-accent text-accent"
                    : "border-line text-muted"
                }`}
              >
                {difficultyLabel(activeScenario)}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted">
              Card {activeScenarioIndex + 1} of {scenarioData.length}
            </p>
            <h3 className="mt-3 max-w-4xl font-display text-4xl leading-tight text-primary">
              {activeScenario.title}
            </h3>
            <p className="mt-6 max-w-4xl text-lg leading-8 text-ink">
              {activeScenario.vignette}
            </p>
            <div className="mt-6 border-l-2 border-accent pl-5">
              <p className="font-display text-2xl leading-9 text-ink">
                {activeScenario.query}
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={onToggleRubric}
                className="border border-primary bg-background px-4 py-3 text-sm text-primary hover:bg-primary hover:text-white"
              >
                {showRubric ? "Hide rubric" : "Preview rubric"}
              </button>
              <Link
                href={`/evaluate/${activeScenario.id}`}
                className="border border-accent bg-accent px-4 py-3 text-center text-sm text-white hover:bg-background hover:text-accent"
              >
                Start pairwise review
              </Link>
              <Link
                href={`/results/${activeScenario.id}`}
                className="border border-line bg-background px-4 py-3 text-center text-sm text-muted hover:border-primary hover:text-primary"
              >
                View mock result
              </Link>
            </div>
          </div>
        </article>

        {showRubric && (
          <section className="mt-5 border border-line bg-paper p-5">
            <h3 className="font-display text-2xl text-primary">Rubric preview</h3>
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
                    <p className="leading-6 text-ink">{item.criterion}</p>
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
                      Safety-critical
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
          <h3 className="font-display text-2xl text-primary">Case library</h3>
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
                <span className="block text-sm leading-5">{scenario.title}</span>
                <span
                  className={`mt-2 block font-mono text-[11px] uppercase tracking-[0.12em] ${
                    index === activeScenarioIndex ? "text-white/70" : "text-muted"
                  }`}
                >
                  {scenario.language} · {difficultyLabel(scenario)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="border border-line bg-wash p-4">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            Evaluation flow
          </p>
          <ol className="mt-3 space-y-3 text-sm leading-6 text-muted">
            <li>1. Select a case from the library.</li>
            <li>2. Review the vignette and rubric criteria.</li>
            <li>3. Compare two anonymized model responses.</li>
            <li>4. Evidence feeds the safety-aware leaderboard.</li>
          </ol>
        </div>
      </aside>
    </div>
  );
}

// ── Leaderboard panel ──────────────────────────────────────────────────────

function LeaderboardPanel({ rows }: { rows: LeaderboardData["highStakes"] }) {
  return (
    <section>
      <div className="mb-5 border-b border-line pb-5">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          Leaderboard
        </p>
        <h2 className="mt-2 font-display text-4xl leading-tight text-primary">
          Mock high-stakes ranking
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Placeholder data showing where TRUST-Med will surface aggregate
          preference and safety failure counts after live evaluations begin.
        </p>
      </div>

      <div className="overflow-x-auto border border-line bg-paper">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-line bg-wash text-left font-mono text-xs uppercase tracking-[0.14em] text-muted">
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">Model</th>
              <th className="px-4 py-3 text-right font-medium">BT Score</th>
              <th className="px-4 py-3 text-right font-medium">Evaluations</th>
              <th className="px-4 py-3 text-right font-medium">Safety Failures</th>
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
          Open full leaderboard
        </Link>
      </div>
    </section>
  );
}

// ── About Us panel ─────────────────────────────────────────────────────────

function AboutPanel() {
  return (
    <section>
      <div className="mb-5 border-b border-line pb-5">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">About</p>
        <h2 className="mt-2 font-display text-4xl leading-tight text-primary">
          TRUST-Med
        </h2>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
          Translational Real-world User-grounded Safety Testing for Medical AI
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        {([
          ["Clinician-as-judge", "Real physicians evaluate model behavior. The system does not outsource clinical judgment to another LLM."],
          ["Cross-jurisdictional", "US and Chinese clinical norms are treated as explicit comparison contexts, not noise to average away."],
          ["Rubric-augmented pairwise", "Each case has safety and quality criteria that clinicians complete before choosing between two model outputs."],
        ] as [string, string][]).map(([title, body]) => (
          <article key={title} className="border border-line bg-paper p-5">
            <h3 className="font-display text-2xl text-primary">{title}</h3>
            <p className="mt-3 leading-7 text-muted">{body}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="border border-line bg-paper p-6">
          <h3 className="font-display text-2xl text-primary">Affiliation</h3>
          <p className="mt-3 leading-7 text-muted">
            Johns Hopkins University — Systems Engineering
          </p>
          <p className="mt-1 leading-7 text-muted">
            Nanjing University — Computer Science
          </p>
        </div>

        <div className="border border-line bg-paper p-6">
          <h3 className="font-display text-2xl text-primary">Positioning</h3>
          <p className="mt-3 leading-7 text-muted">
            Where HealthBench uses GPT-4 as judge and MedArena uses a single
            preference vote, TRUST-Med combines clinician-written rubrics with
            pairwise preference across two clinical jurisdictions.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <Link
          href="/about"
          className="inline-flex border border-primary bg-background px-5 py-3 text-sm text-primary hover:bg-primary hover:text-white"
        >
          Read full research context →
        </Link>
      </div>
    </section>
  );
}

// ── Search placeholder ─────────────────────────────────────────────────────

function SearchPlaceholder() {
  return (
    <section className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-line bg-wash text-muted">
        <IconSearch />
      </div>
      <h2 className="font-display text-3xl text-primary">Search</h2>
      <p className="mt-3 max-w-sm leading-7 text-muted">
        Search across clinical scenarios, rubric criteria, and evaluation
        results. Coming soon.
      </p>
    </section>
  );
}
