const affiliations = [
  {
    name: "JHU-CSSE",
    fullName: "Johns Hopkins University Center for Systems Science and Engineering",
    logo: "/affiliations/jhu-logo.png",
    source: "Wikimedia Commons"
  },
  {
    name: "NJU-School of Artificial Intelligence",
    fullName: "Nanjing University School of Artificial Intelligence",
    logo: "/affiliations/nju-ai-logo.png",
    source: "NJU School of Artificial Intelligence"
  }
];

export function AffiliationLogos() {
  return (
    <div className="grid gap-3">
      {affiliations.map((affiliation) => (
        <div
          key={affiliation.name}
          className="border border-line bg-background p-4"
        >
          <div className="flex min-h-16 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={affiliation.logo}
              alt={`${affiliation.name} logo`}
              className="max-h-12 max-w-full object-contain"
            />
          </div>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
            {affiliation.name}
          </p>
          <p className="mt-1 text-sm leading-5 text-muted">
            {affiliation.fullName}
          </p>
          <p className="mt-2 text-xs leading-5 text-muted">
            Logo source: {affiliation.source}
          </p>
        </div>
      ))}
    </div>
  );
}
