import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { VueEnsemble } from "@/pages/VueEnsemble";
import { RecettesEtat } from "@/pages/RecettesEtat";
import { DepensesMissions, DetailMission } from "@/pages/DepensesMissions";
import { SecuriteSociale, Collectivites } from "@/pages/Branches";
import { Operateurs } from "@/pages/Operateurs";
import { GrandLivre } from "@/pages/GrandLivre";
import { Comparateur } from "@/pages/Comparateur";
import { ProjectionDette } from "@/pages/ProjectionDette";
import { FluxSankeyPage } from "@/pages/FluxSankey";
import { TitresBudgetaires } from "@/pages/TitresBudgetaires";
import { Historique } from "@/pages/Historique";
import { AidesSubventions } from "@/pages/AidesSubventions";
import { Reformes } from "@/pages/Reformes";
import { SuiviArgent } from "@/pages/SuiviArgent";
import { Rapport } from "@/pages/Rapport";
import "@/index.css";

function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<VueEnsemble />} />
          <Route path="recettes" element={<RecettesEtat />} />
          <Route path="depenses" element={<DepensesMissions />} />
          <Route path="depenses/:missionId" element={<DetailMission />} />
          <Route path="securite-sociale" element={<SecuriteSociale />} />
          <Route path="collectivites" element={<Collectivites />} />
          <Route path="operateurs" element={<Operateurs />} />
          <Route path="grand-livre" element={<GrandLivre />} />
          <Route path="comparateur" element={<Comparateur />} />
          <Route path="dette" element={<ProjectionDette />} />
          <Route path="flux" element={<FluxSankeyPage />} />
          <Route path="titres" element={<TitresBudgetaires />} />
          <Route path="historique" element={<Historique />} />
          <Route path="aides" element={<AidesSubventions />} />
          <Route path="reformes" element={<Reformes />} />
          <Route path="suivi" element={<SuiviArgent />} />
          <Route path="rapport" element={<Rapport />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <AppRoutes />
  </StrictMode>,
);
