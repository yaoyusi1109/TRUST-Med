import Link from "next/link";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export function ButtonLink({
  href,
  children,
  variant = "primary"
}: ButtonLinkProps) {
  const styles =
    variant === "primary"
      ? "border-primary bg-primary text-white hover:bg-background hover:text-primary"
      : "border-primary bg-background text-primary hover:bg-primary hover:text-white";

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-button border px-5 py-3 text-sm transition-colors ${styles}`}
    >
      {children}
    </Link>
  );
}
