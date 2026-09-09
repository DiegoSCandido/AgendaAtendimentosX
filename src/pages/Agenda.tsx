import { useMemo, useState } from "react";
import {
  addDays,
  format,
  isSameDay,
  isToday,
  startOfDay,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarClock,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Clock,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  TriangleAlert,
  UserX,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { AgendamentoDialog } from "@/components/AgendamentoDialog";
import { useClinica } from "@/store/clinica";
import { contraindicacoesDe, iniciais, moeda } from "@/lib/clinica";
import type { Agendamento, StatusAgendamento } from "@/types";
import { Link } from "react-router-dom";

const ALTURA_HORA = 76; // px por hora na régua da timeline

const Agenda = () => {
  const {
    agendamentos,
    configuracoes,
    paciente,
    procedimento,
    mudarStatus,
    removerAgendamento,
  } = useClinica();

  const [dia, setDia] = useState<Date>(startOfDay(new Date()));
  const [inicioFaixa, setInicioFaixa] = useState<Date>(startOfDay(new Date()));
  const [editando, setEditando] = useState<Agendamento | undefined>();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [sugestao, setSugestao] = useState<Date | undefined>();
  const [excluindo, setExcluindo] = useState<Agendamento | undefined>();

  const faixa = Array.from({ length: 14 }, (_, i) => addDays(inicioFaixa, i));

  const doDia = useMemo(
    () =>
      agendamentos
        .filter((a) => isSameDay(new Date(a.inicio), dia))
        .sort((a, b) => +new Date(a.inicio) - +new Date(b.inicio)),
    [agendamentos, dia],
  );

  const horas = Array.from(
    { length: configuracoes.horaFechamento - configuracoes.horaAbertura },
    (_, i) => configuracoes.horaAbertura + i,
  );

  const receitaDoDia = doDia
    .filter((a) => a.status !== "cancelado" && a.status !== "faltou")
    .reduce((s, a) => s + a.valor, 0);

  const abrirNovo = (quando?: Date) => {
    setEditando(undefined);
    setSugestao(quando);
    setDialogAberto(true);
  };

  const abrirEdicao = (a: Agendamento) => {
    setEditando(a);
    setSugestao(undefined);
    setDialogAberto(true);
  };

  const mudar = (a: Agendamento, status: StatusAgendamento, texto: string) => {
    mudarStatus(a.id, status);
    toast.success(texto, { description: paciente(a.pacienteId)?.nome });
  };

  /* Posiciona o bloco na régua: topo proporcional ao horário, altura à duração. */
  const posicao = (a: Agendamento) => {
    const d = new Date(a.inicio);
    const minutos = (d.getHours() - configuracoes.horaAbertura) * 60 + d.getMinutes();
    return {
      top: (minutos / 60) * ALTURA_HORA,
      height: Math.max(44, (a.duracao / 60) * ALTURA_HORA - 4),
    };
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="rotulo">Agenda</p>
            <h1 className="mt-2 font-display text-4xl font-medium md:text-5xl">
              <span className="italic text-primary">Seus</span> atendimentos
            </h1>
          </div>
          <Button onClick={() => abrirNovo()} className="rounded-full shadow-elegant">
            <Plus className="mr-1 h-4 w-4" /> Novo agendamento
          </Button>
        </header>

        <Card className="border-border/60 bg-card/80 shadow-soft">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full"
                onClick={() => setInicioFaixa((d) => subDays(d, 7))}
                aria-label="Semana anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
                {faixa.map((d) => {
                  const ativo = isSameDay(d, dia);
                  const total = agendamentos.filter(
                    (a) => isSameDay(new Date(a.inicio), d) && a.status !== "cancelado",
                  ).length;
                  const fechado = !configuracoes.diasAtendimento.includes(d.getDay());
                  return (
                    <button
                      key={d.toISOString()}
                      onClick={() => setDia(d)}
                      aria-pressed={ativo}
                      className={`flex min-w-[68px] flex-col items-center gap-1 rounded-2xl px-3 py-3 transition-smooth ${
                        ativo
                          ? "bg-primary text-primary-foreground shadow-elegant"
                          : fechado
                            ? "bg-muted/20 text-muted-foreground hover:bg-muted/50"
                            : "bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <span
                        className={`text-[10px] uppercase tracking-widest ${
                          ativo ? "text-primary-foreground/80" : "text-muted-foreground"
                        }`}
                      >
                        {format(d, "EEE", { locale: ptBR })}
                      </span>
                      <span className="font-display text-2xl font-semibold leading-none tabular-nums">
                        {format(d, "d")}
                      </span>
                      <span
                        className={`text-[10px] ${
                          ativo ? "text-primary-foreground/80" : "text-muted-foreground"
                        }`}
                      >
                        {isToday(d) ? "hoje" : total > 0 ? `${total} ag.` : "—"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full"
                onClick={() => setInicioFaixa((d) => addDays(d, 7))}
                aria-label="Próxima semana"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-soft">
          <CardContent className="p-5 md:p-7">
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-2xl font-medium first-letter:uppercase">
                {format(dia, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {doDia.length} {doDia.length === 1 ? "atendimento" : "atendimentos"} ·{" "}
                <span className="tabular-nums">{moeda(receitaDoDia)}</span> previstos
              </p>
            </div>

            {doDia.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                titulo="Nenhum atendimento neste dia"
                descricao="Clique abaixo para abrir um horário nesta data."
                acao={
                  <Button
                    onClick={() => {
                      const d = new Date(dia);
                      d.setHours(configuracoes.horaAbertura, 0, 0, 0);
                      abrirNovo(d);
                    }}
                    className="rounded-full"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Agendar neste dia
                  </Button>
                }
              />
            ) : (
              <div className="relative grid grid-cols-[56px_1fr] gap-3">
                {/* Régua de horas */}
                <div className="relative" style={{ height: horas.length * ALTURA_HORA }}>
                  {horas.map((h, i) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 text-xs font-medium tabular-nums text-muted-foreground"
                      style={{ top: i * ALTURA_HORA - 6 }}
                    >
                      {String(h).padStart(2, "0")}:00
                    </div>
                  ))}
                </div>

                {/* Faixa de blocos */}
                <div className="relative" style={{ height: horas.length * ALTURA_HORA }}>
                  {horas.map((h, i) => (
                    <button
                      key={h}
                      onClick={() => {
                        const d = new Date(dia);
                        d.setHours(h, 0, 0, 0);
                        abrirNovo(d);
                      }}
                      className="absolute left-0 right-0 border-t border-border/60 transition-smooth hover:bg-muted/40"
                      style={{ top: i * ALTURA_HORA, height: ALTURA_HORA }}
                      aria-label={`Agendar às ${h}:00`}
                    />
                  ))}

                  {doDia.map((a) => {
                    const p = paciente(a.pacienteId);
                    const proc = procedimento(a.procedimentoId);
                    const avisos = contraindicacoesDe(p, proc);
                    const { top, height } = posicao(a);
                    const cancelado = a.status === "cancelado";

                    return (
                      <div
                        key={a.id}
                        className={`absolute left-0 right-0 flex items-center gap-3 overflow-hidden rounded-2xl border p-3 shadow-soft transition-smooth ${
                          cancelado
                            ? "border-border/60 bg-muted/40 opacity-60"
                            : "border-border bg-card hover:shadow-elegant"
                        }`}
                        style={{ top, height }}
                      >
                        <span
                          className={`h-full w-1 shrink-0 rounded-full ${
                            a.status === "confirmado"
                              ? "bg-success"
                              : a.status === "agendado"
                                ? "bg-info"
                                : a.status === "faltou"
                                  ? "bg-warning"
                                  : a.status === "cancelado"
                                    ? "bg-destructive"
                                    : "bg-muted-foreground"
                          }`}
                          aria-hidden
                        />
                        <Avatar className="h-10 w-10 shrink-0 border border-border">
                          <AvatarFallback className="bg-gradient-spa text-xs text-primary-foreground">
                            {iniciais(p?.nome ?? "?")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/pacientes/${a.pacienteId}`}
                              className={`truncate font-medium hover:underline ${cancelado ? "line-through" : ""}`}
                            >
                              {p?.nome}
                            </Link>
                            {avisos.length > 0 && !cancelado && (
                              <span
                                className="flex shrink-0 items-center gap-1 rounded-full border border-destructive/35 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive"
                                title={avisos.join(", ")}
                              >
                                <TriangleAlert className="h-3 w-3" aria-hidden />
                                Atenção
                              </span>
                            )}
                          </div>
                          <p className="truncate text-sm text-muted-foreground">
                            {proc?.nome} · {moeda(a.valor)}
                          </p>
                        </div>

                        <span className="hidden shrink-0 items-center gap-1 text-xs tabular-nums text-muted-foreground sm:flex">
                          <Clock className="h-3.5 w-3.5" aria-hidden />
                          {format(new Date(a.inicio), "HH:mm")} · {a.duracao}min
                        </span>

                        <StatusBadge status={a.status} className="hidden md:inline-flex" />

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 rounded-full"
                              aria-label={`Ações para ${p?.nome}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {a.status !== "confirmado" && (
                              <DropdownMenuItem
                                onClick={() => mudar(a, "confirmado", "Atendimento confirmado")}
                              >
                                <Check className="mr-2 h-4 w-4 text-success" /> Confirmar
                              </DropdownMenuItem>
                            )}
                            {a.status !== "concluido" && (
                              <DropdownMenuItem
                                onClick={() => mudar(a, "concluido", "Atendimento concluído")}
                              >
                                <CircleCheckBig className="mr-2 h-4 w-4" /> Marcar como concluído
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => abrirEdicao(a)}>
                              <Pencil className="mr-2 h-4 w-4" /> Editar / reagendar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => mudar(a, "faltou", "Falta registrada")}>
                              <UserX className="mr-2 h-4 w-4 text-warning" /> Registrar falta
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => mudar(a, "cancelado", "Atendimento cancelado")}
                            >
                              <X className="mr-2 h-4 w-4 text-destructive" /> Cancelar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setExcluindo(a)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5" aria-hidden />
          Clique em um horário vazio da régua para abrir um agendamento naquele intervalo.
        </p>
      </div>

      <AgendamentoDialog
        aberto={dialogAberto}
        onOpenChange={setDialogAberto}
        agendamento={editando}
        sugestao={sugestao}
      />

      <AlertDialog open={!!excluindo} onOpenChange={(v) => !v && setExcluindo(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              O agendamento de {paciente(excluindo?.pacienteId ?? "")?.nome} será removido da
              agenda. Para manter o histórico, prefira cancelar em vez de excluir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (excluindo) {
                  removerAgendamento(excluindo.id);
                  toast.success("Agendamento excluído");
                }
                setExcluindo(undefined);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Agenda;
