import { Badge, Card, CardHeader, CardTitle, Table, Td, Th } from "@/components/ui";
import { MontantInput } from "@/components/MontantInput";
import { BarreProportion } from "@/components/BarreProportion";
import { useScenarioActif } from "@/hooks";
import { referentiel } from "@/data/referentiel";
import { sommePostes, valeur } from "@/lib/agregats";
import { formatMdE } from "@/lib/format";
import type { BrancheData } from "@/types";

interface Props {
  titre: string;
  avertissement: string;
  data: BrancheData;
}

function PageBranche({ titre, avertissement, data }: Props) {
  const scenario = useScenarioActif();
  const totalRecettes = sommePostes(data, "recette", scenario);
  const totalDepenses = sommePostes(data, "depense", scenario);
  const solde = totalRecettes - totalDepenses;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{titre}</h2>
      <Card className="text-xs text-slate-400">{avertissement}</Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recettes</CardTitle>
            <Badge variant="positif">{formatMdE(totalRecettes)}</Badge>
          </CardHeader>
          <Table>
            <thead>
              <tr>
                <Th>Poste</Th>
                <Th className="text-right">Édition</Th>
                <Th>Proportion</Th>
              </tr>
            </thead>
            <tbody>
              {data.recettes.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40">
                  <Td>
                    <p className="font-medium">{p.nom}</p>
                    <p className="text-xs text-slate-500">{p.detail}</p>
                  </Td>
                  <Td>
                    <MontantInput id={p.id} montantReferentiel={p.montant} />
                  </Td>
                  <Td className="w-32">
                    <span className="text-xs text-slate-400">{formatMdE(valeur(p, scenario))}</span>
                    <BarreProportion valeur={valeur(p, scenario)} total={totalRecettes} couleur="bg-emerald-500" />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dépenses</CardTitle>
            <Badge variant="negatif">{formatMdE(totalDepenses)}</Badge>
          </CardHeader>
          <Table>
            <thead>
              <tr>
                <Th>Poste</Th>
                <Th className="text-right">Édition</Th>
                <Th>Proportion</Th>
              </tr>
            </thead>
            <tbody>
              {data.depenses.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40">
                  <Td>
                    <p className="font-medium">{p.nom}</p>
                    <p className="text-xs text-slate-500">{p.detail}</p>
                  </Td>
                  <Td>
                    <MontantInput id={p.id} montantReferentiel={p.montant} />
                  </Td>
                  <Td className="w-32">
                    <span className="text-xs text-slate-400">{formatMdE(valeur(p, scenario))}</span>
                    <BarreProportion valeur={valeur(p, scenario)} total={totalDepenses} couleur="bg-rose-500" />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
      <Card>
        <CardTitle>Solde de la branche</CardTitle>
        <p className={`mt-2 text-2xl font-bold ${solde >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
          {formatMdE(solde)}
        </p>
        <p className="text-xs text-slate-500">
          {formatMdE(totalRecettes)} de recettes − {formatMdE(totalDepenses)} de dépenses
        </p>
      </Card>
    </div>
  );
}

export function SecuriteSociale() {
  return (
    <PageBranche
      titre="Sécurité sociale (LFSS)"
      avertissement="La Sécurité sociale est votée en LFSS (loi de financement de la Sécurité sociale), pas dans la loi de finances : ses dépenses ne figurent pas au budget de l'État."
      data={referentiel.securiteSociale}
    />
  );
}

export function Collectivites() {
  return (
    <PageBranche
      titre="Collectivités territoriales"
      avertissement="Ordres de grandeur agrégés pour l'ensemble des collectivités (communes, départements, régions) : les recettes incluent des transferts de l'État déjà comptés côté État."
      data={referentiel.collectivites}
    />
  );
}
