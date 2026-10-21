import { useMemo } from "react";
import { Tooltip as SankeyTooltip, Rectangle, Sankey } from "recharts";
import { Badge, Card, CardHeader, CardTitle, Label, Select } from "@/components/ui";
import { useScenarioActif } from "@/hooks";
import { referentiel } from "@/data/referentiel";
import { construireSankey } from "@/lib/agregats";
import { formatMdE } from "@/lib/format";
import { useState } from "react";

const COULEURS_NOEUDS = ["#60a5fa", "#34d399", "#f472b6", "#f59e0b", "#a78bfa", "#22d3ee"];

export function FluxSankeyPage() {
  const scenario = useScenarioActif();
  const [seuil, setSeuil] = useState(10);

  const data = useMemo(() => {
    const flux = construireSankey(referentiel, scenario, seuil);
    return {
      nodes: flux.noms.map((nom) => ({ name: nom })),
      links: flux.liens.map((l) => ({ source: l.source, target: l.cible, value: l.valeur })),
    };
  }, [scenario, seuil]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Où va chaque euro — diagramme de flux</h2>
      <Card className="text-xs text-slate-400">
        Les recettes de l'État et les transferts entre branches convergent vers les dépenses. Les flux
        inférieurs au seuil sont regroupés visuellement pour la lisibilité (ils restent comptés dans les
        totaux). Flux simplifiés : toutes les recettes de l'État arrivent au budget général avant
        d'être réparties.
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Flux recettes → branches → dépenses (seuil {seuil} Md€)</CardTitle>
          <div>
            <Label htmlFor="seuil-sankey">Seuil de lisibilité (Md€)</Label>
            <Select
              id="seuil-sankey"
              value={String(seuil)}
              onChange={(e) => setSeuil(Number(e.target.value))}
              className="mt-1"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="40">40</option>
            </Select>
          </div>
        </CardHeader>
        <Sankey
          width={1100}
          height={620}
          data={data}
          node={<Rectangle fill={COULEURS_NOEUDS[0]} fillOpacity={0.9} />}
          nodePadding={18}
          nodeWidth={12}
          margin={{ left: 180, right: 200, top: 10, bottom: 10 }}
        >
          <SankeyTooltip
            formatter={(v: unknown) => formatMdE(Number(v ?? 0))}
            labelFormatter={(nom: unknown) => String(nom)}
          />
        </Sankey>
        <p className="mt-2 text-xs text-slate-500">
          {data.nodes.length} nœuds, {data.links.length} flux affichés. Survolez un flux pour voir son montant.
        </p>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Précautions de lecture</CardTitle>
          <Badge variant="rigide">simplification pédagogique</Badge>
        </CardHeader>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
          <li>Les prélèvements sur recettes (PSR collectivités, UE) sont des flux négatifs côté État : ils n'apparaissent qu'en négatif dans le grand livre.</li>
          <li>Le transfert État → Sécu correspond au poste « Transferts de l'État » du référentiel LFSS.</li>
          <li>Les recettes des collectivités (fiscalité transférée, dotations, FCTVA) proviennent pour partie de l'État : le Sankey n'inclut ces flux que via la branche État pour rester lisible.</li>
        </ul>
      </Card>
    </div>
  );
}
