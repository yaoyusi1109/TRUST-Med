# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Running the demo

No build step or package installation needed — everything is a single static file.

```bash
python3 -m http.server 3737
# then open http://localhost:3737
```

Or open `index.html` directly in a browser.

## Architecture

Everything lives in `index.html` — CSS, HTML, and JavaScript in one file. No external dependencies beyond Google Fonts (CDN).

**Data layer** (top of `<script>`):
- `SCENARIOS` — 5 clinical cases, each with parallel `en`/`cn` objects (`spec`, `title`, `vignette`, `a`/`b` model responses) plus metadata (`specClass`, `risk`, `pillsEn/Cn`, `focusEn/Cn`)
- `DIMENSIONS` — 5 evaluation dimensions (safety, accuracy, empathy, guideline adherence, uncertainty), each with `en`/`cn` `name`, `desc`, and `criteria[]`
- `LB_DATA` — 9 models with simulated Elo scores, CI bounds, win rates, and per-dimension scores (0–100)

**State**: `LANG` (`'en'`/`'cn'`), `ACTIVE_SC` (0–4), `LB_VIEW` (`'overall'`/`'dims'`)

**Key functions**:
- `setLang(l)` — switches language, re-renders dynamic sections, updates `[data-en]`/`[data-cn]` text
- `switchScenario(idx)` — populates vignette, model responses, pills, spec/risk tags
- `renderDims()` — builds 5-card rating grid with star inputs and expandable rubric `<details>`
- `renderLeaderboard()` — renders table in overall (Elo + CI bar) or by-dimension (colored cells) view
- `submitEval()` / `resetEval()` — toggle between rating panel and submission confirmation

**Bilingual pattern**: static elements carry `data-en`/`data-cn` attributes; dynamic content is re-rendered on language switch via `switchScenario`, `renderDims`, `renderLeaderboard`.

## Research context

**TRUST-Med** (Translational Real-world User-grounded Safety Testing for Medical AI) is Yusi Yao's JHU Systems Engineering PhD research project, in collaboration with Nanjing University (CS + Medical School).

**Core problem:** Medical LLMs score well on benchmarks but clinical adoption is blocked by three gaps:
1. Benchmarks test the wrong thing — even HealthBench (OpenAI, 2025) uses LLM-as-judge and synthetic dialogues; TRUST-Med uses real clinicians evaluating real queries
2. No cross-jurisdiction evidence — all existing platforms are single-site; same model performs differently under US vs. China clinical norms, guidelines, and drug availability
3. Safety collapsed into one vote — single preference button conflates accuracy, safety, empathy, and guideline adherence; MedCheck found safety/robustness dimensions are systematically underweighted

**Why adoption is still blocked broadly:** Medical LLMs are stuck between capability and trust. L2-style applications (drafting discharge summaries, inbox replies) are scaling; high-stakes clinical decision support has no clear deployment path. The missing piece is credible, cross-system, safety-aware evaluation evidence for hospitals, regulators, and payers.

**Three research contributions (RC-1/2/3):**
- **RC-1** — Multi-dimensional safety preference aggregation via multi-objective Bradley-Terry (5 axes: safety, accuracy, empathy, guideline adherence, uncertainty). HealthBench-inspired rubric design: each scenario has 5–8 scenario-specific criteria with positive/negative weights; safety-critical criteria are heavily penalized on failure
- **RC-2** — Cross-jurisdiction validity framework comparing US (JHU Medicine) vs. China (NJU Medical School) clinician cohorts. Uses "multi-site" framing (not "transnational") to avoid triggering HIPAA/PIPL compliance review prematurely
- **RC-3** — Federated evaluation architecture: independent per-site deployment, only aggregated stats shared — HIPAA + PIPL compliant by design. This is a research contribution, not just an engineering workaround

**SE PhD framing:** The contribution is evaluation methodology (measurement system design, multi-stakeholder requirements, federated architecture) — not building a better LLM. Keep this framing coherent when editing copy.

**Positioning vs. key competitors:**
- **HealthBench** (OpenAI, arXiv 2505.08775) — rubric-based, but LLM-as-judge, synthetic dialogues, no jurisdiction split. TRUST-Med is the clinician-as-judge, cross-jurisdiction complement, not a replacement
- **MedArena** (Stanford) — closest arena competitor, real clinicians, but single-jurisdiction, single preference vote
- **MedCheck** — benchmark quality audit framework, not an arena
- **Open Medical-LLM Leaderboard** (HuggingFace) — static MCQ-based

**Demo purpose:** Show potential JHU advisors and NJU clinical collaborators something tangible in under 5 seconds. All data is simulated.