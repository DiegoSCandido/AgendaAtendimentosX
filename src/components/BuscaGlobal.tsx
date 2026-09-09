import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Settings, Users, Wallet, LayoutDashboard } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useClinica } from "@/store/clinica";

const paginas = [
  { titulo: "Visão geral", url: "/", icon: LayoutDashboard },
  { titulo: "Agenda", url: "/agenda", icon: CalendarDays },
  { titulo: "Pacientes", url: "/pacientes", icon: Users },
  { titulo: "Financeiro", url: "/financeiro", icon: Wallet },
  { titulo: "Configurações", url: "/configuracoes", icon: Settings },
];

export function BuscaGlobal({
  aberto,
  onOpenChange,
}: {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navegar = useNavigate();
  const { pacientes, agendamentos, paciente, procedimento } = useClinica();

  const ir = (url: string) => {
    onOpenChange(false);
    navegar(url);
  };

  const proximos = [...agendamentos]
    .filter((a) => new Date(a.inicio) >= new Date() && a.status !== "cancelado")
    .sort((a, b) => +new Date(a.inicio) - +new Date(b.inicio))
    .slice(0, 6);

  return (
    <CommandDialog open={aberto} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Buscar paciente, agendamento ou página..." />
      <CommandList>
        <CommandEmpty>Nada encontrado.</CommandEmpty>

        <CommandGroup heading="Pacientes">
          {pacientes.map((p) => (
            <CommandItem
              key={p.id}
              value={`${p.nome} ${p.telefone} ${p.email}`}
              onSelect={() => ir(`/pacientes/${p.id}`)}
            >
              <Users className="mr-2 h-4 w-4" aria-hidden />
              <span>{p.nome}</span>
              <span className="ml-auto text-xs text-muted-foreground">{p.telefone}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Próximos atendimentos">
          {proximos.map((a) => (
            <CommandItem
              key={a.id}
              value={`${paciente(a.pacienteId)?.nome} ${procedimento(a.procedimentoId)?.nome}`}
              onSelect={() => ir("/agenda")}
            >
              <CalendarDays className="mr-2 h-4 w-4" aria-hidden />
              <span>{paciente(a.pacienteId)?.nome}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {format(new Date(a.inicio), "dd MMM, HH:mm", { locale: ptBR })}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Ir para">
          {paginas.map((p) => (
            <CommandItem key={p.url} value={p.titulo} onSelect={() => ir(p.url)}>
              <p.icon className="mr-2 h-4 w-4" aria-hidden />
              {p.titulo}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
