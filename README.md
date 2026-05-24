# TRUST-Med

**T**ranslational **R**eal-world **U**ser-grounded **S**afety **T**esting for **M**edical AI

A clinician-led, safety-aware evaluation platform for medical AI — built as a collaboration between Johns Hopkins University and Nanjing University.

---

## Why the name?

Each word in TRUST carries weight:

| Word | Meaning |
|------|---------|
| **Translational** | Bridging the gap between benchmark performance and real clinical deployment — the core problem we address |
| **Real-world** | Evaluations are grounded in actual clinical queries from practicing physicians, not standardized exam questions |
| **User-grounded** | Clinicians are the evaluators, not crowdsourced annotators or automated metrics |
| **Safety** | Safety is treated as an explicit, first-class dimension — never collapsed into a single preference vote |
| **Testing** | Rigorous, reproducible evaluation methodology, not ad-hoc comparison |
| **Med** | Medical AI — with scope designed to extend beyond LLMs to multimodal and agentic clinical systems |

---

## What we're building

Medical AI systems now exceed passing thresholds on clinical licensing exams, yet large-scale clinical deployment remains elusive. The bottleneck is not model capability — it is the absence of trustworthy evaluation evidence that hospitals, regulators, and clinicians can rely on when making adoption decisions.

TRUST-Med addresses three research gaps:

1. **Benchmarks test the wrong thing.** Over 60% of real clinical queries involve treatment decisions, documentation, and patient communication — not the fact-recall questions that dominate existing benchmarks like MedQA and MMLU-Clinical.

2. **No cross-jurisdiction evidence.** All existing medical AI preference platforms are single-site and single-language. TRUST-Med brings together clinicians from JHU Medicine (US) and Nanjing University Medical School (China) to surface how the same model can rank differently under different clinical guidelines and practice norms.

3. **Safety is collapsed into a single vote.** Arena-style single-preference buttons aggregate safety, accuracy, and empathy into one undifferentiated signal. TRUST-Med decomposes evaluation into four explicit dimensions: **Safety**, **Clinical Accuracy**, **Empathy & Communication**, and **Guideline Adherence**.

### Key research contributions

- **RC-1** — Multi-dimensional safety preference aggregation via multi-objective Bradley-Terry estimation
- **RC-2** — Cross-jurisdiction validity framework for modeling systematic preference divergence between clinician cohorts
- **RC-3** — Federated evaluation architecture: independent per-site deployment with statistical-only data sharing, enabling HIPAA and PIPL compliance

---

## Demo

Open `index.html` directly in a browser, or serve locally:

```bash
python3 -m http.server 3737
```

Then visit `http://localhost:3737`.

The demo includes 5 bilingual clinical scenarios (Emergency Medicine · Endocrinology · Oncology · Clinical Pharmacy · Rheumatology), two anonymized model responses per scenario, a 4-dimension rating interface, and a mock Bradley-Terry leaderboard.

---

## Institutions

| | |
|---|---|
| **Johns Hopkins University** | Dept. of Systems Engineering · JHU Medicine |
| **Nanjing University** | Dept. of Computer Science · NJU Medical School |

---

*TRUST-Med is an academic research project. All data in the current demo is simulated for illustrative purposes only.*
