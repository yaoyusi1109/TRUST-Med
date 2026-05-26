# TRUST-Med

Translational Real-world User-grounded Safety Testing for Medical AI.

## Live demo

Vercel link placeholder: `https://trust-med-demo.vercel.app`

## Status

Concept / Demo. Not for clinical use.

## Description

TRUST-Med is a clinician-led evaluation platform for medical LLMs, developed as a research demo for a Systems Engineering PhD project at Johns Hopkins in collaboration with Nanjing University. The demo shows how physicians can evaluate two anonymized model responses using a scenario-specific rubric before making a pairwise preference choice. It emphasizes clinician-as-judge evaluation, cross-jurisdictional comparison across US and Chinese clinical norms, and safety-aware aggregation. All scenario data and results in this repository are illustrative and simulated.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Tech stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Static JSON data in `/data`
- React `useState` and `useReducer` for local demo state
- Vercel-compatible static deployment

## Project structure

```text
app/
  about/page.tsx
  evaluate/page.tsx
  evaluate/[scenarioId]/page.tsx
  evaluate/[scenarioId]/EvaluationForm.tsx
  leaderboard/page.tsx
  leaderboard/LeaderboardTable.tsx
  results/[scenarioId]/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  ButtonLink.tsx
  PageShell.tsx
data/
  leaderboard.json
  scenarios.json
types.ts
```

## References

This project builds on and is informed by the following work:

### Evaluation frameworks for medical AI

- Arora, R.K. et al. (2025). **HealthBench: Evaluating Large Language Models Towards Improved Human Health.** OpenAI. arXiv:2505.08775. https://arxiv.org/abs/2505.08775
- **HealthBench Professional** (2026). OpenAI. https://cdn.openai.com/dd128428-0184-4e25-b155-3a7686c7d744/HealthBench-Professional.pdf

### Clinician preference platforms

- **MedArena**: Pairwise clinician preference evaluation of medical LLMs. Stanford University and collaborating medical centers.

### Meta-analyses of medical LLM benchmarks

- **MedCheck** (2025). A systematic framework for evaluating medical LLM benchmarks. arXiv:2508.04325.

### Related general-purpose evaluation

- Chiang, W.-L. et al. (2024). **Chatbot Arena: An Open Platform for Evaluating LLMs by Human Preference.** LMSYS Org.
- Dubois, Y. et al. (2024). **AlpacaEval: An Automatic Evaluator of Instruction-Following Models.** Stanford.

### Clinical AI deployment landscape

- Reviews on barriers to clinical LLM adoption, including workflow integration, regulatory pathway, and safety considerations.

## Contact / affiliation

Johns Hopkins University, Systems Engineering, and Nanjing University, Computer Science.

Contact placeholder: `[your-email@jhu.edu]`
