import { Check, CalendarClock, CircleCheckBig, X, UserX } from "lucide-react";
import type { StatusAgendamento } from "@/types";
import { statusMeta } from "@/lib/clinica";
import { cn } from "@/lib/utils";

const icones = {
  agendado: CalendarClock,
  confirmado: Check,
  concluido: CircleCheckBig,
  cancelado: X,
  faltou: UserX,
} as const;

export function StatusBadge({
  status,
  className,
}: {
  status: StatusAgendamento;
  className?: string;
}) {
  const meta = statusMeta[status];
  const Icone = icones[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        meta.classe,
        className,
      )}
    >
      <Icone className="h-3 w-3" aria-hidden />
      {meta.rotulo}
    </span>
  );
}
