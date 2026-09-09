import { useState } from "react";
import { toast } from "sonner";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useClinica } from "@/store/clinica";
import { moedaExata } from "@/lib/clinica";
import type { Configuracoes as Conf, Procedimento } from "@/types";

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const Configuracoes = () => {
  const {
    configuracoes,
    procedimentos,
    salvarConfiguracoes,
    salvarProcedimento,
    removerProcedimento,
    restaurarDemo,
    novoId,
  } = useClinica();

  const [form, setForm] = useState<Conf>(configuracoes);

  const set = <K extends keyof Conf>(k: K, v: Conf[K]) => setForm((f) => ({ ...f, [k]: v }));

  const alternarDia = (d: number) =>
    set(
      "diasAtendimento",
      form.diasAtendimento.includes(d)
        ? form.diasAtendimento.filter((x) => x !== d)
        : [...form.diasAtendimento, d].sort(),
    );

  const salvar = () => {
    if (form.horaFechamento <= form.horaAbertura) {
      toast.error("O horário de fechamento precisa ser depois da abertura.");
      return;
    }
    salvarConfiguracoes(form);
    toast.success("Configurações salvas");
  };

  const atualizarProc = (p: Procedimento, campo: keyof Procedimento, valor: unknown) =>
    salvarProcedimento({ ...p, [campo]: valor } as Procedimento);

  const adicionarProc = () => {
    salvarProcedimento({
      id: novoId("pr"),
      nome: "Novo procedimento",
      categoria: "Facial",
      duracao: 60,
      valor: 200,
      contraindicacoes: [],
      ativo: true,
    });
    toast.success("Procedimento adicionado", { description: "Edite o nome e o valor na tabela." });
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="rotulo">Configurações</p>
          <h1 className="mt-2 font-display text-4xl font-medium md:text-5xl">
            Sua <span className="italic text-primary">clínica</span>
          </h1>
        </header>

        <Card className="border-border/60 bg-card/80 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-2xl font-medium">Dados da clínica</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="c-nome">Nome</Label>
              <Input id="c-nome" value={form.nomeClinica} onChange={(e) => set("nomeClinica", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-prof">Profissional responsável</Label>
              <Input id="c-prof" value={form.profissional} onChange={(e) => set("profissional", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-reg">Registro profissional</Label>
              <Input id="c-reg" value={form.registro} onChange={(e) => set("registro", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-tel">Telefone</Label>
              <Input id="c-tel" value={form.telefone} onChange={(e) => set("telefone", e.target.value)} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="c-end">Endereço</Label>
              <Input id="c-end" value={form.endereco} onChange={(e) => set("endereco", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-2xl font-medium">
              Horário de atendimento
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Define a régua da agenda e o destaque dos dias fechados.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="c-abre">Abre às</Label>
                <Input
                  id="c-abre"
                  type="number"
                  min={0}
                  max={23}
                  value={form.horaAbertura}
                  onChange={(e) => set("horaAbertura", Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-fecha">Fecha às</Label>
                <Input
                  id="c-fecha"
                  type="number"
                  min={1}
                  max={24}
                  value={form.horaFechamento}
                  onChange={(e) => set("horaFechamento", Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="c-lembrete">Lembrete (min antes)</Label>
                <Input
                  id="c-lembrete"
                  type="number"
                  min={5}
                  step={5}
                  value={form.lembreteMinutos}
                  onChange={(e) => set("lembreteMinutos", Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Dias de atendimento</Label>
              <div className="flex flex-wrap gap-2">
                {diasSemana.map((d, i) => {
                  const ativo = form.diasAtendimento.includes(i);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => alternarDia(i)}
                      aria-pressed={ativo}
                      className={`rounded-full border px-4 py-2 text-sm transition-smooth ${
                        ativo
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="font-display text-2xl font-medium">
                Tabela de procedimentos
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Duração e valor alimentam a agenda e o financeiro.
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full" onClick={adicionarProc}>
              <Plus className="mr-1 h-4 w-4" /> Adicionar
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Procedimento</TableHead>
                  <TableHead className="w-28">Duração</TableHead>
                  <TableHead className="w-32">Valor</TableHead>
                  <TableHead className="w-20 text-center">Ativo</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {procedimentos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Input
                        value={p.nome}
                        aria-label={`Nome do procedimento ${p.nome}`}
                        onChange={(e) => atualizarProc(p, "nome", e.target.value)}
                        className="h-9 border-transparent bg-transparent px-2 hover:border-border focus:border-input"
                      />
                      <span className="px-2 text-xs text-muted-foreground">{p.categoria}</span>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={15}
                        step={15}
                        value={p.duracao}
                        aria-label={`Duração de ${p.nome}`}
                        onChange={(e) => atualizarProc(p, "duracao", Number(e.target.value))}
                        className="h-9 tabular-nums"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step={10}
                        value={p.valor}
                        aria-label={`Valor de ${p.nome}`}
                        onChange={(e) => atualizarProc(p, "valor", Number(e.target.value))}
                        className="h-9 tabular-nums"
                      />
                      <span className="block px-1 text-xs text-muted-foreground">
                        {moedaExata(p.valor)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={p.ativo}
                        aria-label={`Procedimento ${p.nome} ativo`}
                        onCheckedChange={(v) => atualizarProc(p, "ativo", v)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        aria-label={`Excluir ${p.nome}`}
                        onClick={() => {
                          removerProcedimento(p.id);
                          toast.success("Procedimento removido");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-soft">
          <CardHeader>
            <CardTitle className="font-display text-2xl font-medium">Dados do protótipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              As alterações ficam salvas no navegador. Restaure os dados de demonstração para
              deixar o sistema pronto para uma nova apresentação.
            </p>
            <Separator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="rounded-full">
                  <RotateCcw className="mr-1.5 h-4 w-4" /> Restaurar dados de demonstração
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Restaurar dados de demonstração?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Todos os pacientes, agendamentos e evoluções criados nesta sessão serão
                    substituídos pelos dados fictícios originais.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      restaurarDemo();
                      setForm({ ...form });
                      toast.success("Dados restaurados");
                    }}
                  >
                    Restaurar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <div className="sticky bottom-4 flex justify-end">
          <Button onClick={salvar} size="lg" className="rounded-full shadow-elegant">
            Salvar configurações
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Configuracoes;
