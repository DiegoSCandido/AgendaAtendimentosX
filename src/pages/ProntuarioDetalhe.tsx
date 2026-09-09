import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  CalendarPlus,
  ClipboardList,
  Droplets,
  Mail,
  Moon,
  Pencil,
  Phone,
  Pill,
  Plus,
  Printer,
  Sparkles,
  Sun,
  TriangleAlert,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { PacienteDialog } from "@/components/PacienteDialog";
import { EvolucaoDialog } from "@/components/EvolucaoDialog";
import { AgendamentoDialog } from "@/components/AgendamentoDialog";
import { useClinica } from "@/store/clinica";
import { alertasDe, idade, iniciais, moeda, rotulosSaude } from "@/lib/clinica";
import type { Anamnese } from "@/types";

const ProntuarioDetalhe = () => {
  const { id } = useParams();
  const { paciente, agendamentos, evolucoes, procedimento } = useClinica();
  const p = paciente(id);

  const [editando, setEditando] = useState(false);
  const [novaEvolucao, setNovaEvolucao] = useState(false);
  const [novoAgendamento, setNovoAgendamento] = useState(false);

  const meus = useMemo(
    () =>
      agendamentos
        .filter((a) => a.pacienteId === id)
        .sort((a, b) => +new Date(b.inicio) - +new Date(a.inicio)),
    [agendamentos, id],
  );

  const minhasEvolucoes = useMemo(
    () =>
      evolucoes
        .filter((e) => e.pacienteId === id)
        .sort((a, b) => +new Date(b.data) - +new Date(a.data)),
    [evolucoes, id],
  );

  if (!p) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl py-16 text-center">
          <h1 className="font-display text-3xl">Prontuário não encontrado</h1>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/pacientes">Voltar para pacientes</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const a = p.anamnese;
  const alertas = alertasDe(p);
  const concluidos = meus.filter((x) => x.status === "concluido");
  const investido = concluidos.reduce((s, x) => s + x.valor, 0);
  const proximo = meus
    .filter((x) => new Date(x.inicio) >= new Date() && x.status !== "cancelado")
    .sort((x, y) => +new Date(x.inicio) - +new Date(y.inicio))[0];

  const condicoes = (Object.keys(rotulosSaude) as (keyof Anamnese)[]).filter(
    (k) => a[k] === true,
  );

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <Button
          asChild
          variant="ghost"
          className="nao-imprimir -ml-3 rounded-full text-muted-foreground hover:text-foreground"
        >
          <Link to="/pacientes">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para pacientes
          </Link>
        </Button>

        <Card className="overflow-hidden border-border/60 bg-card/80 shadow-soft">
          <div className="bg-gradient-hero p-6 md:p-9">
            <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center">
              <Avatar className="h-20 w-20 shrink-0 border-4 border-background shadow-elegant">
                <AvatarFallback className="bg-gradient-spa text-xl text-primary-foreground">
                  {iniciais(p.nome)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="rotulo">Paciente desde {format(new Date(p.criadoEm), "MMM yyyy", { locale: ptBR })}</p>
                <h1 className="mt-1 font-display text-3xl font-medium md:text-4xl">{p.nome}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                  {p.nascimento && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" aria-hidden /> {idade(p.nascimento)} anos
                    </span>
                  )}
                  {p.telefone && (
                    <a href={`tel:${p.telefone}`} className="flex items-center gap-1.5 hover:text-foreground">
                      <Phone className="h-4 w-4" aria-hidden /> {p.telefone}
                    </a>
                  )}
                  {p.email && (
                    <a href={`mailto:${p.email}`} className="flex items-center gap-1.5 hover:text-foreground">
                      <Mail className="h-4 w-4" aria-hidden /> {p.email}
                    </a>
                  )}
                </div>
              </div>

              <div className="nao-imprimir flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="rounded-full bg-background/60 backdrop-blur"
                  onClick={() => window.print()}
                >
                  <Printer className="mr-1.5 h-4 w-4" /> Imprimir
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full bg-background/60 backdrop-blur"
                  onClick={() => setEditando(true)}
                >
                  <Pencil className="mr-1.5 h-4 w-4" /> Editar
                </Button>
                <Button onClick={() => setNovoAgendamento(true)} className="rounded-full shadow-elegant">
                  <CalendarPlus className="mr-1.5 h-4 w-4" /> Agendar
                </Button>
              </div>
            </div>

            {alertas.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-warning/40 bg-warning/10 p-3">
                <TriangleAlert className="h-4 w-4 shrink-0 text-warning" aria-hidden />
                <span className="text-sm font-medium text-warning">Atenção clínica:</span>
                {alertas.map((x) => (
                  <span
                    key={x}
                    className="rounded-full border border-warning/40 bg-background/50 px-2.5 py-0.5 text-xs font-medium text-warning"
                  >
                    {x}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 divide-x divide-border border-t border-border md:grid-cols-4">
            <Resumo rotulo="Sessões realizadas" valor={String(concluidos.length)} />
            <Resumo rotulo="Total investido" valor={moeda(investido)} />
            <Resumo
              rotulo="Próximo atendimento"
              valor={proximo ? format(new Date(proximo.inicio), "dd/MM 'às' HH:mm") : "—"}
            />
            <Resumo
              rotulo="Anamnese atualizada"
              valor={format(new Date(a.atualizadoEm), "dd/MM/yyyy")}
            />
          </div>
        </Card>

        <Tabs defaultValue="anamnese" className="space-y-5">
          <TabsList className="nao-imprimir h-11 rounded-full bg-muted/70 p-1">
            <TabsTrigger value="anamnese" className="rounded-full px-5">
              Anamnese
            </TabsTrigger>
            <TabsTrigger value="evolucao" className="rounded-full px-5">
              Evolução ({minhasEvolucoes.length})
            </TabsTrigger>
            <TabsTrigger value="agenda" className="rounded-full px-5">
              Agendamentos ({meus.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="anamnese" className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
              <Card className="border-border/60 bg-card/80 shadow-soft lg:col-span-2">
                <CardContent className="space-y-5 p-6">
                  <Bloco titulo="Queixa principal" texto={a.queixaPrincipal} />
                  <Separator />
                  <Bloco titulo="Objetivo do tratamento" texto={a.objetivo} />
                  <Separator />
                  <Bloco titulo="Rotina de skincare" texto={a.rotinaSkincare} />
                  <Separator />
                  <Bloco titulo="Tratamentos anteriores" texto={a.tratamentosAnteriores} />
                  {a.cirurgiasRecentes && (
                    <>
                      <Separator />
                      <Bloco titulo="Cirurgias recentes" texto={a.cirurgiasRecentes} />
                    </>
                  )}
                  <Separator />
                  <Bloco titulo="Observações clínicas" texto={a.observacoes} />
                </CardContent>
              </Card>

              <div className="space-y-5">
                <Card className="border-border/60 bg-card/80 shadow-soft">
                  <CardContent className="space-y-4 p-6">
                    <Cabecalho icone={Sparkles} titulo="Perfil de pele" />
                    <Linha rotulo="Tipo" valor={a.tipoPele} />
                    <Linha rotulo="Fototipo (Fitzpatrick)" valor={a.fototipo} />
                    <Linha rotulo="Sensibilidade" valor={a.sensibilidade} capitalizar />
                    <Linha rotulo="Exposição solar" valor={a.exposicaoSolar} capitalizar />
                    <Linha
                      rotulo="Filtro solar diário"
                      valor={a.filtroSolarDiario ? "Sim" : "Não"}
                    />
                  </CardContent>
                </Card>

                <Card className="border-border/60 bg-card/80 shadow-soft">
                  <CardContent className="space-y-4 p-6">
                    <Cabecalho icone={ClipboardList} titulo="Histórico de saúde" />
                    {condicoes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma condição relatada.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {condicoes.map((c) => (
                          <Badge
                            key={String(c)}
                            variant="outline"
                            className="rounded-full border-warning/40 bg-warning/10 text-warning"
                          >
                            {rotulosSaude[c]}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Separator />
                    <div>
                      <p className="rotulo mb-2">Alergias</p>
                      {a.alergias.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma registrada.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {a.alergias.map((x) => (
                            <Badge
                              key={x}
                              variant="outline"
                              className="rounded-full border-destructive/35 bg-destructive/10 text-destructive"
                            >
                              {x}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="rotulo mb-2">
                        <Pill className="mr-1 inline h-3 w-3" aria-hidden />
                        Medicamentos
                      </p>
                      {a.medicamentos.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum em uso.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {a.medicamentos.map((x) => (
                            <Badge key={x} variant="secondary" className="rounded-full">
                              {x}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60 bg-card/80 shadow-soft">
                  <CardContent className="p-6">
                    <Cabecalho icone={Droplets} titulo="Hábitos de vida" />
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <Habito icone={Droplets} valor={`${a.aguaLitrosDia} L`} texto="água/dia" />
                      <Habito icone={Moon} valor={`${a.horasSono} h`} texto="de sono" />
                      <Habito
                        icone={Sun}
                        valor={a.exercicio ? "Sim" : "Não"}
                        texto="exercício físico"
                      />
                      <Habito
                        icone={ClipboardList}
                        valor={a.fuma ? "Sim" : "Não"}
                        texto="fumante"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="evolucao">
            <Card className="border-border/60 bg-card/80 shadow-soft">
              <CardContent className="p-6 md:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-2xl font-medium">Histórico de evolução</h3>
                  <Button
                    onClick={() => setNovaEvolucao(true)}
                    className="nao-imprimir rounded-full"
                    size="sm"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Registrar sessão
                  </Button>
                </div>

                {minhasEvolucoes.length === 0 ? (
                  <EmptyState
                    icon={ClipboardList}
                    titulo="Nenhuma evolução registrada"
                    descricao="Registre o que foi feito na sessão para acompanhar a resposta ao tratamento."
                    acao={
                      <Button onClick={() => setNovaEvolucao(true)} className="rounded-full">
                        <Plus className="mr-1 h-4 w-4" /> Registrar sessão
                      </Button>
                    }
                  />
                ) : (
                  <div className="space-y-6 border-l-2 border-secondary pl-6">
                    {minhasEvolucoes.map((e) => (
                      <div key={e.id} className="relative">
                        <span
                          className="absolute -left-[31px] top-2 h-4 w-4 rounded-full border-4 border-background bg-primary"
                          aria-hidden
                        />
                        <div className="rounded-2xl border border-border/60 bg-background/60 p-5">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="rotulo">
                                {format(new Date(e.data), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                              </p>
                              <h4 className="mt-1 font-display text-lg font-medium">
                                {procedimento(e.procedimentoId)?.nome ?? "Procedimento"}
                              </h4>
                            </div>
                            <Badge variant="outline" className="rounded-full bg-muted/50">
                              {e.profissional}
                            </Badge>
                          </div>
                          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                            <Detalhe rotulo="Parâmetros" texto={e.parametros} />
                            <Detalhe rotulo="Reação" texto={e.reacao} />
                            <Detalhe rotulo="Orientações" texto={e.orientacoes} />
                            <Detalhe rotulo="Próxima sessão" texto={e.proximaSessao} />
                          </dl>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agenda">
            <Card className="border-border/60 bg-card/80 shadow-soft">
              <CardContent className="p-6 md:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-2xl font-medium">Agendamentos</h3>
                  <Button
                    onClick={() => setNovoAgendamento(true)}
                    className="nao-imprimir rounded-full"
                    size="sm"
                  >
                    <CalendarPlus className="mr-1 h-4 w-4" /> Novo
                  </Button>
                </div>

                {meus.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    titulo="Sem agendamentos"
                    descricao="Esta paciente ainda não tem atendimentos marcados."
                  />
                ) : (
                  <ul className="divide-y divide-border">
                    {meus.map((x) => (
                      <li key={x.id} className="flex flex-wrap items-center gap-4 py-3">
                        <div className="w-24 shrink-0">
                          <p className="font-medium tabular-nums">
                            {format(new Date(x.inicio), "dd/MM/yy")}
                          </p>
                          <p className="text-xs tabular-nums text-muted-foreground">
                            {format(new Date(x.inicio), "HH:mm")} · {x.duracao}min
                          </p>
                        </div>
                        <p className="min-w-0 flex-1 truncate">
                          {procedimento(x.procedimentoId)?.nome}
                        </p>
                        <span className="tabular-nums text-sm text-muted-foreground">
                          {moeda(x.valor)}
                        </span>
                        <StatusBadge status={x.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <PacienteDialog aberto={editando} onOpenChange={setEditando} paciente={p} />
      <EvolucaoDialog
        aberto={novaEvolucao}
        onOpenChange={setNovaEvolucao}
        pacienteId={p.id}
      />
      <AgendamentoDialog
        aberto={novoAgendamento}
        onOpenChange={setNovoAgendamento}
        pacienteIdFixo={p.id}
      />
    </AppLayout>
  );
};

function Resumo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="p-4 text-center">
      <p className="rotulo">{rotulo}</p>
      <p className="mt-1 font-display text-xl font-semibold tabular-nums">{valor}</p>
    </div>
  );
}

function Cabecalho({
  icone: Icone,
  titulo,
}: {
  icone: typeof Sparkles;
  titulo: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/70">
        <Icone className="h-4 w-4 text-primary" aria-hidden />
      </div>
      <h3 className="font-display text-lg font-medium">{titulo}</h3>
    </div>
  );
}

function Bloco({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div>
      <p className="rotulo">{titulo}</p>
      <p className="mt-1.5 leading-relaxed">
        {texto || <span className="text-muted-foreground">Não informado.</span>}
      </p>
    </div>
  );
}

function Linha({
  rotulo,
  valor,
  capitalizar,
}: {
  rotulo: string;
  valor: string;
  capitalizar?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className={`font-medium ${capitalizar ? "capitalize" : ""}`}>{valor || "—"}</span>
    </div>
  );
}

function Habito({
  icone: Icone,
  valor,
  texto,
}: {
  icone: typeof Sparkles;
  valor: string;
  texto: string;
}) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <Icone className="h-4 w-4 text-primary" aria-hidden />
      <p className="mt-1.5 font-display text-lg font-semibold">{valor}</p>
      <p className="text-xs text-muted-foreground">{texto}</p>
    </div>
  );
}

function Detalhe({ rotulo, texto }: { rotulo: string; texto: string }) {
  return (
    <div>
      <dt className="rotulo">{rotulo}</dt>
      <dd className="mt-0.5 leading-relaxed text-muted-foreground">{texto || "—"}</dd>
    </div>
  );
}

export default ProntuarioDetalhe;
