import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card } from "./ui";
import { clsx } from "clsx";

interface InterfaceBureau {
  estApplicationBureau?: boolean;
  versionApp?: string;
  surMiseAJour?: (callback: (donnees: { texte: string; info: unknown }) => void) => void;
  verifierVersion?: () => Promise<{ disponible: boolean; erreur?: string }>;
  verifierMajInstallateur?: () => Promise<{ disponible: boolean; raison?: string }>;
  installerMiseAJour?: () => Promise<{ ok: boolean; message: string }>;
}

function interfaceBureau(): InterfaceBureau | undefined {
  return typeof window !== "undefined" ? (window as unknown as { fluxPublics?: InterfaceBureau }).fluxPublics : undefined;
}

type EtatMaj = "verifie" | "disponible" | "a-jour" | "en-cours" | "erreur" | "web";

/** Bouton/bandeau de mise à jour automatique : vérifie GitHub et installe en un clic. */
export function MiseAJourBouton() {
  const [etat, setEtat] = useState<EtatMaj>("verifie");
  const [message, setMessage] = useState<string>("");
  const bureau = interfaceBureau();
  const estBureau = Boolean(bureau?.estApplicationBureau);

  const verifier = useCallback(async () => {
    const b = interfaceBureau();
    if (!b?.estApplicationBureau) {
      setEtat("web");
      return;
    }
    setEtat("verifie");
    setMessage("Vérification des mises à jour…");
    try {
      if (b.verifierMajInstallateur) {
        const majInstallateur = await b.verifierMajInstallateur();
        if (majInstallateur.disponible) {
          setEtat("disponible");
          setMessage("Une nouvelle version est en cours de téléchargement.");
          return;
        }
      }
      if (b.verifierVersion) {
        const resultat = await b.verifierVersion();
        if (resultat.disponible) {
          setEtat("disponible");
          setMessage("Une nouvelle version du code est disponible sur GitHub.");
        } else if (resultat.erreur) {
          setEtat("erreur");
          setMessage(`Vérification impossible : ${resultat.erreur}`);
        } else {
          setEtat("a-jour");
          setMessage("Application à jour.");
        }
      }
    } catch (erreur) {
      setEtat("erreur");
      setMessage(String(erreur));
    }
  }, []);

  useEffect(() => {
    void verifier();
    const b = interfaceBureau();
    if (b?.surMiseAJour) {
      b.surMiseAJour((donnees) => {
        setMessage(donnees.texte);
        if (donnees.texte.includes("redémarrage") || donnees.texte.includes("Mise à jour lancée")) {
          setEtat("en-cours");
        }
      });
    }
  }, [verifier]);

  async function installer() {
    const b = interfaceBureau();
    if (!b?.installerMiseAJour) {
      setMessage("Bouton disponible uniquement dans l'application de bureau.");
      return;
    }
    setEtat("en-cours");
    setMessage("Lancement de la mise à jour…");
    const resultat = await b.installerMiseAJour();
    if (!resultat.ok) {
      setEtat("erreur");
      setMessage(resultat.message);
    }
  }

  if (!estBureau) {
    return (
      <p className="px-3 py-2 text-xs text-slate-500">
        Version web : la mise à jour automatique est disponible dans l'application de bureau.
      </p>
    );
  }

  return (
    <Card className="p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge
            variant={
              etat === "disponible" ? "positif" : etat === "erreur" ? "negatif" : etat === "en-cours" ? "delta" : "default"
            }
          >
            {etat === "disponible"
              ? "nouvelle version"
              : etat === "en-cours"
                ? "en cours"
                : etat === "erreur"
                  ? "erreur"
                  : etat === "a-jour"
                    ? "à jour"
                    : "vérification"}
          </Badge>
          <span className="text-xs text-slate-400">{message || "Mise à jour automatique prête."}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className={clsx(etat === "verifie" && "opacity-50")}
            disabled={etat === "verifie" || etat === "en-cours"}
            aria-label="Revérifier les mises à jour"
            onClick={() => void verifier()}
          >
            Revérifier
          </Button>
          {etat === "disponible" ? (
            <Button variant="primary" onClick={() => void installer()}>
              Installer la mise à jour
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
