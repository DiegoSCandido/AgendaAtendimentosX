import { describe, it, expect } from "vitest";
import {
  alertasDe,
  colide,
  conflitos,
  contraindicacoesDe,
  idade,
  iniciais,
} from "@/lib/clinica";
import { pacientesPadrao, procedimentosPadrao } from "@/data/seed";
import type { Agendamento } from "@/types";

const ag = (
  id: string,
  hora: string,
  duracao: number,
  status: Agendamento["status"] = "confirmado",
): Agendamento => ({
  id,
  pacienteId: "1",
  procedimentoId: "pr2",
  inicio: `2026-09-10T${hora}:00.000Z`,
  duracao,
  valor: 200,
  status,
  observacao: "",
});

describe("conflito de horário", () => {
  it("acusa sobreposição parcial", () => {
    expect(colide(ag("a", "09:00", 60), ag("b", "09:30", 60))).toBe(true);
  });

  it("aceita atendimentos encostados", () => {
    expect(colide(ag("a", "09:00", 60), ag("b", "10:00", 60))).toBe(false);
  });

  it("ignora agendamentos cancelados", () => {
    expect(colide(ag("a", "09:00", 60), ag("b", "09:30", 60, "cancelado"))).toBe(false);
  });

  it("não considera o próprio agendamento ao editar", () => {
    const lista = [ag("a", "09:00", 60), ag("b", "14:00", 60)];
    expect(conflitos(ag("a", "09:00", 60), lista)).toHaveLength(0);
  });

  it("encontra o agendamento que bloqueia o horário", () => {
    const lista = [ag("a", "09:00", 60), ag("b", "14:00", 60)];
    expect(conflitos(ag("novo", "09:30", 30), lista).map((x) => x.id)).toEqual(["a"]);
  });
});

describe("contraindicações", () => {
  const gestante = pacientesPadrao.find((p) => p.anamnese.gestante)!;
  const marcapasso = pacientesPadrao.find((p) => p.anamnese.marcapasso)!;
  const radiofrequencia = procedimentosPadrao.find((p) => p.id === "pr3")!;
  const hidratacao = procedimentosPadrao.find((p) => p.id === "pr11")!;

  it("bloqueia radiofrequência para gestante", () => {
    expect(contraindicacoesDe(gestante, radiofrequencia)).toContain("Gestante");
  });

  it("bloqueia radiofrequência para portadora de marca-passo", () => {
    expect(contraindicacoesDe(marcapasso, radiofrequencia)).toContain("Marca-passo");
  });

  it("libera procedimento sem restrição", () => {
    expect(contraindicacoesDe(gestante, hidratacao)).toHaveLength(0);
  });

  it("sinaliza isotretinoína nos alertas do prontuário", () => {
    const emIsotretinoina = pacientesPadrao.find((p) =>
      p.anamnese.medicamentos.some((m) => /isotretino/i.test(m)),
    )!;
    expect(alertasDe(emIsotretinoina).join(" ")).toMatch(/Isotretinoína/);
  });
});

describe("formatação", () => {
  it("monta iniciais ignorando preposições", () => {
    expect(iniciais("Marina Albuquerque")).toBe("MA");
    expect(iniciais("Ana de Souza Lima")).toBe("AS");
  });

  it("calcula idade sem contar aniversário futuro", () => {
    const hoje = new Date();
    const aindaNaoFezAniversario = new Date(
      hoje.getFullYear() - 30,
      hoje.getMonth(),
      hoje.getDate() + 1,
    );
    expect(idade(aindaNaoFezAniversario.toISOString())).toBe(29);
  });
});
