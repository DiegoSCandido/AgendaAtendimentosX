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
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClinica } from "@/store/clinica";
import { rotulosSaude } from "@/lib/clinica";
import type { Anamnese, Exposicao, Fototipo, Paciente, Sensibilidade } from "@/types";

const anamneseVazia = (): Anamnese => ({
  queixaPrincipal: "",
  objetivo: "",
  fototipo: "III",
  tipoPele: "Normal",
  sensibilidade: "media",
  gestante: false,
  lactante: false,
  marcapasso: false,
  proteseMetalica: false,
  diabetes: false,
  hipertensao: false,
  epilepsia: false,
  cancer: false,
  tireoide: false,
  queloide: false,
  herpes: false,
  cirurgiasRecentes: "",
  alergias: [],
  medicamentos: [],
  fuma: false,
  alcool: false,
  exercicio: false,
  aguaLitrosDia: 2,
  horasSono: 7,
  intestinoRegular: true,
  filtroSolarDiario: false,
  exposicaoSolar: "moderada",
  rotinaSkincare: "",
  tratamentosAnteriores: "",
  observacoes: "",
  consentimento: false,
  atualizadoEm: new Date().toISOString().slice(0, 10),
});

const pacienteVazio = (id: string): Paciente => ({
  id,
  nome: "",
  email: "",
  telefone: "",
  nascimento: "",
  cpf: "",
  profissao: "",
  comoConheceu: "",
  criadoEm: new Date().toISOString().slice(0, 10),
  anamnese: anamneseVazia(),
});

const fototipos: { valor: Fototipo; texto: string }[] = [
  { valor: "I", texto: "I — Muito clara, sempre queima" },
  { valor: "II", texto: "II — Clara, queima com facilidade" },
  { valor: "III", texto: "III — Morena clara, queima moderadamente" },
  { valor: "IV", texto: "IV — Morena moderada, raramente queima" },
  { valor: "V", texto: "V — Morena escura, quase nunca queima" },
  { valor: "VI", texto: "VI — Negra, nunca queima" },
];

const chavesSaude = Object.keys(rotulosSaude) as (keyof Anamnese)[];

export function PacienteDialog({
  aberto,
  onOpenChange,
  paciente,
}: {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  paciente?: Paciente;
}) {
  const { salvarPaciente, novoId } = useClinica();
  const [form, setForm] = useState<Paciente>(() => pacienteVazio("tmp"));

  useEffect(() => {
    if (!aberto) return;
    setForm(paciente ? structuredClone(paciente) : pacienteVazio(novoId("pa")));
  }, [aberto, paciente, novoId]);

  const set = <K extends keyof Paciente>(k: K, v: Paciente[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const setA = <K extends keyof Anamnese>(k: K, v: Anamnese[K]) =>
    setForm((f) => ({ ...f, anamnese: { ...f.anamnese, [k]: v } }));

  const salvar = () => {
    if (!form.nome.trim()) {
      toast.error("Informe o nome da paciente.");
      return;
    }
    salvarPaciente({
      ...form,
      anamnese: { ...form.anamnese, atualizadoEm: new Date().toISOString().slice(0, 10) },
    });
    toast.success(paciente ? "Prontuário atualizado" : "Prontuário criado", {
      description: form.nome,
    });
    onOpenChange(false);
  };

  const lista = (v: string[]) => v.join(", ");
  const parseLista = (v: string) =>
    v.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-3xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-medium">
            {paciente ? "Editar prontuário" : "Novo prontuário"}
          </DialogTitle>
          <DialogDescription>
            Dados cadastrais e ficha de anamnese. As condições marcadas geram alertas
            automáticos no agendamento.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="cadastro" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
            <TabsTrigger value="saude">Saúde</TabsTrigger>
            <TabsTrigger value="pele">Pele e hábitos</TabsTrigger>
          </TabsList>

          <div className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2 pt-4">
            <TabsContent value="cadastro" className="mt-0 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo id="nome" rotulo="Nome completo">
                  <Input id="nome" value={form.nome} onChange={(e) => set("nome", e.target.value)} />
                </Campo>
                <Campo id="nascimento" rotulo="Data de nascimento">
                  <Input
                    id="nascimento"
                    type="date"
                    value={form.nascimento}
                    onChange={(e) => set("nascimento", e.target.value)}
                  />
                </Campo>
                <Campo id="telefone" rotulo="Telefone">
                  <Input
                    id="telefone"
                    value={form.telefone}
                    placeholder="(00) 00000-0000"
                    onChange={(e) => set("telefone", e.target.value)}
                  />
                </Campo>
                <Campo id="email" rotulo="E-mail">
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                </Campo>
                <Campo id="cpf" rotulo="CPF">
                  <Input id="cpf" value={form.cpf} onChange={(e) => set("cpf", e.target.value)} />
                </Campo>
                <Campo id="profissao" rotulo="Profissão">
                  <Input
                    id="profissao"
                    value={form.profissao}
                    onChange={(e) => set("profissao", e.target.value)}
                  />
                </Campo>
                <Campo id="conheceu" rotulo="Como conheceu a clínica">
                  <Input
                    id="conheceu"
                    value={form.comoConheceu}
                    placeholder="Indicação, Instagram, Google..."
                    onChange={(e) => set("comoConheceu", e.target.value)}
                  />
                </Campo>
              </div>

              <Separator />

              <Campo id="queixa" rotulo="Queixa principal">
                <Textarea
                  id="queixa"
                  rows={2}
                  value={form.anamnese.queixaPrincipal}
                  placeholder="O que trouxe a paciente à clínica?"
                  onChange={(e) => setA("queixaPrincipal", e.target.value)}
                />
              </Campo>
              <Campo id="objetivo" rotulo="Objetivo do tratamento">
                <Textarea
                  id="objetivo"
                  rows={2}
                  value={form.anamnese.objetivo}
                  onChange={(e) => setA("objetivo", e.target.value)}
                />
              </Campo>

              <label className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
                <span>
                  <span className="block text-sm font-medium">Termo de consentimento assinado</span>
                  <span className="block text-xs text-muted-foreground">
                    Sem o termo, o prontuário fica marcado como pendente.
                  </span>
                </span>
                <Switch
                  checked={form.anamnese.consentimento}
                  onCheckedChange={(v) => setA("consentimento", v)}
                />
              </label>
            </TabsContent>

            <TabsContent value="saude" className="mt-0 grid gap-4">
              <p className="rotulo">Histórico de saúde</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {chavesSaude.map((chave) => (
                  <label
                    key={chave}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm"
                  >
                    {rotulosSaude[chave]}
                    <Switch
                      checked={form.anamnese[chave] as boolean}
                      onCheckedChange={(v) => setA(chave, v as never)}
                    />
                  </label>
                ))}
              </div>

              <Campo id="alergias" rotulo="Alergias (separadas por vírgula)">
                <Input
                  id="alergias"
                  value={lista(form.anamnese.alergias)}
                  placeholder="Lidocaína, ácido glicólico..."
                  onChange={(e) => setA("alergias", parseLista(e.target.value))}
                />
              </Campo>
              <Campo id="medicamentos" rotulo="Medicamentos em uso (separados por vírgula)">
                <Input
                  id="medicamentos"
                  value={lista(form.anamnese.medicamentos)}
                  placeholder="Isotretinoína 20mg, Losartana..."
                  onChange={(e) => setA("medicamentos", parseLista(e.target.value))}
                />
              </Campo>
              <Campo id="cirurgias" rotulo="Cirurgias ou procedimentos recentes">
                <Textarea
                  id="cirurgias"
                  rows={2}
                  value={form.anamnese.cirurgiasRecentes}
                  onChange={(e) => setA("cirurgiasRecentes", e.target.value)}
                />
              </Campo>
            </TabsContent>

            <TabsContent value="pele" className="mt-0 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Campo id="fototipo" rotulo="Fototipo (Fitzpatrick)">
                  <Select
                    value={form.anamnese.fototipo}
                    onValueChange={(v) => setA("fototipo", v as Fototipo)}
                  >
                    <SelectTrigger id="fototipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fototipos.map((f) => (
                        <SelectItem key={f.valor} value={f.valor}>
                          {f.texto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Campo>
                <Campo id="tipoPele" rotulo="Tipo de pele">
                  <Input
                    id="tipoPele"
                    value={form.anamnese.tipoPele}
                    placeholder="Mista, oleosa, seca..."
                    onChange={(e) => setA("tipoPele", e.target.value)}
                  />
                </Campo>
                <Campo id="sensibilidade" rotulo="Sensibilidade">
                  <Select
                    value={form.anamnese.sensibilidade}
                    onValueChange={(v) => setA("sensibilidade", v as Sensibilidade)}
                  >
                    <SelectTrigger id="sensibilidade">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </Campo>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Campo id="agua" rotulo="Água por dia (litros)">
                  <Input
                    id="agua"
                    type="number"
                    step={0.5}
                    min={0}
                    value={form.anamnese.aguaLitrosDia}
                    onChange={(e) => setA("aguaLitrosDia", Number(e.target.value))}
                  />
                </Campo>
                <Campo id="sono" rotulo="Horas de sono">
                  <Input
                    id="sono"
                    type="number"
                    min={0}
                    max={16}
                    value={form.anamnese.horasSono}
                    onChange={(e) => setA("horasSono", Number(e.target.value))}
                  />
                </Campo>
                <Campo id="sol" rotulo="Exposição solar">
                  <Select
                    value={form.anamnese.exposicaoSolar}
                    onValueChange={(v) => setA("exposicaoSolar", v as Exposicao)}
                  >
                    <SelectTrigger id="sol">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="moderada">Moderada</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </Campo>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ["fuma", "Fumante"],
                    ["alcool", "Consome álcool"],
                    ["exercicio", "Pratica exercício"],
                    ["intestinoRegular", "Intestino regular"],
                    ["filtroSolarDiario", "Usa filtro solar diariamente"],
                  ] as const
                ).map(([chave, texto]) => (
                  <label
                    key={chave}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm"
                  >
                    {texto}
                    <Switch
                      checked={form.anamnese[chave]}
                      onCheckedChange={(v) => setA(chave, v as never)}
                    />
                  </label>
                ))}
              </div>

              <Campo id="skincare" rotulo="Rotina de skincare atual">
                <Textarea
                  id="skincare"
                  rows={2}
                  value={form.anamnese.rotinaSkincare}
                  onChange={(e) => setA("rotinaSkincare", e.target.value)}
                />
              </Campo>
              <Campo id="anteriores" rotulo="Tratamentos estéticos anteriores">
                <Textarea
                  id="anteriores"
                  rows={2}
                  value={form.anamnese.tratamentosAnteriores}
                  onChange={(e) => setA("tratamentosAnteriores", e.target.value)}
                />
              </Campo>
              <Campo id="obs" rotulo="Observações clínicas">
                <Textarea
                  id="obs"
                  rows={3}
                  value={form.anamnese.observacoes}
                  onChange={(e) => setA("observacoes", e.target.value)}
                />
              </Campo>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t border-border pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={salvar} className="shadow-glow">
            Salvar prontuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Campo({
  id,
  rotulo,
  children,
}: {
  id: string;
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{rotulo}</Label>
      {children}
    </div>
  );
}
