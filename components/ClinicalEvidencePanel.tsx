import type { ScenarioEvidence } from "@/types";
import type { Language } from "@/components/LanguageProvider";

function CtPreview({ language }: { language: Language }) {
  const label = language === "zh" ? "充盈缺损" : "Filling defect";
  const frame =
    language === "zh"
      ? "演示用CT肺动脉造影片段"
      : "Illustrative CT angiography frame";

  return (
    <div className="relative aspect-[4/3] min-h-64 overflow-hidden border border-line bg-[#111]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,#d8d8d8_0,#9f9f9f_18%,#5c5c5c_34%,#1d1d1d_56%,#050505_74%)]" />
      <div className="absolute left-[18%] top-[18%] h-[58%] w-[28%] rounded-[48%] border border-white/20 bg-black/35 blur-[0.5px]" />
      <div className="absolute right-[18%] top-[18%] h-[58%] w-[28%] rounded-[48%] border border-white/20 bg-black/35 blur-[0.5px]" />
      <div className="absolute left-[46%] top-[28%] h-[30%] w-[10%] rounded-full bg-white/35 blur-[1px]" />
      <div className="absolute right-[30%] top-[42%] h-10 w-16 rounded-full border-2 border-accent bg-accent/10" />
      <div className="absolute right-[23%] top-[38%] border border-accent bg-paper px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-accent">
        {label}
      </div>
      <div className="absolute bottom-3 left-3 border border-white/25 bg-black/50 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-white/80">
        {frame}
      </div>
    </div>
  );
}

export function ClinicalEvidencePanel({
  evidence,
  language = "en"
}: {
  evidence?: ScenarioEvidence;
  language?: Language;
}) {
  if (!evidence) {
    return null;
  }

  const copy =
    language === "zh"
      ? { attached: "附加临床材料", focus: "测评重点" }
      : { attached: "Attached clinical material", focus: "Evaluation focus" };

  return (
    <section className="mt-6 border border-line bg-background">
      <div className="border-b border-line bg-wash px-5 py-3">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
          {copy.attached}
        </p>
        <h3 className="mt-1 font-display text-2xl text-primary">
          {evidence.title}
        </h3>
        {evidence.subtitle ? (
          <p className="mt-1 text-sm leading-6 text-muted">{evidence.subtitle}</p>
        ) : null}
      </div>

      {evidence.images?.length ? (
        <div className="grid gap-4 border-b border-line p-5 lg:grid-cols-2">
          {evidence.images.map((image) => (
            <figure key={image.src} className="border border-line bg-paper p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt}
                className="w-full border border-line bg-white"
              />
              {image.caption ? (
                <figcaption className="mt-2 text-sm leading-6 text-muted">
                  {image.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : null}

      <div className="grid gap-5 p-5 lg:grid-cols-[0.95fr_1.05fr]">
        {evidence.type === "ct" ? (
          <CtPreview language={language} />
        ) : (
          <div className="border border-line bg-paper p-4">
            {evidence.type === "chat" ? (
              <div className="space-y-3">
                {evidence.transcript?.map((turn, index) => (
                  <div key={`${turn.speaker}-${index}`} className="border border-line bg-background p-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
                      {turn.speaker}
                    </p>
                    <p className="mt-2 leading-6 text-ink">{turn.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {evidence.rows?.map((row) => (
                  <div key={row.label} className="grid gap-2 border-b border-line py-3 last:border-b-0 md:grid-cols-[180px_1fr]">
                    <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted">
                      {row.label}
                    </p>
                    <div>
                      <p className="text-ink">{row.value}</p>
                      {row.note ? (
                        <p className="mt-1 text-sm leading-6 text-muted">{row.note}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="border border-line bg-paper p-4">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            {copy.focus}
          </p>
          <ul className="mt-3 space-y-2 leading-6 text-muted">
            {evidence.items?.map((item) => (
              <li key={item} className="border-t border-line pt-2 first:border-t-0 first:pt-0">
                {item}
              </li>
            ))}
          </ul>
          {evidence.caption ? (
            <p className="mt-4 border-t border-line pt-3 text-sm leading-6 text-muted">
              {evidence.caption}
            </p>
          ) : null}
          {evidence.sourceUrl ? (
            <p className="mt-3 text-sm leading-6 text-muted">
              Source:{" "}
              <a
                href={evidence.sourceUrl}
                className="text-primary underline decoration-line underline-offset-4"
                target="_blank"
                rel="noreferrer"
              >
                DXY public case discussion
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
