import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appointments, patients, stats } from "@/data/mockData";
import { Users, CalendarCheck, Sparkles, TrendingUp, Clock, ArrowUpRight, Plus } from "lucide-react";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

const statCards = [
  { label: "Pacientes ativos", value: stats.pacientesAtivos, change: "+12%", icon: Users, accent: "from-primary to-primary-glow" },
  { label: "Agendamentos hoje", value: stats.agendamentosHoje, change: "5 confirmados", icon: CalendarCheck, accent: "from-accent to-secondary" },
  { label: "Procedimentos no mês", value: stats.proceduresMes, change: "+8%", icon: Sparkles, accent: "from-primary-glow to-accent" },
  { label: "Receita do mês", value: `R$ ${stats.receitaMes.toLocaleString("pt-BR")}`, change: "+18%", icon: TrendingUp, accent: "from-primary to-accent" },
];

const Dashboard = () => {
  const todayAppointments = appointments.filter((a) => isToday(new Date(a.date)));
  const recentPatients = patients.slice(0, 4);

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-hero p-8 md:p-12 shadow-soft">
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
              <h1 className="font-display text-4xl font-medium leading-tight text-foreground md:text-5xl">
                Bom dia, <span className="italic text-primary">Helena</span>
              </h1>
              <p className="max-w-md text-muted-foreground">
                Você tem {todayAppointments.length} atendimentos hoje. Que seja um dia leve e produtivo.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" className="rounded-full border-border/80 bg-background/60 backdrop-blur">
                <Link to="/prontuarios">Ver prontuários</Link>
              </Button>
              <Button className="rounded-full bg-primary text-primary-foreground shadow-elegant hover:bg-primary/90">
                <Plus className="mr-1 h-4 w-4" /> Novo agendamento
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((s) => (
            <Card key={s.label} className="group relative overflow-hidden border-border/60 bg-card/80 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${s.accent} text-primary-foreground shadow-glow`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="rounded-full bg-secondary/60 text-[11px] font-medium text-secondary-foreground">
                    {s.change}
                  </Badge>
                </div>
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="mt-1 font-display text-3xl font-semibold text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Today + Recent */}
        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-border/60 bg-card/80 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="font-display text-2xl font-medium">Agenda de hoje</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{todayAppointments.length} atendimentos programados</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
                <Link to="/agenda">Ver tudo <ArrowUpRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {todayAppointments.map((appt) => (
                <div key={appt.id} className="group flex items-center gap-4 rounded-2xl border border-transparent p-3 transition-smooth hover:border-border hover:bg-muted/40">
                  <div className="flex w-16 flex-col items-center rounded-xl bg-secondary/50 px-2 py-2">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span className="mt-1 font-display text-base font-semibold text-foreground">
                      {format(new Date(appt.date), "HH:mm")}
                    </span>
                  </div>
                  <Avatar className="h-11 w-11 border border-border">
                    <AvatarFallback className="bg-gradient-spa text-sm font-medium text-primary-foreground">
                      {appt.patientInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-foreground">{appt.patientName}</p>
                    <p className="truncate text-sm text-muted-foreground">{appt.procedure} • {appt.duration}min</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`rounded-full text-[11px] capitalize ${
                      appt.status === "confirmado"
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-accent/40 bg-accent/20 text-accent-foreground"
                    }`}
                  >
                    {appt.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="font-display text-2xl font-medium">Pacientes recentes</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Últimas visitas</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {recentPatients.map((p) => (
                <Link
                  key={p.id}
                  to={`/prontuarios/${p.id}`}
                  className="flex items-center gap-3 rounded-2xl p-2.5 transition-smooth hover:bg-muted/40"
                >
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarFallback className="bg-secondary text-xs font-medium text-secondary-foreground">
                      {p.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {p.totalSessions} sessões • {format(new Date(p.lastVisit), "dd MMM", { locale: ptBR })}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
