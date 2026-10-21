import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Card, CardHeader, CardTitle, Label, Select } from "@/components/ui";
import { referentiel } from "@/data/referentiel";
import { formatMdE, formatPct } from "@/lib/format";
import type { SerieHistorique } from "@/types";

const DERNIERE_ANNEE_REELLE = 2024;

export function Historique() {
  const series = referentiel.historique;
  const [serieId, setSerieId] = useState(series[0]?.id ?? "");
  const serie = series.find((s) => s.id === serieId) ?? series[0];

  const donnees = useMemo(
    () =>
      (serie?.points ?? []).map((p) => ({
        annee: p.annee,
        valeur: p.valeur,
        reel: p.annee <= DERNIERE_ANNEE_REELLE,
      })),
    [serie],
  );

  const annee2026 = serie?.points.find((p) => p.annee === 2026)?.valeur ?? 0;
  const annee2015 = serie?.points.find((p) => p.annee === 2015)?.valeur ?? 0;
  const evolution = annee2015 === 0 ? 0 : ((annee2026 - annee2015) / Math.abs(annee2015)) * 100;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Trajectoires pluriannuelles (2015 → 2026)</h2>
      <Card className="text-xs text-slate-400">
        Données réelles jusqu'à {DERNIERE_ANNEE_REELLE}, prévisions (LFI/LFSS) ensuite. Le repère vertical
        distingue l'exécuté du prévisionnel. Ordres de grandeur indicatifs consolidés depuis les LFI
        successives — le chiffre officiel de chaque année est dans les lois de finances correspondantes.
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Série à afficher</CardTitle>
          <div>
            <Label htmlFor="serie-hist">Indicateur</Label>
            <Select id="serie-hist" value={serieId} onChange={(e) => setSerieId(e.target.value)} className="mt-1">
              {series.map((s: SerieHistorique) => (
                <option key={s.id} value={s.id}>
                  {s.nom}
                </option>
              ))}
            </Select>
          </div>
        </CardHeader>
        <div className="mb-2 flex gap-4">
          <Badge variant="positif">Évolution 2015 → 2026 : {formatPct(evolution)}</Badge>
          <Badge>2026 : {serie?.nom.includes("%") ? formatPct(annee2026) : formatMdE(annee2026)}</Badge>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={donnees}>
            <defs>
              <linearGradient id="gradientHist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2b45" />
            <XAxis dataKey="annee" />
            <YAxis />
            <Tooltip formatter={(v: unknown) => (serie?.nom.includes("%") ? formatPct(Number(v ?? 0)) : formatMdE(Number(v ?? 0)))} />
            <ReferenceLine x={DERNIERE_ANNEE_REELLE} stroke="#f59e0b" strokeDasharray="6 4" label={{ value: "Fin des données réelles", position: "insideTop", fill: "#f59e0b", fontSize: 10 }} />
            <Area type="monotone" dataKey="valeur" stroke="#60a5fa" fill="url(#gradientHist)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recettes vs dépenses de l'État (Md€)</CardTitle>
        </CardHeader>
        <CroiseeRecettesDepenses series={series} />
      </Card>
    </div>
  );
}

function CroiseeRecettesDepenses({ series }: { series: SerieHistorique[] }) {
  const depenses = series.find((s) => s.id === "hist-depenses-etat");
  const recettes = series.find((s) => s.id === "hist-recettes-etat");
  const data = useMemo(() => {
    if (!depenses || !recettes) return [];
    const mapAnnees = new Map<number, { annee: number; depenses?: number; recettes?: number }>();
    for (const p of depenses.points) mapAnnees.set(p.annee, { annee: p.annee, depenses: p.valeur });
    for (const p of recettes.points) {
      const e = mapAnnees.get(p.annee);
      if (e) e.recettes = p.valeur;
    }
    return [...mapAnnees.values()].map((e) => ({ ...e, solde: (e.recettes ?? 0) - (e.depenses ?? 0) }));
  }, [depenses, recettes]);

  if (data.length === 0) return <p className="text-sm text-slate-400">Séries historiques indisponibles.</p>;

  return (
    <ResponsiveContainer width="100%" height={340}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2b45" />
        <XAxis dataKey="annee" />
        <YAxis />
        <Tooltip formatter={(v: unknown) => formatMdE(Number(v ?? 0))} />
        <Legend />
        <Bar dataKey="recettes" fill="#34d399" name="Recettes" />
        <Bar dataKey="depenses" fill="#f87171" name="Dépenses" />
        <Line type="monotone" dataKey="solde" stroke="#60a5fa" strokeWidth={2} name="Solde" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
