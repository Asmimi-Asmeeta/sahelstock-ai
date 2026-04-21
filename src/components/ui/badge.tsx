import type { ReactNode } from "react";

const toneClasses = {
  slate: "ui-badge-slate",
  blue: "ui-badge-blue",
  emerald: "ui-badge-emerald",
  amber: "ui-badge-amber",
  orange: "ui-badge-orange",
  red: "ui-badge-red",
  hero: "ui-badge-hero",
} as const;

export type BadgeTone = keyof typeof toneClasses;

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
};

export function Badge({
  children,
  tone = "slate",
  className = "",
}: BadgeProps) {
  return (
    <span className={["ui-badge", toneClasses[tone], className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}
