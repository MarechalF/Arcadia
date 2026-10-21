import { useMemo, useState } from "react";
import { Badge, Button, Card, CardHeader, CardTitle, Input, Label, Table, Td, Th } from "@/components/ui";
import { BarreProportion } from "@/components/BarreProportion";
import { referentiel } from "@/data/referentiel";
import { parserCsvExecution, rapprocher } from "@/lib/execution";
import { formatMdE, formatPct } from "@/lib/format";
import type { LigneExecution } from "@/types";

const MODELE_CSV = `mission;programme;montant (M€)
Enseignement scolaire;Second degré public;33000
Défense;Equipement des forces;16000
Travail et emploi;Insertion et emploi;15000`;

export function ExecutionReelle() {
  const [periode, setPeriode] = useState("2025 — cumul");
  const [executions, setExecutions] = useState<LigneExecution[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [nomFichier, setNomFichier] = useState<string>("");

  const entitesReferentiel = useMemo(
    () =>
      referentiel.missions.flatMap((m) =>
        m.programmes.map((p) => ({
          id: p.id,
          nom: p.nom,
          montant: p.lignes.reduce((a, l) => a + l.montant, 0),
        })),
      ),
    [],
  );

  const comparaisons = useMemo(
    () => (executions.length > 0 ? rapprocher(entitesReferentiel, executions) : []),
    [entitesReferentiel, executions],
  );

  function importerFichier(fichier: File) {
    setErreur(null);
    void fichier.text().then((contenu) => {
      const lignes = parserCsvExecution(contenu, periode);
      if (lignes.length === 0) {
        setErreur("Aucune ligne reconnue dans ce fichier. Vérifie le format (séparateur ; ou , avec une colonne de montants).");
      } else {
        setExecutions(lignes);
        setNomFichier(fichier.name);
      }
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Exécution réelle — LFI vs dépenses constatées</h2>
      <Card className="text-xs text-slate-400">
        Importe l'exécution budgétaire réelle (agrégat mensuel Chorus par programme, téléchargeable sur data.gouv.fr
        — jeu « dépenses de l'État par mission/programme »). L'application rapproche chaque ligne du fichier avec
        les programmes du référentiel et calcule le taux de consommation (exécution / LFI).
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Importer un fichier d'exécution (CSV)</CardTitle>
          {nomFichier ? <Badge variant="positif">{nomFichier} — {executions.length} lignes</Badge> : null}
        </CardHeader>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label htmlFor="periode-exec">Période (ex. « 2025 — cumul novembre »)</Label>
            <Input
              id="periode-exec"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="mt-1 w-64"
            />
          </div>
          <div>
            <Label htmlFor="fichier-exec">Fichier CSV</Label>
            <input
              id="fichier-exec"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const fichier = e.target.files?.[0];
                if (fichier) importerFichier(fichier);
              }}
              className="mt-1 block w-72 text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-sm file:text-slate-200 hover:file:bg-slate-700"
            />
          </div>
          <Button variant="ghost" onClick={() => setExecutions([])}>Effacer l'import</Button>
        </div>
        {erreur ? <p className="mt-3 text-sm text-rose-300">{erreur}</p> : null}
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-slate-500">Voir le format attendu (exemple)</summary>
          <pre className="mt-2 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-300">{MODELE_CSV}</pre>
        </details>
      </Card>

      {comparaisons.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Consommation des crédits ({comparaisons.length} programmes rapprochés)</CardTitle>
            <Badge>trié par taux de consommation décroissant</Badge>
          </CardHeader>
          <Table>
            <thead>
              <tr>
                <Th>Programme</Th>
                <Th className="text-right">LFI (Md€)</Th>
                <Th className="text-right">Exécution (Md€)</Th>
                <Th className="text-right">Taux</Th>
                <Th>Lecture</Th>
              </tr>
            </thead>
            <tbody>
              {comparaisons.map((c) => {
                const alerte = c.taux > 1.05 ? "dépassement" : c.taux > 0.98 ? "consommation complète" : c.taux < 0.7 ? "sous-consommation" : "normal";
                return (
                  <tr key={c.entiteId} className="hover:bg-slate-800/40">
                    <Td className="font-medium">{c.nom}</Td>
                    <Td className="text-right">{formatMdE(c.lfi)}</Td>
                    <Td className="text-right">{formatMdE(c.execute)}</Td>
                    <Td className={`text-right font-bold ${c.taux > 1.05 ? "text-rose-300" : c.taux < 0.7 ? "text-amber-300" : "text-emerald-300"}`}>
                      {formatPct(c.taux * 100)}
                    </Td>
                    <Td className="w-40">
                      <Badge variant={c.taux > 1.05 ? "negatif" : c.taux < 0.7 ? "rigide" : "positif"}>{alerte}</Badge>
                      <BarreProportion valeur={Math.min(c.taux, 1.2)} total={1.2} />
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      ) : (
        <Card>
          <p className="text-sm text-slate-400">
            Aucune exécution importée pour l'instant. Récupère le fichier sur data.gouv.fr
            (recherche : « Chorus dépenses par mission programme »), puis importe-le ci-dessus.
          </p>
        </Card>
      )}

      <Card>
        <CardTitle>Comment lire les écarts</CardTitle>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-400">
          <li><strong className="text-rose-300">Taux &gt; 105 %</strong> : dépassement — crédits supplémentaires votés en LFR ou transferts entre programmes.</li>
          <li><strong className="text-emerald-300">98-105 %</strong> : consommation normale en fin d'année.</li>
          <li><strong className="text-amber-300">&lt; 70 %</strong> : sous-consommation — gels, reports, ou crédits non engageables en fin de gestion.</li>
          <li>Le rapprochement se fait par similarité de nom : renomme les libellés du CSV si certaines lignes ne matchent pas.</li>
        </ul>
      </Card>
    </div>
  );
}
