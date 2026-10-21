import { Badge, Card, CardHeader, CardTitle, Separator, Table, Td, Th } from "@/components/ui";
import { BarreProportion } from "@/components/BarreProportion";
import { useAgregats, useScenarioActif } from "@/hooks";
import { referentiel } from "@/data/referentiel";
import { ventilerParTitre } from "@/lib/agregats";
import { formatMdE, formatPct } from "@/lib/format";

const ETAPES_CIRCUIT = [
  {
    titre: "1. Le citoyen et l'entreprise paient",
    corps: [
      "Impôts et cotisations sont prélevés par la DGFiP (impôts) et les URSSAF/caisses (cotisations). Un salarié du privé « vit » d'abord avec ~22 % de cotisations patronales et ~22 % salariales sur son coût total employeur.",
      "L'impôt est un acte unilatéral de l'État ; la cotisation ouvre des droits (retraite, maladie). Cette distinction est centrale : réformer l'un n'a pas les mêmes effets que réformer l'autre.",
    ],
  },
  {
    titre: "2. La collecte et l'affectation",
    corps: [
      "Une partie des recettes est fléchée : la TVA alimente l'État, mais une fraction est affectée aux collectivités (PSR). La CSG alimente la Sécu. Certains impôts alimentent directement des opérateurs (taxes affectées à l'ADEME, à France Travail…).",
      "L'affectation protège la ressource du bénéficiaire — c'est pourquoi la réforme des recettes des opérateurs est si sensible politiquement.",
    ],
  },
  {
    titre: "3. Le vote : les lois de finances",
    corps: [
      "Le Parlement vote le budget de l'État (LFI) et celui de la Sécu (LFSS) séparément, chaque automne. Sans vote, le pays fonctionne en « continu » (loi spéciale, 12e provision).",
      "Les collectivités votent leur budget en début d'année, dans le cadre de la contrainte nationale (normes d'évolution de la dépense, règles d'équilibre).",
    ],
  },
  {
    titre: "4. L'exécution et la trésorerie",
    corps: [
      "L'État dépense via Chorus (comptabilité budgétaire) ; chaque ministère consomme ses crédits par programme. L'Agence France Trésor tient le « compte unique » du Trésor : toutes les recettes y arrivent, toutes les dépenses en repartent.",
      "La trésorerie est pilotée quotidiennement : l'État peut être momentanément en manque (rythme des dépenses > des recettes) et émet alors des BTF (bons du Trésor à court terme).",
    ],
  },
  {
    titre: "5. Les opérateurs exécutent la politique publique",
    corps: [
      "L'État délègue : subventions titre 6 aux opérateurs (ADEME, ANR, Bpifrance, France Travail…). C'est le « budget caché » : des milliards gérés hors des lignes de mission.",
      "La CDC joue ici un rôle unique : elle prête l'épargne populaire aux politiques publiques (logement social, hôpitaux, universités) — voir le volet détaillé plus bas.",
    ],
  },
  {
    titre: "6. Le contrôle et l'audit",
    corps: [
      "La Cour des comptes vérifie l'usage de l'argent public (comptes de l'État, certification, rapports thématiques). Le Parlement contrôle via les lois de règlement et les commissions d'enquête.",
      "L'IGF (inspection des finances) audit les réformes en amont. Le DEF (délégué interministériel) coordonne la trajectoire budgétaire pluriannuelle.",
    ],
  },
];

export function SuiviArgent() {
  const agregats = useAgregats();
  const scenario = useScenarioActif();
  const ventilation = ventilerParTitre(referentiel, scenario);
  const totalEtapes = agregats.totalRecettes;
  const cdc = referentiel.operateurs.find((o) => o.id === "op-cdc");

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Suivi complet de l'argent public — du prélèvement à l'usage</h2>
      <Card className="text-xs text-slate-400">
        Le trajet de chaque euro : prélèvement → vote → trésorerie (AFT/Chorus) → opérateurs et bénéficiaires →
        contrôle (Cour des comptes). Tous les montants réagissent au scénario actif « {scenario.nom} ».
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vue d'ensemble : {formatMdE(totalEtapes)} de recettes publiques suivies</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {[
            { nom: "Recettes de l'État", montant: agregats.etat.recettes },
            { nom: "Recettes Sécu (cotisations, CSG…)", montant: agregats.secu.recettes },
            { nom: "Recettes collectivités", montant: agregats.collectivites.recettes },
            { nom: "Dépenses de l'État", montant: agregats.etat.depenses },
            { nom: "Dépenses Secu (pensions, ONDAM…)", montant: agregats.secu.depenses },
            { nom: "Dépenses collectivités", montant: agregats.collectivites.depenses },
          ].map((x) => (
            <div key={x.nom} className="rounded-md border border-bord p-3">
              <p className="text-xs text-slate-400">{x.nom}</p>
              <p className="text-lg font-bold">{formatMdE(x.montant)}</p>
              <BarreProportion valeur={Math.abs(x.montant)} total={totalEtapes} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Le circuit de l'argent, étape par étape</CardTitle>
          <Badge>{ETAPES_CIRCUIT.length} étapes</Badge>
        </CardHeader>
        <div className="space-y-3">
          {ETAPES_CIRCUIT.map((etape) => (
            <div key={etape.titre} className="rounded-lg border border-bord bg-slate-900/50 p-3">
              <h3 className="font-semibold text-blue-200">{etape.titre}</h3>
              {etape.corps.map((p, i) => (
                <p key={i} className="mt-1 text-sm text-slate-300">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Structure réelle de la dépense de l'État (titres budgétaires)</CardTitle>
        </CardHeader>
        <Table>
          <thead>
            <tr>
              <Th>Titre</Th>
              <Th className="text-right">Montant</Th>
              <Th>Part de la dépense État</Th>
            </tr>
          </thead>
          <tbody>
            {ventilation.map((t) => (
              <tr key={t.titre} className="hover:bg-slate-800/40">
                <Td>{t.nom}</Td>
                <Td className="text-right font-semibold">{formatMdE(t.total)}</Td>
                <Td className="w-48">
                  <span className="text-xs text-slate-400">{formatPct((t.total / agregats.etat.depenses) * 100)}</span>
                  <BarreProportion valeur={t.total} total={agregats.etat.depenses} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {cdc?.circuit ? (
        <Card>
          <CardHeader>
            <CardTitle>La Caisse des dépôts et consignations — le compte unique de l'épargne publique</CardTitle>
            <Badge variant="rigide">{cdc.enjeu}</Badge>
          </CardHeader>
          <p className="max-w-4xl text-sm text-slate-300">{cdc.circuit.role}</p>
          <Separator className="my-4" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold text-blue-200">Circuit détaillé : de ton livret A au logement social</h3>
              <ol className="space-y-2">
                {cdc.circuit.etapes.map((etape, i) => (
                  <li key={i} className="rounded-md border border-bord bg-slate-900/50 p-3 text-sm text-slate-300">
                    {etape}
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-blue-200">Les fonds gérés (détail et enjeux)</h3>
              <ul className="space-y-2">
                {cdc.circuit.fonds.map((fonds, i) => (
                  <li key={i} className="rounded-md border border-bord bg-slate-900/50 p-3 text-sm text-slate-300">
                    {fonds}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Separator className="my-4" />
          <div>
            <h3 className="mb-2 font-semibold text-blue-200">Pourquoi c'est un pilier du suivi de l'argent public</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
              <li><strong>Transit obligatoire :</strong> les banques <em>doivent</em> y déposer les fonds du livret A — la CDC est un point de passage obligé de l'épargne populaire, ce qui rend son suivi essentiel.</li>
              <li><strong>Prêteur des politiques publiques :</strong> logement social, hôpitaux, universités, PME : une grande partie de l'« investissement public » passe en réalité par des prêts CDC, pas par le budget de l'État.</li>
              <li><strong>Organisme de consignation :</strong> les fonds des tribunaux, notaires, administrateurs y sont déposés « sous séquestre » : la CDC protège les tiers, elle ne dépense pas cet argent.</li>
              <li><strong>Indépendance de gestion :</strong> elle ne vit pas du budget de l'État — elle vit des revenus de ses placements. Sa gouvernance (contrôle Parlement/Cour des comptes) garantit que l'épargne n'est pas détournée vers des usages politiques non mandatés.</li>
              <li><strong>Dividende inversé :</strong> elle reverse 100 % de son résultat à l'État (~2 Md€/an) : un « flux » rare dans le circuit, où l'argent remonte vers le budget au lieu d'en partir.</li>
            </ul>
          </div>
          <p className="mt-4 text-xs text-amber-200/80">{cdc.avertissement}</p>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Où va réellement l'argent — du grossiste au détail</CardTitle>
        </CardHeader>
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-lg border border-bord p-3">
            <h4 className="font-semibold text-blue-200">Grossiste : les missions</h4>
            <p className="text-sm text-slate-300">13 missions votées au Parlement (enseignement, défense, dette…). Ce niveau est politique : c'est là que se négocient les priorités.</p>
          </div>
          <div className="rounded-lg border border-bord p-3">
            <h4 className="font-semibold text-blue-200">Demi-détail : les programmes</h4>
            <p className="text-sm text-slate-300">~150 programmes dirigés par un responsable (un haut fonctionnaire, un directeur d'administration). C'est le niveau de la responsabilité d'exécution.</p>
          </div>
          <div className="rounded-lg border border-bord p-3">
            <h4 className="font-semibold text-blue-200">Détail : les lignes et actions</h4>
            <p className="text-sm text-slate-300">Titre 2/3/6/7 par action : c'est le niveau audité par la Cour des comptes et le niveau que cette application rend éditable dans le grand livre.</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Astuce d'audit : pour suivre précisément un euro, le grand livre (~120 écritures) permet de filtrer par branche et catégorie, et d'exporter en CSV pour analyse externe.
        </p>
      </Card>
    </div>
  );
}
