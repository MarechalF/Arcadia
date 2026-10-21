import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Badge, Card, CardHeader, CardTitle, Label, Select, Separator, Table, Td, Th, Input } from "@/components/ui";
import { BarreProportion } from "@/components/BarreProportion";
import { referentiel } from "@/data/referentiel";
import { formatMdE, formatPct } from "@/lib/format";
import type { AideSubvention } from "@/types";

const LABELS_BENEFICIAIRE: Record<AideSubvention["beneficiaire"], string> = {
  menages: "Ménages",
  entreprises: "Entreprises",
  collectivites: "Collectivités",
  associations: "Associations",
  operateurs: "Opérateurs publics",
  autres: "Autres",
};

const COULEURS_BENEFICIAIRE: Record<AideSubvention["beneficiaire"], string> = {
  menages: "#60a5fa",
  entreprises: "#34d399",
  collectivites: "#f472b6",
  associations: "#f59e0b",
  operateurs: "#a78bfa",
  autres: "#22d3ee",
};

export function AidesSubventions() {
  const [filtre, setFiltre] = useState<"tous" | AideSubvention["beneficiaire"]>("tous");
  const [recherche, setRecherche] = useState("");

  const aides = referentiel.aides;
  const total = aides.reduce((a, x) => a + x.montant, 0);

  const filtrees = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return aides.filter((a) => {
      if (filtre !== "tous" && a.beneficiaire !== filtre) return false;
      if (q.length > 0 && !`${a.nom} ${a.detail} ${a.financeur}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [aides, filtre, recherche]);

  const parBeneficiaire = useMemo(() => {
    const acc = new Map<AideSubvention["beneficiaire"], number>();
    for (const a of aides) acc.set(a.beneficiaire, (acc.get(a.beneficiaire) ?? 0) + a.montant);
    return [...acc.entries()]
      .map(([b, montant]) => ({ beneficiaire: b, nom: LABELS_BENEFICIAIRE[b], montant }))
      .sort((x, y) => y.montant - x.montant);
  }, [aides]);

  const totalFiltre = filtrees.reduce((a, x) => a + x.montant, 0);
  const cdc = referentiel.operateurs.find((o) => o.id === "op-cdc");

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Aides & subventions — qui reçoit quoi, et par quel circuit</h2>
      <Card className="text-xs text-slate-400">
        Ordres de grandeur indicatifs (Md€/an). Attention aux pièges de lecture : certaines « aides » sont des
        dépenses fiscales (l'État renonce à des recettes au lieu de verser un chèque), d'autres sont financées
        par des cotisations ou des factures d'énergie — pas par l'impôt. Le détail de chaque circuit est dans la colonne « Comment ça marche ».
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardTitle>Volume total recensé</CardTitle>
          <p className="mt-2 text-3xl font-bold text-blue-300">{formatMdE(total)}</p>
          <p className="text-xs text-slate-400">
            {aides.length} dispositifs, du RSA aux dotations aux collectivités. Ces flux se recoupent en partie
            avec les missions et branches (ils sont une lecture « par bénéficiaire » du même argent).
          </p>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Par bénéficiaire</CardTitle>
          </CardHeader>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={parBeneficiaire} dataKey="montant" nameKey="nom" label={false}>
                {parBeneficiaire.map((b) => (
                  <Cell key={b.beneficiaire} fill={COULEURS_BENEFICIAIRE[b.beneficiaire] ?? "#64748b"} />
                ))}
              </Pie>
              <Tooltip formatter={(v: unknown) => formatMdE(Number(v ?? 0))} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="grid grid-cols-2 gap-1 text-xs text-slate-300 lg:grid-cols-3">
            {parBeneficiaire.map((b) => (
              <li key={b.beneficiaire} className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: COULEURS_BENEFICIAIRE[b.beneficiaire] ?? "#64748b" }} />
                {b.nom} : {formatMdE(b.montant)}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Toutes les aides ({filtrees.length} affichées, {formatMdE(totalFiltre)})</CardTitle>
          <div className="flex items-end gap-3">
            <div>
              <Label htmlFor="filtre-beneficiaire">Bénéficiaire</Label>
              <Select
                id="filtre-beneficiaire"
                value={filtre}
                onChange={(e) => setFiltre(e.target.value as "tous" | AideSubvention["beneficiaire"])}
                className="mt-1"
              >
                <option value="tous">Tous</option>
                {(Object.keys(LABELS_BENEFICIAIRE) as AideSubvention["beneficiaire"][]).map((b) => (
                  <option key={b} value={b}>
                    {LABELS_BENEFICIAIRE[b]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="recherche-aide">Recherche</Label>
              <Input
                id="recherche-aide"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="RSA, CIR, livret A…"
                className="mt-1 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <Table>
          <thead>
            <tr>
              <Th>Dispositif</Th>
              <Th>Bénéficiaire</Th>
              <Th>Financeur</Th>
              <Th className="text-right">Montant / an</Th>
              <Th>Part</Th>
            </tr>
          </thead>
          <tbody>
            {filtrees.map((a) => (
              <tr key={a.id} className="hover:bg-slate-800/40">
                <Td>
                  <p className="font-medium">{a.nom}</p>
                  <p className="max-w-lg text-xs text-slate-500">{a.detail}</p>
                </Td>
                <Td>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: COULEURS_BENEFICIAIRE[a.beneficiaire] ?? "#64748b" }} />
                    {LABELS_BENEFICIAIRE[a.beneficiaire]}
                  </span>
                </Td>
                <Td className="text-xs text-slate-400">{a.financeur}</Td>
                <Td className="text-right font-semibold">{formatMdE(a.montant)}</Td>
                <Td className="w-28">
                  <span className="text-xs text-slate-400">{formatPct((a.montant / total) * 100)}</span>
                  <BarreProportion valeur={a.montant} total={total} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {cdc?.circuit ? (
        <Card>
          <CardHeader>
            <CardTitle>Comment fonctionne la Caisse des dépôts et consignations (CDC)</CardTitle>
            <Badge variant="rigide">{cdc.enjeu}</Badge>
          </CardHeader>
          <p className="max-w-4xl text-sm text-slate-300">{cdc.circuit.role}</p>
          <Separator className="my-4" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold text-blue-200">Le circuit de l'argent, étape par étape</h3>
              <ol className="space-y-2">
                {cdc.circuit.etapes.map((etape, i) => (
                  <li key={i} className="rounded-md border border-bord bg-slate-900/50 p-3 text-sm text-slate-300">
                    {etape}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-blue-200">Les fonds qu'elle gère</h3>
              <ul className="space-y-2">
                {cdc.circuit.fonds.map((fonds, i) => (
                  <li key={i} className="rounded-md border border-bord bg-slate-900/50 p-3 text-sm text-slate-300">
                    {fonds}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-4 text-xs text-amber-200/80">{cdc.avertissement}</p>
        </Card>
      ) : null}
    </div>
  );
}
