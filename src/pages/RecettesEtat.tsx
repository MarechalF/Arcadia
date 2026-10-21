import { Badge, Card, CardHeader, CardTitle, Table, Td, Th } from "@/components/ui";
import { MontantInput } from "@/components/MontantInput";
import { BarreProportion } from "@/components/BarreProportion";
import { useScenarioActif } from "@/hooks";
import { referentiel } from "@/data/referentiel";
import { valeur } from "@/lib/agregats";
import { formatMdE, formatPct } from "@/lib/format";

const CATEGORIE_LABEL: Record<string, string> = {
  fiscale: "Fiscale",
  non_fiscale: "Non fiscale",
  transfert: "Transfert (négatif)",
};

export function RecettesEtat() {
  const scenario = useScenarioActif();
  const total = referentiel.recettes.reduce((a, r) => a + valeur(r, scenario), 0);
  const totalFiscale = referentiel.recettes
    .filter((r) => r.categorie === "fiscale")
    .reduce((a, r) => a + valeur(r, scenario), 0);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Recettes de l'État</h2>
      <Card className="text-xs text-slate-400">
        Repères pédagogiques : les recettes fiscales ≈ {formatPct((totalFiscale / total) * 100)} des recettes
        nettes ; les prélèvements sur recettes (collectivités, UE) figurent en négatif car l'État
        reverse une part de ses recettes.
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Ligne par ligne (montants en Md€, éditables)</CardTitle>
        </CardHeader>
        <Table>
          <thead>
            <tr>
              <Th>Poste</Th>
              <Th>Catégorie</Th>
              <Th>Circuit (DGFiP → budget)</Th>
              <Th className="text-right">Montant</Th>
              <Th className="text-right">Édition</Th>
              <Th>Part</Th>
            </tr>
          </thead>
          <tbody>
            {referentiel.recettes.map((r) => {
              const montant = valeur(r, scenario);
              return (
                <tr key={r.id} className="hover:bg-slate-800/40">
                  <Td className="font-medium">{r.nom}</Td>
                  <Td>
                    <Badge>{CATEGORIE_LABEL[r.categorie]}</Badge>
                  </Td>
                  <Td className="max-w-sm text-xs text-slate-400">{r.detail}</Td>
                  <Td className="text-right font-semibold">{formatMdE(montant)}</Td>
                  <Td>
                    <MontantInput id={r.id} montantReferentiel={r.montant} ariaLabel={`Montant ${r.nom}`} />
                  </Td>
                  <Td className="w-32">
                    <span className="text-xs text-slate-400">{formatPct((montant / total) * 100)}</span>
                    <BarreProportion valeur={montant} total={total} />
                  </Td>
                </tr>
              );
            })}
            <tr className="font-bold">
              <Td colSpan={3}>Total recettes nettes</Td>
              <Td className="text-right">{formatMdE(total)}</Td>
              <Td colSpan={2} />
            </tr>
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
