import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icone,
  titulo,
  descricao,
  acao,
}: {
  icon: LucideIcon;
  titulo: string;
  descricao: string;
  acao?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
        <Icone className="h-5 w-5 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="mt-4 font-display text-lg font-medium">{titulo}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{descricao}</p>
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  );
}
