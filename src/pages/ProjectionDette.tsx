import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Card, CardHeader, CardTitle, Input, Label } from "@/components/ui";
import { useAgregats, useTrajectoire } from "@/hooks";
import { referentiel } from "@/data/referentiel";
import { formatMdE, formatPct } from "@/lib/format";

export function ProjectionDette() {
  const agregats = useAgregats();
  const [croissance, setCroissance] = useState(3);
  const [taux, setTaux] = useState(2.5);
  const [horizon, setHorizon] = useState(10);

  const resultat = useTrajectoire({ croissanceNominalePct: croissance, tauxInteretPct: taux, horizon });

  const data = [
    { annee: 2026, dettePctPib: referentiel.macro.dettePct },
    ...resultat.points.map((p) => ({ annee: p.annee, dettePctPib: p.dettePctPib })),
  ];

  const couleurDiagnostic =
    resultat.diagnostic === "soutenable" ? "positif" : resultat.diagnostic === "boule_de_neige" ? "negatif" : "rigide";

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Projection de dette</h2>
      <Card>
        <CardHeader>
          <CardTitle>Réglages</CardTitle>
          <Badge variant={couleurDiagnostic}>{resultat.diagnostic}</Badge>
        </CardHeader>
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <Label htmlFor="croissance">Croissance nominale (% / an)</Label>
            <Input
              id="croissance"
              type="number"
              step="0.1"
              min={0}
              max={10}
              value={croissance}
              onChange={(e) => setCroissance(Number(e.target.value) || 0)}
              className="mt-1 w-28"
            />
          </div>
          <div>
            <Label htmlFor="taux">Taux d'intérêt moyen (% / an)</Label>
            <Input
              id="taux"
              type="number"
              step="0.1"
              min={0}
              max={10}
              value={taux}
              onChange={(e) => setTaux(Number(e.target.value) || 0)}
              className="mt-1 w-28"
            />
          </div>
          <div>
            <Label htmlFor="horizon">Horizon (1-15 ans)</Label>
            <Input
              id="horizon"
              type="number"
              min={1}
              max={15}
              value={horizon}
              onChange={(e) => setHorizon(Math.max(1, Math.min(15, Number(e.target.value) || 1)))}
              className="mt-1 w-28"
            />
          </div>
          <p className="max-w-md text-xs text-slate-400">{resultat.message}</p>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trajectoire de la dette en % du PIB</CardTitle>
          <p className="text-xs text-slate-400">
            Pilotée par le solde du scénario actif : {formatMdE(agregats.soldePublic)}.
            Dette 2026 : {formatPct(referentiel.macro.dettePct)} du PIB — référence 2025 :{" "}
            {formatPct(referentiel.macro.detteReference2025Pct)}.
          </p>
        </CardHeader>
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradientDette" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2b45" />
            <XAxis dataKey="annee" />
            <YAxis tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
            <Tooltip formatter={(v: unknown) => formatPct(Number(v))} />
            <Area type="monotone" dataKey="dettePctPib" stroke="#60a5fa" fill="url(#gradientDette)" />
            <ReferenceLine
              y={referentiel.macro.detteReference2025Pct}
              stroke="#f59e0b"
              strokeDasharray="6 4"
              label={{ value: "Niveau 2025", position: "insideTopRight", fill: "#f59e0b", fontSize: 11 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <CardTitle>Détail année par année</CardTitle>
        <ul className="mt-2 grid grid-cols-2 gap-2 text-sm text-slate-300 lg:grid-cols-4">
          {resultat.points.map((p) => (
            <li key={p.annee} className="rounded-md border border-bord px-3 py-2">
              <span className="text-slate-400">{p.annee} :</span>{" "}
              <span className="font-semibold">{formatPct(p.dettePctPib)}</span>
              <span className="text-xs text-slate-500"> ({formatMdE(p.detteMd)} de dette)</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
