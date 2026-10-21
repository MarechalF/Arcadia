import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Card, CardHeader, CardTitle, Table, Td, Th } from "@/components/ui";
import { useScenarioActif } from "@/hooks";
import { referentiel } from "@/data/referentiel";
import { calculerAgregats, sommeProgrammes, sommePostes, valeur } from "@/lib/agregats";
import { scenarioLfi } from "@/store/scenarios";
import { formatDelta, formatMdE } from "@/lib/format";

const scenarioReference = scenarioLfi;

export function Comparateur() {
  const scenario = useScenarioActif();

  const lfi = useMemo(() => calculerAgregats(referentiel, scenarioReference), []);
  const actuel = useMemo(() => calculerAgregats(referentiel, scenario), [scenario]);

  const donneesBarres = [
    { nom: "Recettes État", LFI: lfi.etat.recettes, Scénario: actuel.etat.recettes },
    { nom: "Dépenses État", LFI: lfi.etat.depenses, Scénario: actuel.etat.depenses },
    { nom: "Solde État", LFI: lfi.etat.solde, Scénario: actuel.etat.solde },
    { nom: "Recettes Sécu", LFI: lfi.secu.recettes, Scénario: actuel.secu.recettes },
    { nom: "Dépenses Sécu", LFI: lfi.secu.depenses, Scénario: actuel.secu.depenses },
    { nom: "Solde Sécu", LFI: lfi.secu.solde, Scénario: actuel.secu.solde },
    { nom: "Solde Collectivités", LFI: lfi.collectivites.solde, Scénario: actuel.collectivites.solde },
    { nom: "Solde public", LFI: lfi.soldePublic, Scénario: actuel.soldePublic },
  ];

  const missionsModifiees = useMemo(
    () =>
      referentiel.missions
        .map((m) => {
          const totalLfi = m.programmes.reduce((a, p) => a + p.lignes.reduce((b, l) => b + l.montant, 0), 0);
          const total = sommeProgrammes(m, scenario);
          return { nom: m.nom, LFI: totalLfi, Scénario: total, delta: total - totalLfi };
        })
        .filter((m) => m.delta !== 0)
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)),
    [scenario],
  );

  const recettesModifiees = referentiel.recettes.filter((r) => valeur(r, scenario) !== r.montant);
  const secuModifiees = [
    ...referentiel.securiteSociale.recettes.filter((p) => valeur(p, scenario) !== p.montant),
    ...referentiel.securiteSociale.depenses.filter((p) => valeur(p, scenario) !== p.montant),
  ];
  const colModifiees = [
    ...referentiel.collectivites.recettes.filter((p) => valeur(p, scenario) !== p.montant),
    ...referentiel.collectivites.depenses.filter((p) => valeur(p, scenario) !== p.montant),
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Comparateur de scénarios</h2>
      <p className="text-sm text-slate-400">
        Scénario actif : <span className="text-blue-300">{scenario.nom}</span> vs référentiel « LFI 2026 ».
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Agrégats clés — LFI vs scénario</CardTitle>
        </CardHeader>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={donneesBarres}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2b45" />
            <XAxis dataKey="nom" tick={{ fontSize: 10 }} interval={0} angle={-20} height={60} />
            <YAxis tickFormatter={(v: number) => `${v}`} />
            <Tooltip formatter={(v: unknown) => formatMdE(Number(v))} />
            <Legend />
            <Bar dataKey="LFI" fill="#475569" />
            <Bar dataKey="Scénario" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Écarts par mission (uniquement les modifiées)</CardTitle>
          {missionsModifiees.length === 0 ? <Badge>Aucune mission modifiée</Badge> : null}
        </CardHeader>
        {missionsModifiees.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(160, missionsModifiees.length * 36)}>
            <BarChart data={missionsModifiees} layout="vertical" margin={{ left: 150 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="nom" width={150} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: unknown) => formatDelta(Number(v))} />
              <Bar dataKey="delta">
                {missionsModifiees.map((m) => (
                  <Cell key={m.nom} fill={m.delta > 0 ? "#f87171" : "#34d399"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : null}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tableau des deltas</CardTitle>
        </CardHeader>
        <Table>
          <thead>
            <tr>
              <Th>Élément</Th>
              <Th className="text-right">LFI 2026</Th>
              <Th className="text-right">Scénario</Th>
              <Th className="text-right">Delta</Th>
            </tr>
          </thead>
          <tbody>
            {missionsModifiees.map((m) => (
              <LigneDelta key={m.nom} nom={m.nom} lfi={m.LFI} actuel={m.Scénario} />
            ))}
            {recettesModifiees.map((r) => (
              <LigneDelta key={r.id} nom={`Recette — ${r.nom}`} lfi={r.montant} actuel={valeur(r, scenario)} />
            ))}
            {secuModifiees.map((p) => (
              <LigneDelta key={p.id} nom={`Sécu — ${p.nom}`} lfi={p.montant} actuel={valeur(p, scenario)} />
            ))}
            {colModifiees.map((p) => (
              <LigneDelta key={p.id} nom={`Collectivités — ${p.nom}`} lfi={p.montant} actuel={valeur(p, scenario)} />
            ))}
            <tr className="font-bold">
              <Td>Solde public total</Td>
              <Td className="text-right">{formatMdE(lfi.soldePublic)}</Td>
              <Td className="text-right">{formatMdE(actuel.soldePublic)}</Td>
              <Td className={`text-right ${actuel.soldePublic - lfi.soldePublic >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                {formatDelta(actuel.soldePublic - lfi.soldePublic)}
              </Td>
            </tr>
          </tbody>
        </Table>
        <p className="mt-3 text-xs text-slate-500">
          Recettes Sécu référentiel : {formatMdE(sommePostes(referentiel.securiteSociale, "recette", scenarioReference))} —
          dépenses : {formatMdE(sommePostes(referentiel.securiteSociale, "depense", scenarioReference))}.
        </p>
      </Card>
    </div>
  );
}

function LigneDelta({ nom, lfi, actuel }: { nom: string; lfi: number; actuel: number }) {
  const delta = actuel - lfi;
  return (
    <tr className="hover:bg-slate-800/40">
      <Td>{nom}</Td>
      <Td className="text-right">{formatMdE(lfi)}</Td>
      <Td className="text-right">{formatMdE(actuel)}</Td>
      <Td className={`text-right ${delta > 0 ? "text-rose-300" : "text-emerald-300"}`}>
        {delta === 0 ? "—" : formatDelta(delta)}
      </Td>
    </tr>
  );
}
