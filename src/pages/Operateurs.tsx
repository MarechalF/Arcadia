import { Badge, Card, CardHeader, CardTitle, Separator } from "@/components/ui";
import { referentiel } from "@/data/referentiel";
import { formatMdE } from "@/lib/format";

export function Operateurs() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Opérateurs publics</h2>
      <Card className="text-xs text-amber-200">
        Avertissement : ces montants sont des stocks gérés pour des tiers (bilan, encours, engagements),
        pas des dépenses annuelles. Ils ne s'additionnent pas au budget.
      </Card>
      <div className="space-y-4">
        {referentiel.operateurs.map((op) => (
          <Card key={op.id}>
            <CardHeader>
              <CardTitle>{op.nom}</CardTitle>
              <Badge variant="rigide">{op.enjeu}</Badge>
            </CardHeader>
            <p className="text-sm text-slate-300">{op.role}</p>
            <Separator className="my-3" />
            <p className="text-xs text-slate-500">
              {op.avertissement} Ordre de grandeur : {formatMdE(op.montantIndicatif)}.
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
