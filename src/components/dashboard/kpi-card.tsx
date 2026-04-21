type KpiCardProps = {
  label: string;
  value: string;
  helper: string;
};

export function KpiCard({ label, value, helper }: KpiCardProps) {
  return (
    <article className="panel-card p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{helper}</p>
    </article>
  );
}
