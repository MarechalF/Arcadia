import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Badge, Card, CardHeader, CardTitle, Table, Td, Th } from "@/components/ui";
import { BarreProportion } from "@/components/BarreProportion";
import { useScenarioActif } from "@/hooks";
import { referentiel } from "@/data/referentiel";
import { indicateurRigidite, ventilerParTitre } from "@/lib/agregats";
import { formatMdE, formatPct } from "@/lib/format";

const COULEURS: Record<string, string> = {
  "titre-1": "#f472b6",
  "titre-2": "#f59e0b",
  "titre-3": "#60a5fa",
  "titre-6": "#34d399",
  "titre-7": "#a78bfa",
};

export function TitresBudgetaires() {
  const scenario = useScenarioActif();
  const ventilation = useMemo(() => ventilerParTitre(referentiel, scenario), [scenario]);
  const rigidite = useMemo(() => indicateurRigidite(ventilation), [ventilation]);
  const total = ventilation.reduce((a, t) => a + t.total, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Titres budgétaires — structure réelle de la dépense</h2>
      <Card className="text-xs text-slate-400">
        La nomenclature par titres dit ce qu'on peut réellement ajuster : titre 1 (dette) et titre 2
        (personnel) sont quasi intouchables à court terme ; titres 3 (fonctionnement), 6 (subventions)
        et 7 (investissement) concentrent l'effort d'économies possible.
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardTitle>Part de dépenses rigides (titres 1 + 2)</CardTitle>
          <p className="mt-2 text-3xl font-bold text-amber-300">{formatPct(rigidite.partRigidePct)}</p>
          <p className="text-xs text-slate-400">
            {formatMdE(rigidite.rigide)} rigides sur {formatMdE(rigidite.rigide + rigidite.ajustable)} de
            dépenses de l'État. Le reste ({formatMdE(rigidite.ajustable)}) est ajustable.
          </p>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Répartition par titre</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={ventilation} dataKey="total" nameKey="nom" label={false}>
                {ventilation.map((t) => (
                  <Cell key={t.titre} fill={COULEURS[t.titre] ?? "#64748b"} />
                ))}
              </Pie>
              <Tooltip formatter={(v: unknown) => formatMdE(Number(v ?? 0))} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Détail par titre</CardTitle>
          <Badge>{formatMdE(total)} de dépenses de l'État</Badge>
        </CardHeader>
        <Table>
          <thead>
            <tr>
              <Th>Titre</Th>
              <Th className="text-right">Montant</Th>
              <Th>Part</Th>
              <Th>Nature</Th>
            </tr>
          </thead>
          <tbody>
            {ventilation.map((t) => (
              <tr key={t.titre} className="hover:bg-slate-800/40">
                <Td>
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-sm" style={{ background: COULEURS[t.titre] ?? "#64748b" }} />
                    {t.nom}
                  </span>
                </Td>
                <Td className="text-right font-semibold">{formatMdE(t.total)}</Td>
                <Td className="w-40">
                  <span className="text-xs text-slate-400">{formatPct((t.total / total) * 100)}</span>
                  <BarreProportion valeur={t.total} total={total} couleur={COULEURS[t.titre] ?? "bg-slate-500"} />
                </Td>
                <Td>
                  {t.titre === "titre-1" || t.titre === "titre-2" ? (
                    <Badge variant="rigide">rigide</Badge>
                  ) : (
                    <Badge variant="positif">ajustable</Badge>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
