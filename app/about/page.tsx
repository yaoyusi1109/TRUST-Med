"use client";

import { PageShell } from "@/components/PageShell";
import { AffiliationLogos } from "@/components/AffiliationLogos";
import { LanguageToggle, useLanguage } from "@/components/LanguageProvider";

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
  const { language } = useLanguage();
  const copy =
    language === "zh"
      ? {
          eyebrow: "研究背景",
          title: "面向医学大模型的临床医生驱动测评",
          intro:
            "TRUST-Med（转化型真实世界用户驱动医学 AI 安全测评）是一个研究平台，旨在以医学大模型实际被使用的方式对其进行评测：开放式临床问题、执业医生直接评判，测评场景锚定于中美真实临床病例。",
          affiliation: "团队归属",
          sections: [
            {
              title: "真实病例，真实评判者",
              paragraphs: [
                "大多数医学 AI 测评建立在选择题考试基础上——MedQA、MedMCQA、MMLU。这些数据集可以衡量知识记忆，但无法反映医生实际工作的本质。TRUST-Med 从不同的起点出发：测评场景来源于真实世界病例，包括中美医学社区公开发布的临床讨论和病例记录。",
                "医生在实际工作中并不是从四个选项里挑答案。他们在不确定中提问、推理动态变化的病情演变、做出对真实患者有切实影响的决策。一个在选择题基准上表现亮眼的模型，在实际使用中仍可能遗漏紧急程度、陷入锚定偏差、或忽略安全约束。",
                "通过将测评场景锚定于真实病例，并让执业临床医生直接评判模型输出，TRUST-Med 衡量的是真正重要的东西：模型的回答是否能帮助医生更安全、更有效地完成工作。"
              ]
            },
            {
              title: "量表辅助的测评，用于驱动模型改进",
              paragraphs: [
                "基于偏好的测评框架——包括从 AlpacaEval 和 RLHF 式人类反馈流程移植而来的方法——能够判断哪个模型输出更受青睐，但通常无法解释为什么。一个模型可能因为回答更冗长、语气更自信或排版更整洁而赢得偏好投票，而非因为它展示了更好的临床推理。通用偏好信号对定向模型优化的指导价值也十分有限。",
                "TRUST-Med 采用量表辅助成对评估格式。在做出偏好判断之前，临床医生需要先完成一份场景专属量表：一套结构化评价标准，同时涵盖正向质量信号（回答是否正确识别紧急性？提供了合适的鉴别诊断？考虑了本地诊疗规范？）和明确的安全失败项——例如陷入既往诊断的锚定偏差、遗漏时间敏感的干预措施。",
                "这种设计产生的偏好数据具有可解释的结构。它能够区分临床实质与表达风格，识别具体失败模式而非只给出整体分数，所产生的数据理论上可以支持更有针对性的模型微调，而非笼统的偏好优化。"
              ]
            },
            {
              title: "中美作为互补的临床语境",
              paragraphs: [
                "跨国测评通常被设计为两条平行轨道，分别在各自的地区标准下评测模型。TRUST-Med 持有不同立场：中美两个临床体系被作为互补的测评语境，共同构建覆盖面更广、更具稳健性的评价环境。",
                "许多核心医学标准在国际上是共通的。但两个体系在若干对 AI 测评至关重要的维度上存在差异：患者群体在人口结构和疾病谱上不同；数据可及性不同——美国临床环境可能提供更高的病例人口多样性，而丁香园等中国医学平台拥有大量真实世界的公开病例记录和临床讨论，可以为测评场景提供具体的经验依托。此外，病历文书规范、药物可及性、医患沟通预期等方面也存在显著差异。",
                "同时使用两种临床语境意味着：某些模型行为会在两种环境下同时出现，从而增强我们对其代表真实能力或失败模式的信心；而另一些行为则是体系特异性的，揭示模型训练假设在哪些方面不具备迁移性。两种视角构成的测评框架比单一语境下的基准更难被刷榜，也更接近真实部署条件。"
              ]
            }
          ],
          references: "参考文献"
        }
      : {
          eyebrow: "About the research",
          title: "Clinician-grounded evaluation for medical LLMs",
          intro:
            "TRUST-Med (Translational Real-world User-grounded Safety Testing for Medical AI) is a research platform built to evaluate medical LLMs the way they are actually used: on open-ended clinical questions, judged by practicing clinicians, and grounded in real cases from US and Chinese medical practice.",
          affiliation: "Affiliation",
          sections: [
            {
              title: "Real Cases, Real Judges",
              paragraphs: [
                "Most medical AI benchmarks are built from multiple-choice exams — MedQA, MedMCQA, MMLU. These measure factual recall but abstract away from the work physicians actually do. TRUST-Med takes a different starting point: evaluation scenarios derived from real-world clinical cases, including publicly documented cases from US and Chinese medical communities.",
                "When a clinician uses an AI system in practice, they are not selecting from four answer choices. They are asking open-ended questions under uncertainty, reasoning through evolving presentations, and making decisions with real consequences for real patients. A model that scores well on MCQ benchmarks may still give an answer that misses urgency, anchors on a prior diagnosis, or fails to surface a safety-critical constraint.",
                "By grounding evaluations in real cases and having practicing physicians judge model outputs directly, TRUST-Med measures what actually matters: whether a response would help a clinician do their job more safely and effectively."
              ]
            },
            {
              title: "Rubric-Augmented Evaluation for Model Improvement",
              paragraphs: [
                "Preference-based evaluation frameworks — including those adapted from AlpacaEval and RLHF-style human feedback pipelines — can identify which of two model outputs users prefer, but they cannot reliably explain why. A model can win a preference vote by being more verbose, more confidently worded, or better formatted, without demonstrating stronger clinical reasoning. And a generic preference signal provides limited guidance for targeted model improvement.",
                "TRUST-Med uses a rubric-augmented pairwise format. Before making any preference choice, clinicians work through a scenario-specific rubric: a structured set of criteria capturing both positive quality signals — did the response identify urgency correctly? surface an appropriate differential? account for local standards? — and explicit safety failures, such as anchoring on a prior diagnosis or omitting a time-critical intervention.",
                "This design produces preference data with interpretable structure. It distinguishes clinical substance from presentation style, identifies specific failure modes rather than aggregate scores, and generates data that could support more targeted model fine-tuning rather than generic preference optimization."
              ]
            },
            {
              title: "US and China as Complementary Clinical Contexts",
              paragraphs: [
                "Cross-national evaluation is often framed as two parallel tracks, each testing a model against its own regional standards. TRUST-Med takes a different position: the US and Chinese clinical systems are treated as complementary contexts that together produce a broader and more robust evaluation environment.",
                "Many core medical standards are internationally shared. But the two systems differ in ways that matter for AI evaluation. Patient populations differ in demographic composition and disease epidemiology. Data availability differs: US clinical settings may offer greater demographic diversity in documented cases; Chinese medical platforms such as DXY provide large volumes of publicly documented real-world cases and clinical discussions that anchor evaluation scenarios in concrete clinical experience. Documentation norms, drug formularies, and patient communication expectations also diverge.",
                "Using both contexts means that some model behaviors will appear across both environments — strengthening confidence that they reflect genuine capabilities or failure modes — while others will be system-specific, revealing where a model's assumptions do not generalize. Together, these two perspectives make the evaluation harder to game and more reflective of real-world deployment conditions."
              ]
            }
          ],
          references: "References"
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
      <section className="grid gap-10 py-10 md:grid-cols-[0.9fr_1.1fr]">
        <aside className="border border-line bg-paper p-6">
          <h2 className="font-display text-2xl text-primary">{copy.affiliation}</h2>
          <div className="mt-5">
            <AffiliationLogos />
          </div>
          <p className="mt-6 font-mono text-sm text-accent">
            yyao85@jh.edu
          </p>
        </aside>

        <div className="space-y-8">
          {copy.sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-3xl text-primary">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 leading-8 text-muted">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <section>
            <h2 className="font-display text-3xl text-primary">
              {copy.references}
            </h2>
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
