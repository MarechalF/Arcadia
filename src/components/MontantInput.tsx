import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { Badge, Input } from "./ui";
import { formatDelta } from "@/lib/format";
import { useAppStore } from "@/store/useAppStore";

interface Props {
  id: string;
  montantReferentiel: number;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

/** Champ d'édition d'un montant : fond bleuté + badge Δ si modifié. */
export function MontantInput({ id, montantReferentiel, disabled, ariaLabel, className }: Props) {
  const scenario = useAppStore((s) => s.scenarios.find((sc) => sc.id === s.scenarioActifId));
  const dispatcher = useAppStore((s) => s.dispatcher);
  const override = scenario?.overrides[id];
  const modifie = override !== undefined && override !== montantReferentiel;
  const [texte, setTexte] = useState(String(override ?? montantReferentiel));

  useEffect(() => {
    setTexte(String(override ?? montantReferentiel));
  }, [override, montantReferentiel, scenario?.id]);

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <Input
        type="number"
        step="0.1"
        aria-label={ariaLabel ?? `Montant en milliards d'euros pour ${id}`}
        value={texte}
        disabled={disabled}
        onChange={(e) => setTexte(e.target.value)}
        onBlur={() => {
          const nombre = Number.parseFloat(texte);
          if (Number.isFinite(nombre)) {
            dispatcher({ type: "setMontant", cle: id, montant: nombre });
          } else {
            setTexte(String(override ?? montantReferentiel));
          }
        }}
        className={clsx("w-24 text-right", modifie && "bg-blue-950/70")}
      />
      {modifie ? (
        <Badge variant="delta" title="Écart au référentiel">
          Δ {formatDelta(override - montantReferentiel)}
        </Badge>
      ) : null}
    </div>
  );
}
