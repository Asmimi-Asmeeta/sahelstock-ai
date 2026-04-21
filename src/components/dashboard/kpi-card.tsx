type KpiCardProps = {
  label: string;
  value: string;
  helper: string;
  accent?: boolean;
};

export function KpiCard({ label, value, helper, accent = false }: KpiCardProps) {
  return (
    <article className={`${accent ? "panel-card-accent" : "panel-card"} min-w-0 p-5`}>
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </p>
      <p className="mt-3 break-words text-[clamp(1.55rem,2vw,2.05rem)] font-bold leading-tight tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-3 max-w-[22ch] text-sm leading-6 text-slate-600">{helper}</p>
    </article>
  );
}
