import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, Button, Card, CardHeader, CardTitle, Input, Label, Separator, Table, Td, Th } from "@/components/ui";
import { useScenarioActif } from "@/hooks";
import { referentiel } from "@/data/referentiel";
import { ecartObjectif, evaluerReforme } from "@/lib/reformes";
import { formatDelta, formatMdE, formatPct } from "@/lib/format";
import type { MesureReforme } from "@/types";

const CATEGORIES: Array<{ id: MesureReforme["categorie"]; nom: string }> = [
  { id: "fiscalite", nom: "Fiscalité" },
  { id: "depenses", nom: "Dépenses de l'État" },
  { id: "securite-sociale", nom: "Sécurité sociale" },
  { id: "aide", nom: "Aides" },
  { id: "investissement", nom: "Investissement" },
];

export function Reformes() {
  const scenario = useScenarioActif();
  const [selection, setSelection] = useState<string[]>([]);
  const [ciblePct, setCiblePct] = useState(-3);

  const mesures = referentiel.mesures;
  const mesuresChoisies = useMemo(
    () => mesures.filter((m) => selection.includes(m.id)),
    [mesures, selection],
  );
  const evaluation = useMemo(
    () => evaluerReforme(mesuresChoisies, scenario),
    [mesuresChoisies, scenario],
  );

  const soldeFinal = evaluation.agregatsRecalcules.soldePublic;
  const objectif = ecartObjectif(soldeFinal, ciblePct);

  const donneesTrajectoire = [
    { annee: 2026, dette: referentiel.macro.dettePct },
    ...evaluation.trajectoire.points.map((p) => ({ annee: p.annee, dette: p.dettePctPib })),
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Atelier de réformes — construire une proposition chiffrée</h2>
      <Card className="text-xs text-slate-400">
        Sélectionne des mesures : l'application calcule le solde public, la trajectoire de dette à 10 ans,
        l'effet PIB indicatif et les contre-arguments connus. Chiffrages = ordres de grandeur sourcés
        (Sénat, Cour des comptes, COR, France Stratégie) — à recalibrer pour une proposition officielle.
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardTitle>Impact sur le solde</CardTitle>
          <p className={`mt-2 text-2xl font-bold ${evaluation.impactTotal >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {formatDelta(evaluation.impactTotal)}
          </p>
          <p className="text-xs text-slate-400">par an, hors effet de second tour</p>
        </Card>
        <Card>
          <CardTitle>Solde public projeté</CardTitle>
          <p className={`mt-2 text-2xl font-bold ${soldeFinal >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {formatMdE(soldeFinal)}
          </p>
          <p className="text-xs text-slate-400">{formatPct((soldeFinal / referentiel.macro.pib) * 100)} du PIB</p>
        </Card>
        <Card>
          <CardTitle>Effet PIB à 5 ans (indicatif)</CardTitle>
          <p className={`mt-2 text-2xl font-bold ${evaluation.effetPib5ansPct >= 0 ? "text-emerald-300" : "text-amber-300"}`}>
            {formatDelta(evaluation.effetPib5ansPct)} %
          </p>
          <p className="text-xs text-slate-400">multiplicateurs budgétaires (OCDE/OFCE)</p>
        </Card>
        <Card>
          <CardTitle>Dette à +10 ans</CardTitle>
          <p className="mt-2 text-2xl font-bold text-blue-300">
            {formatPct(evaluation.trajectoire.points[9]?.dettePctPib ?? referentiel.macro.dettePct)}
          </p>
          <p className="text-xs text-slate-400">
            vs {formatPct(referentiel.macro.dettePct)} aujourd'hui — {evaluation.trajectoire.diagnostic}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Objectif de solde public</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label htmlFor="cible-solde">Cible (% du PIB, ex. −3)</Label>
            <Input
              id="cible-solde"
              type="number"
              step="0.1"
              value={ciblePct}
              onChange={(e) => setCiblePct(Number(e.target.value) || 0)}
              className="mt-1 w-28"
            />
          </div>
          <div className="text-sm">
            {objectif.ecartMdE <= 0 ? (
              <Badge variant="positif">Objectif atteint : marge de {formatMdE(-objectif.ecartMdE)}</Badge>
            ) : (
              <Badge variant="negatif">
                Il manque encore {formatMdE(objectif.ecartMdE)}/an pour atteindre {formatPct(ciblePct)} du PIB
              </Badge>
            )}
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {CATEGORIES.map((cat) => {
          const liste = mesures.filter((m) => m.categorie === cat.id);
          if (liste.length === 0) return null;
          return (
            <Card key={cat.id}>
              <CardHeader>
                <CardTitle>{cat.nom}</CardTitle>
                <span className="text-xs text-slate-500">{liste.length} mesures disponibles</span>
              </CardHeader>
              <div className="space-y-3">
                {liste.map((m) => {
                  const coche = selection.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      className={`rounded-lg border p-3 transition-colors ${coche ? "border-blue-500 bg-blue-950/30" : "border-bord bg-slate-900/40"}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <label className="flex flex-1 items-start gap-3">
                          <input
                            type="checkbox"
                            aria-label={`Sélectionner la mesure ${m.nom}`}
                            checked={coche}
                            onChange={() =>
                              setSelection((prev) =>
                                prev.includes(m.id) ? prev.filter((x) => x !== m.id) : [...prev, m.id],
                              )
                            }
                            className="mt-1 h-4 w-4"
                          />
                          <span>
                            <span className="font-medium">{m.nom}</span>
                            <span className="mt-1 block text-xs text-slate-400">{m.detail}</span>
                            {coche && m.contreArguments.length > 0 ? (
                              <span className="mt-2 block">
                                <span className="text-xs font-semibold text-amber-300">Points de vigilance :</span>
                                <ul className="mt-1 list-disc pl-4 text-xs text-slate-400">
                                  {m.contreArguments.map((c, i) => (
                                    <li key={i}>{c}</li>
                                  ))}
                                </ul>
                              </span>
                            ) : null}
                          </span>
                        </label>
                        <div className="text-right">
                          <p className={`font-bold ${m.impactSolde >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                            {formatDelta(m.impactSolde)}
                          </p>
                          <p className="text-xs text-slate-500">/ an</p>
                          {m.coutTransition ? (
                            <p className="mt-1 text-xs text-amber-300">
                              transition : {formatDelta(m.coutTransition.montant)}/an pendant {m.coutTransition.dureeAnnees} ans
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {evaluation.effetSecondTour ? (
        <Card>
          <CardHeader>
            <CardTitle>Effet de second tour</CardTitle>
            <Badge variant="rigide">à intégrer au chiffrage</Badge>
          </CardHeader>
          <p className="text-sm text-slate-300">{evaluation.effetSecondTour.enonce}</p>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Trajectoire de dette à 10 ans (hypothèse : croissance nominale 3 %, taux moyen 2,5 %)</CardTitle>
        </CardHeader>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={donneesTrajectoire}>
            <defs>
              <linearGradient id="gradientRef" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2b45" />
            <XAxis dataKey="annee" />
            <YAxis tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
            <Tooltip formatter={(v: unknown) => formatPct(Number(v ?? 0))} />
            <ReferenceLine y={referentiel.macro.detteReference2025Pct} stroke="#f59e0b" strokeDasharray="6 4" />
            <Area type="monotone" dataKey="dette" stroke="#34d399" fill="url(#gradientRef)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dépenses fiscales — les « niches » de l'impôt (~82 Md€ recensés ici)</CardTitle>
          <Badge variant="rigide">recettes renoncées, pas des dépenses visibles</Badge>
        </CardHeader>
        <Table>
          <thead>
            <tr>
              <Th>Dispositif</Th>
              <Th>Bénéficiaire</Th>
              <Th className="text-right">Montant / an</Th>
              <Th>Lecture</Th>
            </tr>
          </thead>
          <tbody>
            {[...referentiel.depensesFiscales]
              .sort((a, b) => b.montant - a.montant)
              .map((df) => (
                <tr key={df.id} className="hover:bg-slate-800/40">
                  <Td className="font-medium">{df.nom}</Td>
                  <Td className="text-xs text-slate-400">{df.beneficiaire}</Td>
                  <Td className="text-right font-semibold">{formatMdE(df.montant)}</Td>
                  <Td className="max-w-md text-xs text-slate-500">{df.detail}</Td>
                </tr>
              ))}
          </tbody>
        </Table>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes de méthode</CardTitle>
        </CardHeader>
        <ul className="list-disc space-y-1 pl-5 text-xs text-slate-400">
          <li>Les impacts affichés sont des ordres de grandeur sourcés, pas des chiffrages officiels : ils dépendent du périmètre exact de chaque mesure.</li>
          <li>Les mesures « hors référentiel » (TTF, CIR, gel du point d'indice…) ajustent le solde sans toucher les lignes du budget : c'est pourquoi le solde projeté combine overrides et correction explicite.</li>
          <li>L'effet PIB agrège des multiplicateurs linéaires — la réalité est non linéaire (goulots, capacité d'absorption).</li>
          <li>Coûts de transition non décomptés du solde projeté : ils s'ajoutent pendant leurs années de mise en œuvre.</li>
        </ul>
        <Separator className="my-3" />
        <p className="text-xs text-slate-500">
          Solde de référence du scénario « {scenario.nom} » : {formatMdE(scenario.overrides ? soldeFinal - evaluation.impactTotal : soldeFinal)}.{" "}
          <Button variant="ghost" className="ml-1" onClick={() => setSelection([])}>
            Tout désélectionner
          </Button>
        </p>
      </Card>
    </div>
  );
}
