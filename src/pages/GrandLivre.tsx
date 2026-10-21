import { useMemo, useState } from "react";
import { Badge, Button, Card, CardHeader, CardTitle, Input, Label, Select, Switch, Table, Td, Th } from "@/components/ui";
import { MontantInput } from "@/components/MontantInput";
import { useGrandLivre, useScenarioActif } from "@/hooks";
import { useAppStore } from "@/store/useAppStore";
import { exporterCsv } from "@/lib/csv";
import { formatMdE, formatDelta } from "@/lib/format";
import type { Branche, Sens } from "@/types";

type Tri = "montant-desc" | "montant-asc" | "alpha";
type Groupement = "aucun" | "branche" | "categorie";

interface Ligne {
  id: string;
  nom: string;
  branche: Branche;
  sens: Sens;
  categorie: string;
  circuit: string;
  montantReferentiel: number;
  montant: number;
}

const BRANCHE_LABEL: Record<Branche, string> = {
  Etat: "État",
  SecuriteSociale: "Sécurité sociale",
  Collectivites: "Collectivités",
};

export function GrandLivre() {
  const toutes = useGrandLivre();
  const scenario = useScenarioActif();
  const dispatcher = useAppStore((s) => s.dispatcher);

  const [recherche, setRecherche] = useState("");
  const [filtreSens, setFiltreSens] = useState<"tous" | Sens>("tous");
  const [filtreBranche, setFiltreBranche] = useState<"toutes" | Branche>("toutes");
  const [tri, setTri] = useState<Tri>("montant-desc");
  const [groupement, setGroupement] = useState<Groupement>("aucun");
  const [notesVisibles, setNotesVisibles] = useState(false);

  const lignesFiltrees = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    const resultats = toutes.filter((l) => {
      if (filtreSens !== "tous" && l.sens !== filtreSens) return false;
      if (filtreBranche !== "toutes" && l.branche !== filtreBranche) return false;
      if (q.length > 0) {
        const haystack = `${l.nom} ${l.circuit} ${l.id}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    const tries = [...resultats];
    if (tri === "montant-desc") tries.sort((a, b) => b.montant - a.montant);
    else if (tri === "montant-asc") tries.sort((a, b) => a.montant - b.montant);
    else tries.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
    return tries;
  }, [toutes, recherche, filtreSens, filtreBranche, tri]);

  const groupes = useMemo(() => {
    if (groupement === "aucun") return [{ cle: null, lignes: lignesFiltrees }];
    const map = new Map<string, Ligne[]>();
    for (const l of lignesFiltrees) {
      const cle = groupement === "branche" ? BRANCHE_LABEL[l.branche] : l.categorie;
      const existant = map.get(cle) ?? [];
      existant.push(l);
      map.set(cle, existant);
    }
    return [...map.entries()].map(([cle, lignes]) => ({ cle, lignes }));
  }, [lignesFiltrees, groupement]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Grand livre</h2>
      <Card>
        <CardHeader>
          <CardTitle>Filtres ({lignesFiltrees.length} écritures affichées)</CardTitle>
          <Button onClick={() => exporterCsv(lignesFiltrees, "grand-livre-flux-publics.csv")}>
            Exporter CSV (filtré)
          </Button>
        </CardHeader>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label htmlFor="gl-recherche">Recherche plein texte</Label>
            <Input
              id="gl-recherche"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="TVA, pensions, ONDAM…"
              className="mt-1 w-64"
            />
          </div>
          <div>
            <Label htmlFor="gl-sens">Sens</Label>
            <Select id="gl-sens" value={filtreSens} onChange={(e) => setFiltreSens(e.target.value as "tous" | Sens)} className="mt-1">
              <option value="tous">Tous</option>
              <option value="recette">Recettes</option>
              <option value="depense">Dépenses</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="gl-branche">Branche</Label>
            <Select
              id="gl-branche"
              value={filtreBranche}
              onChange={(e) => setFiltreBranche(e.target.value as "toutes" | Branche)}
              className="mt-1"
            >
              <option value="toutes">Toutes</option>
              <option value="Etat">État</option>
              <option value="SecuriteSociale">Sécurité sociale</option>
              <option value="Collectivites">Collectivités</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="gl-tri">Tri</Label>
            <Select id="gl-tri" value={tri} onChange={(e) => setTri(e.target.value as Tri)} className="mt-1">
              <option value="montant-desc">Montant décroissant</option>
              <option value="montant-asc">Montant croissant</option>
              <option value="alpha">Alphabétique</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="gl-groupe">Groupement</Label>
            <Select
              id="gl-groupe"
              value={groupement}
              onChange={(e) => setGroupement(e.target.value as Groupement)}
              className="mt-1"
            >
              <option value="aucun">Aucun</option>
              <option value="branche">Par branche</option>
              <option value="categorie">Par catégorie</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="gl-notes" checked={notesVisibles} onCheckedChange={setNotesVisibles} />
            <Label htmlFor="gl-notes">Colonne de notes</Label>
          </div>
        </div>
      </Card>

      {groupes.map((groupe) => (
        <Card key={groupe.cle ?? "toutes"}>
          {groupe.cle ? (
            <CardHeader>
              <CardTitle>{groupe.cle}</CardTitle>
              <Badge>
                Sous-total : {formatMdE(groupe.lignes.reduce((a, l) => a + l.montant, 0))}
              </Badge>
            </CardHeader>
          ) : null}
          <Table>
            <thead>
              <tr>
                <Th>Écriture</Th>
                <Th>Branche</Th>
                <Th>Sens</Th>
                <Th className="text-right">Montant</Th>
                <Th>Édition</Th>
                <Th className="text-right">Écart vs référentiel</Th>
                {notesVisibles ? <Th>Note</Th> : null}
              </tr>
            </thead>
            <tbody>
              {groupe.lignes.map((l) => {
                const ecart = l.montant - l.montantReferentiel;
                return (
                  <tr key={l.id} className="hover:bg-slate-800/40">
                    <Td>
                      <p className="font-medium">{l.nom}</p>
                      <p className="text-xs text-slate-500">{l.circuit}</p>
                    </Td>
                    <Td>{BRANCHE_LABEL[l.branche]}</Td>
                    <Td>
                      <Badge variant={l.sens === "recette" ? "positif" : "negatif"}>
                        {l.sens === "recette" ? "recette" : "dépense"}
                      </Badge>
                    </Td>
                    <Td className="text-right font-semibold">{formatMdE(l.montant)}</Td>
                    <Td>
                      <MontantInput id={l.id} montantReferentiel={l.montantReferentiel} />
                    </Td>
                    <Td className={`text-right ${ecart === 0 ? "text-slate-500" : ecart > 0 ? "text-emerald-300" : "text-rose-300"}`}>
                      {ecart === 0 ? "—" : formatDelta(ecart)}
                    </Td>
                    {notesVisibles ? (
                      <Td className="w-64">
                        <input
                          type="text"
                          aria-label={`Note pour ${l.nom}`}
                          value={scenario.notes[l.id] ?? ""}
                          placeholder="Note…"
                          onChange={(e) => dispatcher({ type: "setNote", cle: l.id, note: e.target.value })}
                          className="w-full rounded-md border border-bord bg-slate-900 px-2 py-1 text-xs text-slate-100 placeholder:text-slate-600"
                        />
                      </Td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      ))}
    </div>
  );
}
