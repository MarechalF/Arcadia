import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { clsx } from "clsx";
import { BarreScenarios } from "@/components/BarreScenarios";
import { useAppStore } from "@/store/useAppStore";
import { referentiel } from "@/data/referentiel";

const routes = [
  { to: "/", label: "Vue d'ensemble" },
  { to: "/recettes", label: "Recettes de l'État" },
  { to: "/depenses", label: "Dépenses & missions" },
  { to: "/securite-sociale", label: "Sécurité sociale" },
  { to: "/collectivites", label: "Collectivités" },
  { to: "/operateurs", label: "Opérateurs" },
  { to: "/grand-livre", label: "Grand livre" },
  { to: "/comparateur", label: "Comparateur" },
  { to: "/dette", label: "Projection de dette" },
  { to: "/flux", label: "Flux (Sankey)" },
  { to: "/titres", label: "Titres budgétaires" },
  { to: "/historique", label: "Historique 2015-2026" },
  { to: "/aides", label: "Aides & subventions" },
];

export function Layout() {
  const scenarios = useAppStore((s) => s.scenarios);
  const actifId = useAppStore((s) => s.scenarioActifId);
  const actif = scenarios.find((s) => s.id === actifId);

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-bord bg-carte">
        <h1 className="px-4 py-4 text-lg font-bold tracking-tight text-blue-300">
          Flux Publics
        </h1>
        <p className="px-4 pb-3 text-xs text-slate-500">{referentiel.millésime}</p>
        <nav className="flex-1 px-2" aria-label="Navigation principale">
          <ul className="space-y-1">
            {routes.map((r) => (
              <li key={r.to}>
                <NavLink
                  to={r.to}
                  end={r.to === "/"}
                  className={({ isActive }) =>
                    clsx(
                      "block rounded-md px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white",
                      isActive && "bg-blue-600/30 text-blue-200",
                    )
                  }
                >
                  {r.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        {actif ? (
          <p className="border-t border-bord px-4 py-3 text-xs text-slate-500">
            Scénario : <span className="text-slate-300">{actif.nom}</span>
            <br />
            {Object.keys(actif.overrides).length} modification(s)
          </p>
        ) : null}
      </aside>
      <main className="flex-1 p-6">
        <div
          className="mb-4 rounded-md border border-bord bg-carte/60 px-3 py-1.5 text-xs text-slate-400"
          role="status"
        >
          Données indicatives {referentiel.millésime} — détail réel : Chorus/data.gouv.fr.{" "}
          {actif && Object.keys(actif.overrides).length > 0
            ? "Valeurs modifiées affichées avec un badge Δ."
            : ""}
        </div>
        <BandeauMiseAJour />
        <BarreScenarios />
        <Outlet />
      </main>
    </div>
  );
}

interface InterfaceBureau {
  estApplicationBureau?: boolean;
  versionApp?: string;
  surMiseAJour?: (callback: (donnees: { texte: string; info: { version?: string; percent?: number } | null }) => void) => void;
}

declare global {
  interface Window {
    fluxPublics?: InterfaceBureau;
  }
}

function BandeauMiseAJour() {
  const bureau = typeof window !== "undefined" ? window.fluxPublics : undefined;
  const [statut, setStatut] = useState<string | null>(null);

  useEffect(() => {
    if (bureau?.surMiseAJour) {
      bureau.surMiseAJour((donnees) => setStatut(donnees.texte));
    }
  }, [bureau]);

  if (!statut) return null;
  return (
    <p className="mb-3 rounded-md border border-blue-800 bg-blue-950/50 px-3 py-1.5 text-xs text-blue-200" role="status">
      {statut}
    </p>
  );
}
