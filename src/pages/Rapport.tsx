import { useMemo, useState } from "react";
import { Badge, Button, Card, CardHeader, CardTitle, Input, Label, Separator } from "@/components/ui";
import { useScenarioActif } from "@/hooks";
import { referentiel } from "@/data/referentiel";
import { ecartObjectif, evaluerReforme } from "@/lib/reformes";
import { useAppStore } from "@/store/useAppStore";
import { formatDelta, formatMdE, formatPct } from "@/lib/format";

const CATEGORIES_LABEL: Record<string, string> = {
  fiscalite: "Fiscalité",
  depenses: "Dépenses de l'État",
  "securite-sociale": "Sécurité sociale",
  aide: "Aides",
  investissement: "Investissement",
};

export function Rapport() {
  const scenario = useScenarioActif();
  const dispatcher = useAppStore((s) => s.dispatcher);
  const [titre, setTitre] = useState("Proposition de trajectoire budgétaire");
  const selection = scenario.mesures ?? [];

  const mesuresChoisies = useMemo(
    () => referentiel.mesures.filter((m) => selection.includes(m.id)),
    [selection],
  );
  const evaluation = useMemo(() => evaluerReforme(mesuresChoisies, scenario), [mesuresChoisies, scenario]);
  const soldeFinal = evaluation.agregatsRecalcules.soldePublic;
  const objectif = ecartObjectif(soldeFinal, -3);
  const dette10ans = evaluation.trajectoire.points[9]?.dettePctPib ?? referentiel.macro.dettePct;

  const rapportMarkdown = useMemo(() => {
    const lignes: string[] = [];
    lignes.push(`# ${titre}`);
    lignes.push("");
    lignes.push(`**Millésime des données :** ${referentiel.millésime}  `);
    lignes.push(`**Scénario de base :** ${scenario.nom} (mesures enregistrées dans le scénario)  `);
    lignes.push(`**Généré le :** ${new Date().toLocaleDateString("fr-FR")}`);
    lignes.push("");
    lignes.push("## Synthèse");
    lignes.push("");
    lignes.push(`- Impact des mesures sur le solde : **${formatDelta(evaluation.impactTotal)}/an**`);
    lignes.push(`- Solde public projeté : **${formatMdE(soldeFinal)}** (${formatPct((soldeFinal / referentiel.macro.pib) * 100)} du PIB)`);
    lignes.push(`- Dette publique à 10 ans : **${formatPct(dette10ans)}** (vs ${formatPct(referentiel.macro.dettePct)} en 2026) — diagnostic : ${evaluation.trajectoire.diagnostic}`);
    lignes.push(`- Effet PIB à 5 ans (indicatif) : **${formatDelta(evaluation.effetPib5ansPct)} %**`);
    if (evaluation.coutTransition) {
      lignes.push(`- Coût de transition : **${formatDelta(evaluation.coutTransition.montant)}/an pendant ${evaluation.coutTransition.dureeAnnees} ans**`);
    }
    lignes.push(`- Objectif −3 % du PIB : ${objectif.ecartMdE <= 0 ? `**atteint** (marge ${formatMdE(-objectif.ecartMdE)})` : `**non atteint**, il manque ${formatMdE(objectif.ecartMdE)}/an`}`);
    lignes.push("");
    lignes.push("## Mesures proposées");
    lignes.push("");
    for (const m of mesuresChoisies) {
      lignes.push(`### ${m.nom}`);
      lignes.push("");
      lignes.push(`- Catégorie : ${CATEGORIES_LABEL[m.categorie] ?? m.categorie}`);
      lignes.push(`- Impact solde : **${formatDelta(m.impactSolde)}/an**`);
      if (m.effetPib5ansPct !== undefined) lignes.push(`- Effet PIB 5 ans : ${formatDelta(m.effetPib5ansPct)} %`);
      if (m.coutTransition) lignes.push(`- Transition : ${formatDelta(m.coutTransition.montant)}/an pendant ${m.coutTransition.dureeAnnees} ans`);
      lignes.push(`- Chiffrage : ${m.detail}`);
      lignes.push("");
      if (m.contreArguments.length > 0) {
        lignes.push("**Points de vigilance :**");
        lignes.push("");
        for (const c of m.contreArguments) lignes.push(`- ${c}`);
        lignes.push("");
      }
    }
    if (evaluation.effetSecondTour) {
      lignes.push("## Effets de second tour à anticiper");
      lignes.push("");
      lignes.push(`- ${evaluation.effetSecondTour.enonce}`);
      lignes.push("");
    }
    lignes.push("## Notes de méthode");
    lignes.push("");
    lignes.push("- Les chiffrages sont des **ordres de grandeur sourcés** (Sénat, Cour des comptes, COR, France Stratégie), pas des chiffrages officiels : ils dépendent du périmètre exact de chaque mesure.");
    lignes.push("- Les multiplicateurs budgétaires agrégés sont linéaires — la réalité est non linéaire (goulots d'étranglement, capacité d'absorption).");
    lignes.push("- Les coûts de transition s'ajoutent au solde pendant leurs années de mise en œuvre et ne sont pas décomptés du solde projeté de régime.");
    lignes.push("- Données indicatives : le détail réel de l'exécution est publié mensuellement (Chorus, data.gouv.fr).");
    return lignes.join("\n");
  }, [titre, scenario, mesuresChoisies, evaluation, soldeFinal, objectif, dette10ans]);

  function exporterRapport() {
    const blob = new Blob([rapportMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `${titre.replace(/\s+/g, "-").toLowerCase()}.md`;
    lien.click();
    URL.revokeObjectURL(url);
  }

  function copierRapport() {
    void navigator.clipboard.writeText(rapportMarkdown);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Rapport de réforme — note prête à présenter</h2>
      <Card className="text-xs text-slate-400">
        Génère une note de synthèse en Markdown : mesures, chiffrages, trajectoire de dette, points de vigilance
        et notes de méthode. Exportable en fichier ou copiable pour un mail/document.
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mesures à inclure</CardTitle>
          <div className="flex items-end gap-3">
            <div>
              <Label htmlFor="titre-rapport">Titre du rapport</Label>
              <Input
                id="titre-rapport"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                className="mt-1 w-80"
              />
            </div>
          </div>
        </CardHeader>
        <div className="flex flex-wrap gap-2">
          {referentiel.mesures.map((m) => {
            const coche = selection.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={coche}
                onClick={() => dispatcher({ type: "basculerMesure", mesureId: m.id })}
                className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${coche ? "border-blue-500 bg-blue-950/50 text-blue-100" : "border-bord bg-slate-900/50 text-slate-300 hover:border-slate-500"}`}
              >
                {coche ? "✓ " : ""}
                {m.nom} ({formatDelta(m.impactSolde)})
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="primary" onClick={exporterRapport}>
            Exporter en Markdown (.md)
          </Button>
          <Button onClick={copierRapport}>Copier dans le presse-papier</Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aperçu du rapport</CardTitle>
          <Badge>
            {mesuresChoisies.length} mesure(s) · impact {formatDelta(evaluation.impactTotal)}/an
          </Badge>
        </CardHeader>
        <Separator className="mb-3" />
        <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-4 text-xs leading-relaxed text-slate-200">
          {rapportMarkdown}
        </pre>
      </Card>
    </div>
  );
}
