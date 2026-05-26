# AGENTS.md

This repository is a Next.js 14 App Router demo for TRUST-Med.

## Running the demo

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Architecture

- `app/` contains route files for the five demo areas: landing, scenario selection, evaluation, results, leaderboard, and about.
- `data/scenarios.json` contains all clinical scenarios, model responses, rubrics, and mock aggregate results.
- `data/leaderboard.json` contains fabricated Bradley-Terry leaderboard tracks.
- `components/` contains small shared presentation components.
- `types.ts` contains shared TypeScript types.

No backend, database, authentication, real LLM calls, or external service dependency should be added. Demo state should remain local React state.

## Research context

TRUST-Med stands for Translational Real-world User-grounded Safety Testing for Medical AI. It is a research demo for a Systems Engineering PhD project at Johns Hopkins in collaboration with Nanjing University.

Core differentiators:

1. Clinician-as-judge: physicians evaluate model outputs directly.
2. Cross-jurisdictional: US and Chinese clinical norms are compared explicitly.
3. Rubric-augmented pairwise: clinicians complete scenario-specific criteria before choosing between anonymized model outputs.

All content is illustrative and not for clinical use.
