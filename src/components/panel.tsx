import type { ReactNode } from "react";

export function Panel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-card-border bg-card p-5">
      <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted">
        {title}
      </h2>
      {children}
    </div>
  );
}
