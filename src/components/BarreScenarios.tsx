import { useState } from "react";
import { Badge, Button, Card, Input, Label, Select } from "./ui";
import { useAppStore, SCENARIO_LFI_ID } from "@/store/useAppStore";

/** Barre de gestion des scénarios, présente sur toutes les pages. */
export function BarreScenarios() {
  const scenariosStore = useAppStore((s) => s.scenarios);
  const actifId = useAppStore((s) => s.scenarioActifId);
  const dispatcher = useAppStore((s) => s.dispatcher);
  const [nouveauNom, setNouveauNom] = useState("");
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const actifList = scenariosStore.length > 0 ? scenariosStore : [{ id: "lfi-2026", nom: "LFI 2026", dateCreation: "", overrides: {}, notes: {} }];
  const actif = actifList.find((s) => s.id === actifId) ?? actifList.at(0);

  if (!actif) {
    return (
      <Card className="mb-4">
        <p className="text-sm text-slate-400">Aucun scénario disponible.</p>
      </Card>
    );
  }
  const actifSure = actif;
  const nbOverrides = Object.keys(actifSure.overrides).length;

  function exporterScenario() {
    const blob = new Blob([JSON.stringify(actifSure, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `${actifSure.nom.replace(/\s+/g, "-").toLowerCase()}.json`;
    lien.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="mb-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label htmlFor="scenario-actif">Scénario actif</Label>
          <Select
            id="scenario-actif"
            value={actifId}
            onChange={(e) => dispatcher({ type: "activer", id: e.target.value })}
            className="mt-1"
          >
            {actifList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom}
                {s.id === SCENARIO_LFI_ID ? " (verrouillé)" : ""}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="nouveau-scenario">Nouveau scénario</Label>
          <div className="mt-1 flex gap-2">
            <Input
              id="nouveau-scenario"
              value={nouveauNom}
              placeholder="Nom du scénario"
              onChange={(e) => setNouveauNom(e.target.value)}
            />
            <Button
              variant="primary"
              disabled={nouveauNom.trim().length === 0}
              onClick={() => {
                dispatcher({ type: "creer", nom: nouveauNom.trim(), base: actifId });
                setNouveauNom("");
              }}
            >
              Créer (duplique l'actif)
            </Button>
          </div>
        </div>
        {actif.id !== SCENARIO_LFI_ID ? (
          <>
            <Button
              onClick={() => {
                const nom = window.prompt("Nouveau nom du scénario", actif.nom);
                if (nom && nom.trim()) dispatcher({ type: "renommer", id: actif.id, nom: nom.trim() });
              }}
            >
              Renommer
            </Button>
            <Button
              onClick={() => {
                if (window.confirm(`Vider les ${nbOverrides} modifications du scénario « ${actif.nom} » ?`)) {
                  dispatcher({ type: "viderOverrides", id: actif.id });
                }
              }}
            >
              Vider les overrides ({nbOverrides})
            </Button>
            {confirmation === actif.id ? (
              <span className="flex items-center gap-2">
                <Button
                  variant="danger"
                  onClick={() => {
                    dispatcher({ type: "supprimer", id: actif.id });
                    setConfirmation(null);
                  }}
                >
                  Confirmer la suppression
                </Button>
                <Button variant="ghost" onClick={() => setConfirmation(null)}>
                  Annuler
                </Button>
              </span>
            ) : (
              <Button variant="danger" onClick={() => setConfirmation(actif.id)}>
                Supprimer
              </Button>
            )}
          </>
        ) : (
          <Badge>Scénario « LFI 2026 » verrouillé : dupliquez-le pour le modifier.</Badge>
        )}
        <Button onClick={exporterScenario}>Exporter en JSON</Button>
      </div>
    </Card>
  );
}

