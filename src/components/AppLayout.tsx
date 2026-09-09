import { useState, type ReactNode } from "react";
import { Bell, Moon, Plus, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BuscaGlobal } from "@/components/BuscaGlobal";
import { useBuscaGlobal } from "@/hooks/useBuscaGlobal";
import { AgendamentoDialog } from "@/components/AgendamentoDialog";
import { useLembreteConsulta } from "@/hooks/useLembreteConsulta";
import { useClinica } from "@/store/clinica";
import { StatusBadge } from "@/components/StatusBadge";

export function AppLayout({ children }: { children: ReactNode }) {
  useLembreteConsulta();
  const { aberto, setAberto } = useBuscaGlobal();
  const [novoAgendamento, setNovoAgendamento] = useState(false);
  const { theme, setTheme } = useTheme();
  const { agendamentos, paciente, procedimento } = useClinica();

  const pendentes = agendamentos
    .filter((a) => a.status === "agendado" && new Date(a.inicio) >= new Date())
    .sort((a, b) => +new Date(a.inicio) - +new Date(b.inicio))
    .slice(0, 5);

  const hoje = agendamentos.filter(
    (a) => isToday(new Date(a.inicio)) && a.status !== "cancelado",
  ).length;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-soft">
        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="nao-imprimir sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl md:px-8">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

            <button
              onClick={() => setAberto(true)}
              className="group hidden h-10 flex-1 items-center gap-3 rounded-full border border-border/60 bg-muted/40 px-4 text-left text-sm text-muted-foreground transition-smooth hover:bg-muted md:flex md:max-w-md"
            >
              <Search className="h-4 w-4" aria-hidden />
              <span className="flex-1">Buscar paciente, agendamento...</span>
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground">
                Ctrl K
              </kbd>
            </button>

            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full md:hidden"
                onClick={() => setAberto(true)}
                aria-label="Buscar"
              >
                <Search className="h-[18px] w-[18px]" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Alternar tema"
              >
                <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full"
                    aria-label={`Notificações: ${pendentes.length} a confirmar`}
                  >
                    <Bell className="h-[18px] w-[18px]" />
                    {pendentes.length > 0 && (
                      <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground">
                        {pendentes.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-baseline justify-between">
                    <span>A confirmar</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {hoje} atendimentos hoje
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {pendentes.length === 0 ? (
                    <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                      Tudo confirmado por aqui.
                    </p>
                  ) : (
                    pendentes.map((a) => (
                      <DropdownMenuItem key={a.id} asChild>
                        <Link to="/agenda" className="flex flex-col items-start gap-1">
                          <span className="flex w-full items-center justify-between gap-2">
                            <span className="truncate font-medium">
                              {paciente(a.pacienteId)?.nome}
                            </span>
                            <StatusBadge status={a.status} />
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {procedimento(a.procedimentoId)?.nome} ·{" "}
                            {format(new Date(a.inicio), "dd MMM 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                onClick={() => setNovoAgendamento(true)}
                className="ml-1 rounded-full shadow-glow"
                size="sm"
              >
                <Plus className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Agendar</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 animate-fade-in px-4 py-6 md:px-8 md:py-10">{children}</main>
        </div>
      </div>

      <BuscaGlobal aberto={aberto} onOpenChange={setAberto} />
      <AgendamentoDialog aberto={novoAgendamento} onOpenChange={setNovoAgendamento} />
    </SidebarProvider>
  );
}
