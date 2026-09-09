import type {
  Agendamento,
  Anamnese,
  Paciente,
  Procedimento,
  StatusAgendamento,
} from "@/types";

export const moeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const moedaExata = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const iniciais = (nome: string) =>
  nome
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 2 || p === p.toUpperCase())
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || nome.slice(0, 2).toUpperCase();

export const idade = (nascimento: string) => {
  const n = new Date(nascimento);
  const hoje = new Date();
  let anos = hoje.getFullYear() - n.getFullYear();
  const m = hoje.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < n.getDate())) anos--;
  return anos;
};

export const fim = (a: Pick<Agendamento, "inicio" | "duracao">) =>
  new Date(new Date(a.inicio).getTime() + a.duracao * 60000);

/** Dois agendamentos colidem se as janelas se sobrepõem e nenhum foi cancelado. */
export const colide = (
  a: Pick<Agendamento, "inicio" | "duracao" | "status">,
  b: Pick<Agendamento, "inicio" | "duracao" | "status">,
) => {
  if (a.status === "cancelado" || b.status === "cancelado") return false;
  const aIni = new Date(a.inicio).getTime();
  const bIni = new Date(b.inicio).getTime();
  return aIni < fim(b).getTime() && bIni < fim(a).getTime();
};

export const conflitos = (
  candidato: Pick<Agendamento, "id" | "inicio" | "duracao" | "status">,
  lista: Agendamento[],
) => lista.filter((a) => a.id !== candidato.id && colide(candidato, a));

export const rotulosSaude: Partial<Record<keyof Anamnese, string>> = {
  gestante: "Gestante",
  lactante: "Lactante",
  marcapasso: "Marca-passo",
  proteseMetalica: "Prótese metálica",
  diabetes: "Diabetes",
  hipertensao: "Hipertensão",
  epilepsia: "Epilepsia",
  cancer: "Histórico oncológico",
  tireoide: "Alteração de tireoide",
  queloide: "Tendência a queloide",
  herpes: "Herpes recorrente",
};

/** Condições marcadas na anamnese que contraindicam o procedimento escolhido. */
export const contraindicacoesDe = (
  paciente: Paciente | undefined,
  procedimento: Procedimento | undefined,
): string[] => {
  if (!paciente || !procedimento) return [];
  return procedimento.contraindicacoes
    .filter((chave) => paciente.anamnese[chave] === true)
    .map((chave) => rotulosSaude[chave] ?? String(chave));
};

/** Alertas gerais do prontuário, independentes do procedimento. */
export const alertasDe = (paciente: Paciente): string[] => {
  const a = paciente.anamnese;
  const out: string[] = [];
  (Object.keys(rotulosSaude) as (keyof Anamnese)[]).forEach((k) => {
    if (a[k] === true) out.push(rotulosSaude[k]!);
  });
  if (a.alergias.length) out.push(`Alergia: ${a.alergias.join(", ")}`);
  if (a.medicamentos.some((m) => /isotretino/i.test(m)))
    out.push("Isotretinoína em uso — sem procedimentos abrasivos");
  if (!a.consentimento) out.push("Termo de consentimento pendente");
  return out;
};

export const statusMeta: Record<
  StatusAgendamento,
  { rotulo: string; classe: string; ponto: string }
> = {
  agendado: {
    rotulo: "Agendado",
    classe: "border-info/35 bg-info/10 text-info",
    ponto: "bg-info",
  },
  confirmado: {
    rotulo: "Confirmado",
    classe: "border-success/35 bg-success/10 text-success",
    ponto: "bg-success",
  },
  concluido: {
    rotulo: "Concluído",
    classe: "border-border bg-muted text-muted-foreground",
    ponto: "bg-muted-foreground",
  },
  cancelado: {
    rotulo: "Cancelado",
    classe: "border-destructive/35 bg-destructive/10 text-destructive",
    ponto: "bg-destructive",
  },
  faltou: {
    rotulo: "Faltou",
    classe: "border-warning/40 bg-warning/10 text-warning",
    ponto: "bg-warning",
  },
};

export const gerarId = (prefixo: string) =>
  `${prefixo}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
