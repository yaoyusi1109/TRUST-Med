type PageShellProps = {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
};

export function PageShell({ eyebrow, title, intro, children }: PageShellProps) {
  return (
    <main className="mx-auto max-w-content px-5 py-14">
      <section className="border-b border-line pb-9">
        {eyebrow ? (
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-4xl font-display text-4xl leading-tight text-primary md:text-5xl">
          {title}
        </h1>
        {intro ? (
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{intro}</p>
        ) : null}
      </section>
      {children}
    </main>
  );
}
