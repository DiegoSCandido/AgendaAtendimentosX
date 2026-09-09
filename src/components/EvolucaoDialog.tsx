import { useEffect, useState } from "react";
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
import type { Evolucao } from "@/types";

/** Registro de evolução de uma sessão já realizada. */
export function EvolucaoDialog({
  aberto,
  onOpenChange,
  pacienteId,
  evolucao,
}: {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  pacienteId: string;
  evolucao?: Evolucao;
}) {
  const { procedimentos, configuracoes, salvarEvolucao, novoId } = useClinica();
  const [form, setForm] = useState<Evolucao | null>(null);

  useEffect(() => {
    if (!aberto) return;
    setForm(
      evolucao
        ? { ...evolucao }
        : {
            id: novoId("ev"),
            pacienteId,
            data: new Date().toISOString(),
            procedimentoId: "",
            profissional: configuracoes.profissional,
            parametros: "",
            reacao: "",
            orientacoes: "",
            proximaSessao: "",
          },
    );
  }, [aberto, evolucao, pacienteId, configuracoes.profissional, novoId]);

  if (!form) return null;

  const set = <K extends keyof Evolucao>(k: K, v: Evolucao[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const salvar = () => {
    if (!form.procedimentoId) {
      toast.error("Selecione o procedimento realizado.");
      return;
    }
    salvarEvolucao(form);
    toast.success("Evolução registrada");
    onOpenChange(false);
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium">
            {evolucao ? "Editar evolução" : "Registrar sessão"}
          </DialogTitle>
          <DialogDescription>
            O que foi feito, como a pele respondeu e o que foi orientado.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="ev-data">Data</Label>
              <Input
                id="ev-data"
                type="date"
                value={form.data.slice(0, 10)}
                onChange={(e) => {
                  const d = new Date(form.data);
                  const [a, m, dia] = e.target.value.split("-").map(Number);
                  d.setFullYear(a, m - 1, dia);
                  set("data", d.toISOString());
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ev-prof">Profissional</Label>
              <Input
                id="ev-prof"
                value={form.profissional}
                onChange={(e) => set("profissional", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ev-proc">Procedimento realizado</Label>
            <Select value={form.procedimentoId} onValueChange={(v) => set("procedimentoId", v)}>
              <SelectTrigger id="ev-proc">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {procedimentos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ev-param">Parâmetros e produtos utilizados</Label>
            <Textarea
              id="ev-param"
              rows={2}
              value={form.parametros}
              placeholder="Intensidade, ativos, tempo de pausa..."
              onChange={(e) => set("parametros", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ev-reacao">Reação da paciente</Label>
            <Textarea
              id="ev-reacao"
              rows={2}
              value={form.reacao}
              placeholder="Eritema, sensibilidade, intercorrências..."
              onChange={(e) => set("reacao", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ev-orient">Orientações pós-procedimento</Label>
            <Textarea
              id="ev-orient"
              rows={2}
              value={form.orientacoes}
              onChange={(e) => set("orientacoes", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ev-proxima">Conduta para a próxima sessão</Label>
            <Input
              id="ev-proxima"
              value={form.proximaSessao}
              placeholder="Retorno em 21 dias, aumentar intensidade..."
              onChange={(e) => set("proximaSessao", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={salvar} className="shadow-glow">
            Salvar evolução
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
