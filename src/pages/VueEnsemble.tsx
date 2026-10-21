import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Card, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { useAgregats, useScenarioActif } from "@/hooks";
import { referentiel } from "@/data/referentiel";
import { sommeProgrammes } from "@/lib/agregats";
import { formatMdE, formatNombre, formatPct } from "@/lib/format";

const COULEURS_BRANCHES = ["#60a5fa", "#34d399", "#f472b6"];

const POPULATION = 68_000_000;

export function VueEnsemble() {
  const agregats = useAgregats();
  const scenario = useScenarioActif();
  const pib = referentiel.macro.pib;

  const dataBranches = [
    { nom: "État", value: agregats.etat.recettes + agregats.etat.depenses },
    { nom: "Sécurité sociale", value: agregats.secu.recettes + agregats.secu.depenses },
    { nom: "Collectivités", value: agregats.collectivites.recettes + agregats.collectivites.depenses },
  ];

  const missions = referentiel.missions
    .map((m) => ({ nom: m.nom, total: sommeProgrammes(m, scenario) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Vue d'ensemble</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardTitle>Recettes nettes (3 branches)</CardTitle>
          <p className="mt-2 text-2xl font-bold text-emerald-300">{formatMdE(agregats.totalRecettes)}</p>
        </Card>
        <Card>
          <CardTitle>Dépenses (3 branches)</CardTitle>
          <p className="mt-2 text-2xl font-bold text-rose-300">{formatMdE(agregats.totalDepenses)}</p>
        </Card>
        <Card>
          <CardTitle>Solde public</CardTitle>
          <p className={`mt-2 text-2xl font-bold ${agregats.soldePublic >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {formatMdE(agregats.soldePublic)}
          </p>
          <p className="text-xs text-slate-400">≈ {formatPct((agregats.soldePublic / pib) * 100)} du PIB</p>
        </Card>
        <Card>
          <CardTitle>Dette par habitant</CardTitle>
          <p className="mt-2 text-2xl font-bold text-amber-300">
            {formatNombre(((referentiel.macro.dettePct / 100) * pib * 1_000_000_000) / POPULATION)}&nbsp;€
          </p>
          <p className="text-xs text-slate-400">
            Dette {formatPct(referentiel.macro.dettePct)} du PIB — déficit {formatPct(referentiel.macro.deficitPct)}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Poids des trois branches (flux totaux)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={dataBranches} dataKey="value" nameKey="nom" label>
                  {dataBranches.map((b, i) => (
                    <Cell key={b.nom} fill={COULEURS_BRANCHES[i % 3] ?? "#60a5fa"} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: unknown) => formatMdE(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top 10 des missions de dépenses (État)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={missions} layout="vertical" margin={{ left: 120 }}>
                <XAxis type="number" tickFormatter={(v: number) => `${v}`} />
                <YAxis type="category" dataKey="nom" width={150} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: unknown) => formatMdE(Number(v))} />
                <Bar dataKey="total" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { to: "/recettes", titre: "Recettes de l'État", desc: "D'où vient chaque euro perçu." },
          { to: "/depenses", titre: "Dépenses & missions", desc: "Où va chaque euro dépensé." },
          { to: "/securite-sociale", titre: "Sécurité sociale", desc: "LFSS : régimes et branches." },
          { to: "/grand-livre", titre: "Grand livre", desc: "Toutes les écritures, export CSV." },
        ].map((c) => (
          <Link key={c.to} to={c.to} className="rounded-xl border border-bord bg-carte p-4 transition-colors hover:border-blue-500">
            <p className="font-semibold text-blue-200">{c.titre}</p>
            <p className="mt-1 text-xs text-slate-400">{c.desc}</p>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Soldes par branche</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          {[
            { nom: "État", s: agregats.etat },
            { nom: "Sécurité sociale", s: agregats.secu },
            { nom: "Collectivités", s: agregats.collectivites },
          ].map(({ nom, s }) => (
            <div key={nom} className="rounded-lg border border-bord p-3">
              <p className="text-xs text-slate-400">{nom}</p>
              <p className={`text-lg font-bold ${s.solde >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                {formatMdE(s.solde)}
              </p>
              <Badge variant={s.solde >= 0 ? "positif" : "negatif"}>
                {formatMdE(s.recettes)} recettes / {formatMdE(s.depenses)} dépenses
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
