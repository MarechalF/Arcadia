import { clsx } from "clsx";

interface Props {
  valeur: number;
  total: number;
  couleur?: string;
  className?: string;
}

/** Barre horizontale proportionnelle (valeur / total). */
export function BarreProportion({ valeur, total, couleur = "bg-blue-500", className }: Props) {
  const pct = total === 0 ? 0 : Math.min(100, Math.max(0, (Math.abs(valeur) / Math.abs(total)) * 100));
  return (
    <div
      className={clsx("h-2 w-full overflow-hidden rounded-full bg-slate-800", className)}
      role="img"
      aria-label={`${pct.toFixed(1)} % du total`}
    >
      <div className={clsx("h-full rounded-full", couleur)} style={{ width: `${pct}%` }} />
    </div>
  );
}
