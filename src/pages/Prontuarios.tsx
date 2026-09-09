import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowUpRight,
  FileText,
  Mail,
  Phone,
  Plus,
  Search,
  TriangleAlert,
  Users,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/EmptyState";
import { PacienteDialog } from "@/components/PacienteDialog";
import { useClinica } from "@/store/clinica";
import { alertasDe, iniciais } from "@/lib/clinica";

type Ordem = "nome" | "recente" | "sessoes";

const Prontuarios = () => {
  const { pacientes, agendamentos } = useClinica();
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("nome");
  const [novo, setNovo] = useState(false);

  const enriquecidos = useMemo(
    () =>
      pacientes.map((p) => {
        const sessoes = agendamentos.filter(
          (a) => a.pacienteId === p.id && a.status === "concluido",
        );
        const ultima = sessoes
          .map((a) => new Date(a.inicio))
          .sort((a, b) => +b - +a)[0];
        return { ...p, sessoes: sessoes.length, ultima, alertas: alertasDe(p) };
      }),
    [pacientes, agendamentos],
  );

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = enriquecidos.filter((p) =>
      [p.nome, p.telefone, p.email, p.anamnese.tipoPele]
        .join(" ")
        .toLowerCase()
        .includes(termo),
    );
    return lista.sort((a, b) => {
      if (ordem === "sessoes") return b.sessoes - a.sessoes;
      if (ordem === "recente") return (+(b.ultima ?? 0)) - (+(a.ultima ?? 0));
      return a.nome.localeCompare(b.nome, "pt-BR");
    });
  }, [enriquecidos, busca, ordem]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="rotulo">Prontuários</p>
            <h1 className="mt-2 font-display text-4xl font-medium md:text-5xl">
              Seus <span className="italic text-primary">pacientes</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              {pacientes.length} prontuários cadastrados
            </p>
          </div>
          <Button onClick={() => setNovo(true)} className="rounded-full shadow-elegant">
            <Plus className="mr-1 h-4 w-4" /> Novo prontuário
          </Button>
        </header>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, telefone ou tipo de pele..."
              aria-label="Buscar paciente"
              className="h-12 rounded-full bg-card/80 pl-11"
            />
          </div>
          <Select value={ordem} onValueChange={(v) => setOrdem(v as Ordem)}>
            <SelectTrigger className="h-12 w-full rounded-full bg-card/80 sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nome">Ordenar por nome</SelectItem>
              <SelectItem value="recente">Visita mais recente</SelectItem>
              <SelectItem value="sessoes">Mais sessões</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtrados.length === 0 ? (
          <EmptyState
            icon={Users}
            titulo="Nenhum prontuário encontrado"
            descricao={
              busca
                ? `Nada corresponde a "${busca}".`
                : "Cadastre a primeira paciente para começar."
            }
            acao={
              <Button onClick={() => setNovo(true)} className="rounded-full">
                <Plus className="mr-1 h-4 w-4" /> Novo prontuário
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtrados.map((p) => (
              <Card
                key={p.id}
                className="border-border/60 bg-card/80 shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-elegant"
              >
                <CardContent className="flex h-full flex-col p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 shrink-0 border-2 border-background shadow-soft">
                      <AvatarFallback className="bg-gradient-spa text-base text-primary-foreground">
                        {iniciais(p.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-display text-xl font-semibold">{p.nome}</h3>
                      <p className="truncate text-sm text-muted-foreground">
                        {p.anamnese.tipoPele} · fototipo {p.anamnese.fototipo}
                      </p>
                    </div>
                  </div>

                  {p.alertas.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.alertas.slice(0, 3).map((a) => (
                        <span
                          key={a}
                          className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning"
                        >
                          <TriangleAlert className="h-2.5 w-2.5" aria-hidden />
                          {a}
                        </span>
                      ))}
                      {p.alertas.length > 3 && (
                        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                          +{p.alertas.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-5 space-y-2 border-t border-border/60 pt-4 text-sm">
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {p.telefone || "—"}
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{p.email || "—"}</span>
                    </p>
                  </div>

                  <div className="mt-5 mb-5 flex items-center justify-between border-t border-border/60 pt-4">
                    <div>
                      <p className="rotulo">Última visita</p>
                      <p className="mt-0.5 font-medium">
                        {p.ultima ? format(p.ultima, "dd MMM yyyy", { locale: ptBR }) : "Sem visitas"}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="shrink-0 rounded-full border-primary/30 bg-primary/10 text-primary"
                    >
                      {p.sessoes} {p.sessoes === 1 ? "sessão" : "sessões"}
                    </Badge>
                  </div>

                  <Button
                    asChild
                    variant="ghost"
                    className="mt-auto w-full justify-between rounded-xl bg-secondary/50 hover:bg-secondary/80"
                  >
                    <Link to={`/pacientes/${p.id}`}>
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" aria-hidden /> Abrir prontuário
                      </span>
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <PacienteDialog aberto={novo} onOpenChange={setNovo} />
    </AppLayout>
  );
};

export default Prontuarios;
