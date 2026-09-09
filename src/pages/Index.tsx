import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  addDays,
  differenceInCalendarDays,
  format,
  isSameDay,
  isThisMonth,
  isToday,
  startOfDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowUpRight,
  CalendarCheck,
  Clock,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
  CalendarDays,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { AgendamentoDialog } from "@/components/AgendamentoDialog";
import { useClinica } from "@/store/clinica";
import { iniciais, moeda } from "@/lib/clinica";

const Dashboard = () => {
  const { agendamentos, pacientes, configuracoes, paciente, procedimento } = useClinica();
  const [novo, setNovo] = useState(false);

  const doDia = useMemo(
    () =>
      agendamentos
        .filter((a) => isToday(new Date(a.inicio)) && a.status !== "cancelado")
        .sort((a, b) => +new Date(a.inicio) - +new Date(b.inicio)),
    [agendamentos],
  );

  const metricas = useMemo(() => {
    const doMes = agendamentos.filter((a) => isThisMonth(new Date(a.inicio)));
    const concluidos = doMes.filter((a) => a.status === "concluido");
    const receita = concluidos.reduce((s, a) => s + a.valor, 0);
    const previsto = doMes
      .filter((a) => a.status === "agendado" || a.status === "confirmado")
      .reduce((s, a) => s + a.valor, 0);
    const ativos = new Set(
      agendamentos
        .filter((a) => differenceInCalendarDays(new Date(), new Date(a.inicio)) <= 120)
        .map((a) => a.pacienteId),
    );
    const faltas = doMes.filter((a) => a.status === "faltou").length;
    const taxaFalta = doMes.length ? Math.round((faltas / doMes.length) * 100) : 0;
    const ticket = concluidos.length ? Math.round(receita / concluidos.length) : 0;

    return { concluidos: concluidos.length, receita, previsto, ativos: ativos.size, taxaFalta, ticket };
  }, [agendamentos]);

  /* Atendimentos por dia — série única, uma cor só; o dia atual ganha destaque. */
  const serie = useMemo(() => {
    const base = startOfDay(new Date());
    return Array.from({ length: 14 }, (_, i) => {
      const dia = addDays(base, i - 7);
      const doDiaX = agendamentos.filter(
        (a) => isSameDay(new Date(a.inicio), dia) && a.status !== "cancelado",
      );
      return {
        dia: format(dia, "dd/MM"),
        rotulo: format(dia, "EEEE, dd 'de' MMMM", { locale: ptBR }),
        atendimentos: doDiaX.length,
        hoje: isSameDay(dia, base),
      };
    });
  }, [agendamentos]);

  const cartoes = [
    {
      rotulo: "Pacientes ativos",
      valor: metricas.ativos,
      apoio: `${pacientes.length} prontuários no total`,
      icon: Users,
    },
    {
      rotulo: "Atendimentos hoje",
      valor: doDia.length,
      apoio: `${doDia.filter((a) => a.status === "confirmado").length} confirmados`,
      icon: CalendarCheck,
    },
    {
      rotulo: "Concluídos no mês",
      valor: metricas.concluidos,
      apoio: `ticket médio ${moeda(metricas.ticket)}`,
      icon: Sparkles,
    },
    {
      rotulo: "Receita realizada",
      valor: moeda(metricas.receita),
      apoio: `${moeda(metricas.previsto)} ainda previstos`,
      icon: TrendingUp,
    },
  ];

  const saudacao = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();

  const primeiroNome = configuracoes.profissional.split(" ")[0];

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 shadow-soft md:p-12">
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="rotulo">
                {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
              <h1 className="font-display text-4xl font-medium leading-tight md:text-5xl">
                {saudacao}, <span className="italic text-primary">{primeiroNome}</span>
              </h1>
              <p className="max-w-md text-muted-foreground">
                {doDia.length === 0
                  ? "Nenhum atendimento marcado para hoje. Bom momento para organizar a semana."
                  : `Você tem ${doDia.length} ${doDia.length === 1 ? "atendimento" : "atendimentos"} hoje, começando às ${format(new Date(doDia[0].inicio), "HH:mm")}.`}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="rounded-full bg-background/60 backdrop-blur">
                <Link to="/pacientes">Ver pacientes</Link>
              </Button>
              <Button onClick={() => setNovo(true)} className="rounded-full shadow-elegant">
                <Plus className="mr-1 h-4 w-4" /> Novo agendamento
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cartoes.map((c) => (
            <Card key={c.rotulo} className="border-border/60 bg-card/80 shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <c.icon className="h-4 w-4" aria-hidden />
                  <span className="text-sm">{c.rotulo}</span>
                </div>
                <p className="mt-3 font-display text-3xl font-semibold tabular-nums">{c.valor}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.apoio}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border/60 bg-card/80 shadow-soft lg:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="font-display text-2xl font-medium">Agenda de hoje</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {doDia.length} programados · {configuracoes.horaAbertura}h às{" "}
                  {configuracoes.horaFechamento}h
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link to="/agenda">
                  Ver agenda <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {doDia.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  titulo="Dia livre"
                  descricao="Não há atendimentos marcados para hoje."
                  acao={
                    <Button onClick={() => setNovo(true)} className="rounded-full">
                      <Plus className="mr-1 h-4 w-4" /> Agendar
                    </Button>
                  }
                />
              ) : (
                doDia.map((a) => {
                  const p = paciente(a.pacienteId);
                  return (
                    <Link
                      key={a.id}
                      to={`/pacientes/${a.pacienteId}`}
                      className="flex items-center gap-4 rounded-2xl border border-transparent p-3 transition-smooth hover:border-border hover:bg-muted/50"
                    >
                      <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-secondary/60 px-2 py-2">
                        <Clock className="h-3.5 w-3.5 text-primary" aria-hidden />
                        <span className="mt-1 font-display text-base font-semibold tabular-nums">
                          {format(new Date(a.inicio), "HH:mm")}
                        </span>
                      </div>
                      <Avatar className="h-11 w-11 shrink-0 border border-border">
                        <AvatarFallback className="bg-gradient-spa text-sm text-primary-foreground">
                          {iniciais(p?.nome ?? "?")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{p?.nome}</p>
                        <p className="truncate text-sm text-muted-foreground">
                          {procedimento(a.procedimentoId)?.nome} • {a.duracao}min
                        </p>
                      </div>
                      <StatusBadge status={a.status} />
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-2xl font-medium">Últimas visitas</CardTitle>
              <p className="text-sm text-muted-foreground">Quem passou por aqui recentemente</p>
            </CardHeader>
            <CardContent className="space-y-1">
              {[...agendamentos]
                .filter((a) => a.status === "concluido")
                .sort((a, b) => +new Date(b.inicio) - +new Date(a.inicio))
                .filter(
                  (a, i, arr) => arr.findIndex((x) => x.pacienteId === a.pacienteId) === i,
                )
                .slice(0, 5)
                .map((a) => {
                  const p = paciente(a.pacienteId);
                  return (
                    <Link
                      key={a.id}
                      to={`/pacientes/${a.pacienteId}`}
                      className="flex items-center gap-3 rounded-2xl p-2.5 transition-smooth hover:bg-muted/50"
                    >
                      <Avatar className="h-10 w-10 shrink-0 border border-border">
                        <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
                          {iniciais(p?.nome ?? "?")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p?.nome}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {procedimento(a.procedimentoId)?.nome} ·{" "}
                          {format(new Date(a.inicio), "dd MMM", { locale: ptBR })}
                        </p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    </Link>
                  );
                })}
            </CardContent>
          </Card>
        </section>

        <Card className="border-border/60 bg-card/80 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-2xl font-medium">
              Atendimentos por dia
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Últimos 7 dias e a semana que vem — a barra destacada é hoje.
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serie} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid
                    vertical={false}
                    stroke="hsl(var(--border))"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="dia"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted) / 0.6)" }}
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      color: "hsl(var(--popover-foreground))",
                      fontSize: 12,
                      boxShadow: "var(--shadow-soft)",
                    }}
                    labelFormatter={(_, p) => p?.[0]?.payload?.rotulo ?? ""}
                    formatter={(v: number) => [
                      `${v} ${v === 1 ? "atendimento" : "atendimentos"}`,
                      "",
                    ]}
                  />
                  <Bar dataKey="atendimentos" radius={[4, 4, 0, 0]} maxBarSize={22}>
                    {serie.map((d) => (
                      <Cell
                        key={d.dia}
                        fill={d.hoje ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.32)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <AgendamentoDialog aberto={novo} onOpenChange={setNovo} />
    </AppLayout>
  );
};

export default Dashboard;
