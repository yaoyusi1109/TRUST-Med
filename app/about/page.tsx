import { PageShell } from "@/components/PageShell";

const references = [
  "Arora, R.K. et al. (2025). HealthBench: Evaluating Large Language Models Towards Improved Human Health. OpenAI. arXiv:2505.08775. https://arxiv.org/abs/2505.08775",
  "HealthBench Professional (2026). OpenAI. https://cdn.openai.com/dd128428-0184-4e25-b155-3a7686c7d744/HealthBench-Professional.pdf",
  "MedArena: Pairwise clinician preference evaluation of medical LLMs. Stanford University and collaborating medical centers.",
  "MedCheck (2025). A systematic framework for evaluating medical LLM benchmarks. arXiv:2508.04325.",
  "Chiang, W.-L. et al. (2024). Chatbot Arena: An Open Platform for Evaluating LLMs by Human Preference. LMSYS Org.",
  "Dubois, Y. et al. (2024). AlpacaEval: An Automatic Evaluator of Instruction-Following Models. Stanford.",
  "Reviews on barriers to clinical LLM adoption, including workflow integration, regulatory pathway, and safety considerations."
];

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About the research"
      title="Clinician-led evidence for medical AI safety"
      intro="TRUST-Med is a research demo for Translational Real-world User-grounded Safety Testing for Medical AI."
    >
      <section className="grid gap-10 py-10 md:grid-cols-[0.9fr_1.1fr]">
        <aside className="border border-line bg-paper p-6">
          <h2 className="font-display text-2xl text-primary">Affiliation</h2>
          <p className="mt-4 leading-7 text-muted">
            Johns Hopkins University, Systems Engineering
          </p>
          <p className="mt-2 leading-7 text-muted">
            Nanjing University, Computer Science
          </p>
          <p className="mt-6 font-mono text-sm text-accent">
            [your-email@jhu.edu]
          </p>
        </aside>

        <div className="space-y-8">
          <section>
            <h2 className="font-display text-3xl text-primary">
              Project motivation
            </h2>
            <div className="mt-4 space-y-4 leading-8 text-muted">
              <p>
                Medical LLM evaluation remains too distant from the decisions
                clinicians actually face. USMLE-style benchmarks and multiple
                choice exams measure useful knowledge, but they are decoupled
                from messy patient communication, incomplete information,
                triage urgency, medication safety, and local practice norms.
              </p>
              <p>
                Newer rubric-based work such as HealthBench improves the shape
                of evaluation, but it relies on GPT-4.1 as the judge rather
                than real clinicians. That design is scalable, yet it leaves
                open the question of whether clinical users agree with the
                scoring logic in high-stakes settings.
              </p>
              <p>
                Existing preference platforms also rarely separate clinical
                jurisdictions. TRUST-Med is designed to compare how physicians
                in US and Chinese settings evaluate the same model outputs
                under different guidelines, languages, medication availability,
                and institutional norms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-3xl text-primary">
              Method overview
            </h2>
            <p className="mt-4 leading-8 text-muted">
              Each evaluation starts with a clinical scenario and two
              anonymized model responses. The clinician completes a
              scenario-specific rubric with positive quality criteria and
              negative safety-failure criteria, then submits a pairwise
              preference. Aggregated results can support Bradley-Terry ranking,
              safety failure analysis, and cross-site comparison without using
              real patient data in this demo.
            </p>
          </section>

          <section>
            <h2 className="font-display text-3xl text-primary">References</h2>
            <ul className="mt-4 space-y-3 leading-7 text-muted">
              {references.map((reference) => (
                <li key={reference} className="border-t border-line pt-3">
                  {reference}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </PageShell>
  );
}
