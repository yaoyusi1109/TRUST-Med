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
      title="Clinician-grounded evaluation for medical LLMs"
      intro="TRUST-Med (Translational Real-world User-grounded Safety Testing for Medical AI) is an interactive research platform for testing medical LLMs on the kinds of open-ended clinical questions physicians actually ask: uncertain, multi-step, context-dependent, and shaped by local standards of care."
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
              Why Current Benchmarks Fall Short
            </h2>
            <div className="mt-4 space-y-4 leading-8 text-muted">
              <p>
                Large language models are moving into clinician workflows,
                including decision support, medical education, documentation,
                translation, and patient communication. Yet many medical LLM
                evaluations still rely on static, templated benchmarks derived
                from multiple-choice exams such as MedQA, MedMCQA, and MMLU.
                These datasets are useful for measuring foundational knowledge,
                but they do not capture the open-ended, dynamic, and
                context-sensitive nature of real clinical practice.
              </p>
              <p>
                In practice, clinicians rarely ask only for a single factual
                answer. They ask about treatment selection under uncertainty,
                evolving diagnostic workups, patient-facing explanations,
                discharge documentation, guideline interpretation, and
                medication safety. A response can be factually plausible yet
                clinically unhelpful if it misses urgency, ignores local
                standards, communicates poorly, or fails to surface a safety
                constraint.
              </p>
              <p>
                Newer open-ended and rubric-based frameworks are an important
                step forward, but many still use LLM-as-judge evaluation or
                fixed task sets. That leaves two unresolved questions: whether
                automated scores match the preferences of practicing clinicians,
                and whether a benchmark built in one clinical system transfers
                cleanly to another. TRUST-Med is designed around those gaps.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-3xl text-primary">
              What TRUST-Med Measures
            </h2>
            <div className="mt-4 space-y-4 leading-8 text-muted">
              <p>
                TRUST-Med adapts arena-style head-to-head comparison for
                clinical medicine. A clinician reviews a realistic medical
                scenario, compares two anonymized model responses, and selects
                the response they would prefer in practice. The goal is not to
                reward exam-style correctness alone, but to measure clinical
                utility across reasoning quality, safety awareness, clarity,
                completeness, and appropriateness for the specific case.
              </p>
              <p>
                Unlike a simple preference vote, each TRUST-Med case includes a
                scenario-specific rubric that clinicians complete before making
                the final pairwise choice. Rubric items capture both positive
                quality criteria and explicit safety failures, allowing the
                study to distinguish clinical substance from presentation style,
                response length, or formatting polish.
              </p>
              <p>
                The platform is also cross-jurisdictional by design. The same
                evaluation logic can be applied across US and Chinese clinical
                contexts, in English and Chinese, so that differences in
                guidelines, formularies, documentation norms, and patient
                communication expectations become measurable signals rather
                than background noise. Aggregated evaluations can then support
                Bradley-Terry model ranking, safety-failure analysis, and
                subgroup comparison across sites.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-3xl text-primary">
              Research Positioning
            </h2>
            <div className="mt-4 space-y-4 leading-8 text-muted">
              <p>
                TRUST-Med builds on the insight behind Chatbot Arena and
                clinician preference platforms such as MedArena: model quality
                should be tested on user-generated, real-world questions rather
                than only on static answer keys. It extends that idea for
                medical safety testing by adding structured rubrics, explicit
                safety-critical criteria, and cross-site comparison between
                Johns Hopkins and Nanjing University collaborators.
              </p>
              <p>
                This demo is illustrative and does not collect clinical data.
                Its purpose is to make the proposed workflow concrete for
                collaborators: clinicians judge model outputs, rubrics capture
                clinically meaningful failure modes, and the resulting
                preference data can be analyzed as evidence about medical LLM
                utility rather than as a generic AI leaderboard.
              </p>
            </div>
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
