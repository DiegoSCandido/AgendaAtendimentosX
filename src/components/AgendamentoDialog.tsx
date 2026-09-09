import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { TriangleAlert, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClinica } from "@/store/clinica";
import { conflitos, contraindicacoesDe, moedaExata } from "@/lib/clinica";
import type { Agendamento, StatusAgendamento } from "@/types";

const statusOpcoes: StatusAgendamento[] = [
  "agendado",
  "confirmado",
  "concluido",
  "cancelado",
  "faltou",
];

const rotuloStatus: Record<StatusAgendamento, string> = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  concluido: "Concluído",
  cancelado: "Cancelado",
  faltou: "Faltou",
};

type Props = {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  /** Agendamento existente para edição; ausente cria um novo. */
  agendamento?: Agendamento;
  /** Data/hora pré-selecionada ao clicar em um slot vazio da agenda. */
  sugestao?: Date;
  pacienteIdFixo?: string;
};

export function AgendamentoDialog({
  aberto,
  onOpenChange,
  agendamento,
  sugestao,
  pacienteIdFixo,
}: Props) {
  const {
    pacientes,
    procedimentos,
    agendamentos,
    salvarAgendamento,
    paciente: buscarPaciente,
    procedimento: buscarProcedimento,
    novoId,
  } = useClinica();

  const ativos = procedimentos.filter((p) => p.ativo);

  const [pacienteId, setPacienteId] = useState("");
  const [procedimentoId, setProcedimentoId] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [duracao, setDuracao] = useState(60);
  const [valor, setValor] = useState(0);
  const [status, setStatus] = useState<StatusAgendamento>("agendado");
  const [observacao, setObservacao] = useState("");

  // Recarrega o formulário sempre que o diálogo abre.
  useEffect(() => {
    if (!aberto) return;
    const base = agendamento?.inicio ? new Date(agendamento.inicio) : (sugestao ?? new Date());
    setPacienteId(agendamento?.pacienteId ?? pacienteIdFixo ?? "");
    setProcedimentoId(agendamento?.procedimentoId ?? "");
    setData(format(base, "yyyy-MM-dd"));
    setHora(format(base, "HH:mm"));
    setDuracao(agendamento?.duracao ?? 60);
    setValor(agendamento?.valor ?? 0);
    setStatus(agendamento?.status ?? "agendado");
    setObservacao(agendamento?.observacao ?? "");
  }, [aberto, agendamento, sugestao, pacienteIdFixo]);

  // Ao trocar o procedimento, herda duração e valor da tabela.
  const escolherProcedimento = (id: string) => {
    setProcedimentoId(id);
    const p = buscarProcedimento(id);
    if (p) {
      setDuracao(p.duracao);
      setValor(p.valor);
    }
  };

  const inicioIso = useMemo(() => {
    if (!data || !hora) return "";
    const d = new Date(`${data}T${hora}`);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString();
  }, [data, hora]);

  const choques = useMemo(() => {
    if (!inicioIso) return [];
    return conflitos(
      { id: agendamento?.id ?? "novo", inicio: inicioIso, duracao, status },
      agendamentos,
    );
  }, [inicioIso, duracao, status, agendamentos, agendamento?.id]);

  const avisos = contraindicacoesDe(
    buscarPaciente(pacienteId),
    buscarProcedimento(procedimentoId),
  );

  const salvar = () => {
    if (!pacienteId || !procedimentoId || !inicioIso) {
      toast.error("Preencha paciente, procedimento e horário.");
      return;
    }
    salvarAgendamento({
      id: agendamento?.id ?? novoId("ag"),
      pacienteId,
      procedimentoId,
      inicio: inicioIso,
      duracao,
      valor,
      status,
      observacao,
    });
    toast.success(agendamento ? "Agendamento atualizado" : "Agendamento criado", {
      description: `${buscarPaciente(pacienteId)?.nome} • ${format(new Date(inicioIso), "dd/MM 'às' HH:mm")}`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium">
            {agendamento ? "Editar agendamento" : "Novo agendamento"}
          </DialogTitle>
          <DialogDescription>
            Duração e valor vêm da tabela de procedimentos e podem ser ajustados aqui.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ag-paciente">Paciente</Label>
            <Select value={pacienteId} onValueChange={setPacienteId} disabled={!!pacienteIdFixo}>
              <SelectTrigger id="ag-paciente">
                <SelectValue placeholder="Selecione a paciente" />
              </SelectTrigger>
              <SelectContent>
                {pacientes.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ag-procedimento">Procedimento</Label>
            <Select value={procedimentoId} onValueChange={escolherProcedimento}>
              <SelectTrigger id="ag-procedimento">
                <SelectValue placeholder="Selecione o procedimento" />
              </SelectTrigger>
              <SelectContent>
                {ativos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome} — {p.duracao}min · {moedaExata(p.valor)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="grid gap-2">
              <Label htmlFor="ag-data">Data</Label>
              <Input id="ag-data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ag-hora">Hora</Label>
              <Input id="ag-hora" type="time" step={300} value={hora} onChange={(e) => setHora(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ag-duracao">Duração (min)</Label>
              <Input
                id="ag-duracao"
                type="number"
                min={15}
                step={15}
                value={duracao}
                onChange={(e) => setDuracao(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ag-valor">Valor (R$)</Label>
              <Input
                id="ag-valor"
                type="number"
                min={0}
                step={10}
                value={valor}
                onChange={(e) => setValor(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ag-status">Situação</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as StatusAgendamento)}>
              <SelectTrigger id="ag-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOpcoes.map((s) => (
                  <SelectItem key={s} value={s}>
                    {rotuloStatus[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ag-obs">Observação</Label>
            <Textarea
              id="ag-obs"
              rows={2}
              value={observacao}
              placeholder="Preferências, restrições do dia, forma de pagamento..."
              onChange={(e) => setObservacao(e.target.value)}
            />
          </div>

          {avisos.length > 0 && (
            <div className="flex gap-3 rounded-xl border border-destructive/35 bg-destructive/10 p-3 text-sm">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
              <div>
                <p className="font-medium text-destructive">Contraindicação na anamnese</p>
                <p className="text-destructive/90">{avisos.join(" · ")}</p>
              </div>
            </div>
          )}

          {choques.length > 0 && (
            <div className="flex gap-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
              <div>
                <p className="font-medium text-warning">Conflito de horário</p>
                <ul className="text-warning/90">
                  {choques.map((c) => (
                    <li key={c.id}>
                      {format(new Date(c.inicio), "HH:mm")} — {buscarPaciente(c.pacienteId)?.nome} ·{" "}
                      {buscarProcedimento(c.procedimentoId)?.nome}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={salvar} className="shadow-glow">
            {agendamento ? "Salvar alterações" : "Agendar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
