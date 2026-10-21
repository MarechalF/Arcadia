import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge, Card, CardHeader, CardTitle, Table, Td, Th } from "@/components/ui";
import { MontantInput } from "@/components/MontantInput";
import { BarreProportion } from "@/components/BarreProportion";
import { useScenarioActif } from "@/hooks";
import { referentiel } from "@/data/referentiel";
import { sommeLignes, sommeProgrammes } from "@/lib/agregats";
import { formatDelta, formatMdE } from "@/lib/format";

export function DepensesMissions() {
  const scenario = useScenarioActif();
  const total = referentiel.missions.reduce((a, m) => a + sommeProgrammes(m, scenario), 0);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Dépenses & missions</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {referentiel.missions.map((m) => {
          const totalMission = sommeProgrammes(m, scenario);
          const totalLfi = m.programmes.reduce((a, p) => a + p.lignes.reduce((b, l) => b + l.montant, 0), 0);
          const delta = totalMission - totalLfi;
          return (
            <Link
              key={m.id}
              to={`/depenses/${m.id}`}
              className="rounded-xl border border-bord bg-carte p-4 transition-colors hover:border-blue-500"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">{m.nom}</p>
                {m.rigide ? <Badge variant="rigide">rigide</Badge> : null}
              </div>
              <p className="mt-2 text-2xl font-bold">{formatMdE(totalMission)}</p>
              {delta !== 0 ? (
                <Badge variant="delta" className="mt-1">
                  Δ {formatDelta(delta)} vs LFI
                </Badge>
              ) : (
                <p className="mt-1 text-xs text-slate-500">Conforme au LFI</p>
              )}
              <BarreProportion valeur={totalMission} total={total} className="mt-3" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function DetailMission() {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const scenario = useScenarioActif();
  const mission = referentiel.missions.find((m) => m.id === missionId);

  if (!mission) {
    return (
      <Card>
        <CardTitle>Mission introuvable</CardTitle>
        <button className="mt-2 text-blue-300 underline" onClick={() => navigate("/depenses")}>
          Retour aux missions
        </button>
      </Card>
    );
  }

  const totalMission = sommeProgrammes(mission, scenario);
  const totalLfi = mission.programmes.reduce(
    (a, p) => a + p.lignes.reduce((b, l) => b + l.montant, 0),
    0,
  );

  return (
    <div className="space-y-4">
      <nav aria-label="Fil d'Ariane" className="text-xs text-slate-400">
        <Link to="/depenses" className="text-blue-300 hover:underline">
          Dépenses & missions
        </Link>
        <span className="mx-1">/</span>
        <span>{mission.nom}</span>
      </nav>
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold">{mission.nom}</h2>
        {mission.rigide ? <Badge variant="rigide">rigide</Badge> : null}
      </div>
      <p className="max-w-2xl text-sm text-slate-400">{mission.description}</p>
      <Card>
        <CardHeader>
          <CardTitle>Programmes et lignes</CardTitle>
          <Badge variant="delta">
            Total {formatMdE(totalMission)} (Δ {formatDelta(totalMission - totalLfi)} vs LFI)
          </Badge>
        </CardHeader>
        <div className="space-y-4">
          {mission.programmes.map((p) => {
            const totalProg = sommeLignes(p, scenario);
            return (
              <div key={p.id}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-semibold">{p.nom}</p>
                  <p className="text-sm font-semibold text-slate-300">{formatMdE(totalProg)}</p>
                </div>
                <Table>
                  <thead>
                    <tr>
                      <Th>Ligne</Th>
                      <Th className="text-right">Référentiel</Th>
                      <Th className="text-right">Édition</Th>
                      <Th>Proportion du programme</Th>
                      <Th>Note</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.lignes.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-800/40">
                        <Td>{l.nom}</Td>
                        <Td className="text-right">{formatMdE(l.montant)}</Td>
                        <Td>
                          <MontantInput id={l.id} montantReferentiel={l.montant} />
                        </Td>
                        <Td className="w-40">
                          <BarreProportion valeur={l.montant} total={totalProg} />
                        </Td>
                        <Td className="w-64">
                          <NoteCell id={l.id} />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function NoteCell({ id }: { id: string }) {
  return <ImplNote id={id} />;
}

import { useAppStore } from "@/store/useAppStore";

function ImplNote({ id }: { id: string }) {
  const scenario = useScenarioActif();
  const dispatcher = useAppStore((s) => s.dispatcher);
  const note = scenario.notes[id] ?? "";
  return (
    <input
      type="text"
      aria-label={`Note pour ${id}`}
      value={note}
      placeholder="Note…"
      onChange={(e) => dispatcher({ type: "setNote", cle: id, note: e.target.value })}
      className="w-full rounded-md border border-bord bg-slate-900 px-2 py-1 text-xs text-slate-100 placeholder:text-slate-600"
    />
  );
}
