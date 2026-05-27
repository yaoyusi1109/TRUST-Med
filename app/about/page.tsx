"use client";

import { PageShell } from "@/components/PageShell";
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
          title: "面向医学大模型的医生驱动测评",
          intro:
            "TRUST-Med（转化型真实世界用户驱动医学 AI 安全测评）是一个交互式研究平台，用于测试医学大模型在真实医生问题中的表现：开放式、多步骤、依赖语境，并受到本地诊疗规范影响。",
          affiliation: "团队归属",
          sections: [
            {
              title: "现有测评的局限",
              paragraphs: [
                "大语言模型正在进入临床工作流，覆盖决策支持、医学教育、病历文书、翻译和医患沟通。但许多医学大模型测评仍依赖来自 MedQA、MedMCQA、MMLU 等选择题考试的静态模板化基准。这些数据集可以衡量基础知识，却难以反映真实临床实践中的开放性、动态性和语境依赖性。",
                "在真实工作中，医生很少只询问单一事实答案。他们会在不确定性下选择治疗方案，处理不断演化的诊断流程，向患者解释风险，撰写出院文书，解读指南，并核对用药安全。一个回答即使事实上看似合理，如果遗漏紧急程度、忽视本地规范、表达不清或没有提示安全约束，仍可能缺乏临床价值。",
                "开放式和量表化测评是重要进步，但许多框架仍使用 LLM-as-judge 或固定任务集。这留下两个关键问题：自动评分是否符合真实医生偏好？一个临床体系中建立的基准是否能迁移到另一个医疗语境？TRUST-Med 正是围绕这些缺口设计。"
              ]
            },
            {
              title: "TRUST-Med 测量什么",
              paragraphs: [
                "TRUST-Med 将 Arena 式成对比较引入临床医学。医生阅读真实感临床场景，比较两个匿名模型回答，并选择实际工作中更倾向采用的回答。目标不是奖励考试式正确率，而是衡量推理质量、安全意识、清晰度、完整性以及与具体病例的适配性。",
                "不同于简单偏好投票，每个 TRUST-Med 场景都配有专属量表，医生必须在最终选择前完成核对。量表同时记录正向质量标准和明确的安全失败项，从而区分临床实质与表达风格、回答长度或排版优势。",
                "平台还具有跨语境设计。同一套测评逻辑可应用于中美临床环境，并支持英文和中文，从而让指南、药物可及性、文书规范和医患沟通预期的差异成为可测量信号，而不是被平均掉的噪声。汇总结果可支持 Bradley-Terry 排名、安全失败分析和跨站点分层比较。"
              ]
            },
            {
              title: "研究定位",
              paragraphs: [
                "TRUST-Med 建立在 Chatbot Arena 和 MedArena 等医生偏好平台的核心洞察之上：模型质量应在真实用户问题中测量，而不只依赖静态答案。TRUST-Med 进一步加入结构化量表、安全关键项，以及 Johns Hopkins 与南京大学协作背景下的跨站点比较。",
                "当前 demo 仅用于演示，不收集临床数据。它的目标是让潜在合作者直观看到拟议工作流：医生判断模型输出，量表捕捉临床上有意义的失败模式，偏好数据最终可作为医学大模型临床效用证据，而不是普通 AI 排行榜。"
              ]
            }
          ],
          references: "参考文献"
        }
      : {
          eyebrow: "About the research",
          title: "Clinician-grounded evaluation for medical LLMs",
          intro:
            "TRUST-Med (Translational Real-world User-grounded Safety Testing for Medical AI) is an interactive research platform for testing medical LLMs on the kinds of open-ended clinical questions physicians actually ask: uncertain, multi-step, context-dependent, and shaped by local standards of care.",
          affiliation: "Affiliation",
          sections: [
            {
              title: "Why Current Benchmarks Fall Short",
              paragraphs: [
                "Large language models are moving into clinician workflows, including decision support, medical education, documentation, translation, and patient communication. Yet many medical LLM evaluations still rely on static, templated benchmarks derived from multiple-choice exams such as MedQA, MedMCQA, and MMLU. These datasets are useful for measuring foundational knowledge, but they do not capture the open-ended, dynamic, and context-sensitive nature of real clinical practice.",
                "In practice, clinicians rarely ask only for a single factual answer. They ask about treatment selection under uncertainty, evolving diagnostic workups, patient-facing explanations, discharge documentation, guideline interpretation, and medication safety. A response can be factually plausible yet clinically unhelpful if it misses urgency, ignores local standards, communicates poorly, or fails to surface a safety constraint.",
                "Newer open-ended and rubric-based frameworks are an important step forward, but many still use LLM-as-judge evaluation or fixed task sets. That leaves two unresolved questions: whether automated scores match the preferences of practicing clinicians, and whether a benchmark built in one clinical system transfers cleanly to another. TRUST-Med is designed around those gaps."
              ]
            },
            {
              title: "What TRUST-Med Measures",
              paragraphs: [
                "TRUST-Med adapts arena-style head-to-head comparison for clinical medicine. A clinician reviews a realistic medical scenario, compares two anonymized model responses, and selects the response they would prefer in practice. The goal is not to reward exam-style correctness alone, but to measure clinical utility across reasoning quality, safety awareness, clarity, completeness, and appropriateness for the specific case.",
                "Unlike a simple preference vote, each TRUST-Med case includes a scenario-specific rubric that clinicians complete before making the final pairwise choice. Rubric items capture both positive quality criteria and explicit safety failures, allowing the study to distinguish clinical substance from presentation style, response length, or formatting polish.",
                "The platform is also cross-jurisdictional by design. The same evaluation logic can be applied across US and Chinese clinical contexts, in English and Chinese, so that differences in guidelines, formularies, documentation norms, and patient communication expectations become measurable signals rather than background noise. Aggregated evaluations can then support Bradley-Terry model ranking, safety-failure analysis, and subgroup comparison across sites."
              ]
            },
            {
              title: "Research Positioning",
              paragraphs: [
                "TRUST-Med builds on the insight behind Chatbot Arena and clinician preference platforms such as MedArena: model quality should be tested on user-generated, real-world questions rather than only on static answer keys. It extends that idea for medical safety testing by adding structured rubrics, explicit safety-critical criteria, and cross-site comparison between Johns Hopkins and Nanjing University collaborators.",
                "This demo is illustrative and does not collect clinical data. Its purpose is to make the proposed workflow concrete for collaborators: clinicians judge model outputs, rubrics capture clinically meaningful failure modes, and the resulting preference data can be analyzed as evidence about medical LLM utility rather than as a generic AI leaderboard."
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
