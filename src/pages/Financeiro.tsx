import { useMemo, useState } from "react";
import {
  eachMonthOfInterval,
  format,
  isSameMonth,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Wallet, TrendingUp, UserX, Percent } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { useClinica } from "@/store/clinica";
import { moeda, moedaExata } from "@/lib/clinica";

const Financeiro = () => {
  const { agendamentos, procedimentos, paciente, procedimento } = useClinica();
  const [meses, setMeses] = useState("6");

  const janela = Number(meses);

  const serie = useMemo(() => {
    const fim = startOfMonth(new Date());
    const intervalo = eachMonthOfInterval({ start: subMonths(fim, janela - 1), end: fim });
    return intervalo.map((m) => {
      const doMes = agendamentos.filter(
        (a) => isSameMonth(new Date(a.inicio), m) && a.status === "concluido",
      );
      return {
        mes: format(m, "MMM/yy", { locale: ptBR }),
        rotulo: format(m, "MMMM 'de' yyyy", { locale: ptBR }),
        receita: doMes.reduce((s, a) => s + a.valor, 0),
        atendimentos: doMes.length,
      };
    });
  }, [agendamentos, janela]);

  const porProcedimento = useMemo(() => {
    const concluidos = agendamentos.filter((a) => a.status === "concluido");
    return procedimentos
      .map((p) => {
        const meus = concluidos.filter((a) => a.procedimentoId === p.id);
        return {
          id: p.id,
          nome: p.nome,
          categoria: p.categoria,
          qtd: meus.length,
          receita: meus.reduce((s, a) => s + a.valor, 0),
        };
      })
      .filter((x) => x.qtd > 0)
      .sort((a, b) => b.receita - a.receita);
  }, [agendamentos, procedimentos]);

  const totais = useMemo(() => {
    const concluidos = agendamentos.filter((a) => a.status === "concluido");
    const receita = concluidos.reduce((s, a) => s + a.valor, 0);
    const previsto = agendamentos
      .filter((a) => a.status === "agendado" || a.status === "confirmado")
      .reduce((s, a) => s + a.valor, 0);
    const perdidos = agendamentos.filter((a) => a.status === "faltou" || a.status === "cancelado");
    const perdida = perdidos.reduce((s, a) => s + a.valor, 0);
    const encerrados = concluidos.length + perdidos.length;
    return {
      receita,
      previsto,
      perdida,
      ticket: concluidos.length ? receita / concluidos.length : 0,
      taxaPerda: encerrados ? Math.round((perdidos.length / encerrados) * 100) : 0,
    };
  }, [agendamentos]);

  const proximos = agendamentos
    .filter((a) => new Date(a.inicio) >= new Date() && a.status !== "cancelado")
    .sort((a, b) => +new Date(a.inicio) - +new Date(b.inicio))
    .slice(0, 8);

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="rotulo">Financeiro</p>
            <h1 className="mt-2 font-display text-4xl font-medium md:text-5xl">
              Seus <span className="italic text-primary">resultados</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Calculado a partir dos atendimentos concluídos.
            </p>
          </div>
          <Select value={meses} onValueChange={setMeses}>
            <SelectTrigger className="h-11 w-full rounded-full bg-card/80 md:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Últimos 3 meses</SelectItem>
              <SelectItem value="6">Últimos 6 meses</SelectItem>
              <SelectItem value="12">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metrica icone={Wallet} rotulo="Receita realizada" valor={moeda(totais.receita)} />
          <Metrica icone={TrendingUp} rotulo="Previsto a receber" valor={moeda(totais.previsto)} />
          <Metrica icone={Percent} rotulo="Ticket médio" valor={moeda(totais.ticket)} />
          <Metrica
            icone={UserX}
            rotulo="Faltas e cancelamentos"
            valor={`${totais.taxaPerda}%`}
            apoio={`${moeda(totais.perdida)} não realizados`}
          />
        </section>

        <Card className="border-border/60 bg-card/80 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-2xl font-medium">Receita por mês</CardTitle>
            <p className="text-sm text-muted-foreground">
              Somente atendimentos concluídos entram no cálculo.
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serie} margin={{ top: 4, right: 8, bottom: 0, left: 4 }}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="mes"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={64}
                    tickFormatter={(v: number) => moeda(v)}
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
                    formatter={(v: number, _n, p) => [
                      `${moedaExata(v)} · ${p.payload.atendimentos} atendimentos`,
                      "",
                    ]}
                  />
                  <Bar
                    dataKey="receita"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={44}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60 bg-card/80 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-2xl font-medium">
                Procedimentos que mais faturam
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Procedimento</TableHead>
                    <TableHead className="text-right">Sessões</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {porProcedimento.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <span className="font-medium">{p.nome}</span>
                        <span className="block text-xs text-muted-foreground">{p.categoria}</span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{p.qtd}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {moeda(p.receita)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/80 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display text-2xl font-medium">A receber</CardTitle>
              <p className="text-sm text-muted-foreground">Próximos atendimentos marcados</p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Quando</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proximos.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <span className="font-medium">{paciente(a.pacienteId)?.nome}</span>
                        <span className="block text-xs text-muted-foreground">
                          {procedimento(a.procedimentoId)?.nome}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="block text-sm tabular-nums">
                          {format(new Date(a.inicio), "dd/MM HH:mm")}
                        </span>
                        <StatusBadge status={a.status} className="mt-1" />
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {moeda(a.valor)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

function Metrica({
  icone: Icone,
  rotulo,
  valor,
  apoio,
}: {
  icone: typeof Wallet;
  rotulo: string;
  valor: string;
  apoio?: string;
}) {
  return (
    <Card className="border-border/60 bg-card/80 shadow-soft">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icone className="h-4 w-4" aria-hidden />
          <span className="text-sm">{rotulo}</span>
        </div>
        <p className="mt-3 font-display text-3xl font-semibold tabular-nums">{valor}</p>
        {apoio && <p className="mt-1 text-xs text-muted-foreground">{apoio}</p>}
      </CardContent>
    </Card>
  );
}

export default Financeiro;
