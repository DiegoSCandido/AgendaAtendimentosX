import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  Agendamento,
  Configuracoes,
  Evolucao,
  Paciente,
  Procedimento,
} from "@/types";
import {
  agendamentosPadrao,
  configuracoesPadrao,
  evolucoesPadrao,
  pacientesPadrao,
  procedimentosPadrao,
} from "@/data/seed";
import { gerarId } from "@/lib/clinica";

const CHAVE = "aurora.estetica.v1";

type Estado = {
  pacientes: Paciente[];
  agendamentos: Agendamento[];
  evolucoes: Evolucao[];
  procedimentos: Procedimento[];
  configuracoes: Configuracoes;
};

const estadoInicial = (): Estado => ({
  pacientes: pacientesPadrao,
  agendamentos: agendamentosPadrao,
  evolucoes: evolucoesPadrao,
  procedimentos: procedimentosPadrao,
  configuracoes: configuracoesPadrao,
});

const carregar = (): Estado => {
  if (typeof window === "undefined") return estadoInicial();
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    if (!bruto) return estadoInicial();
    const salvo = JSON.parse(bruto) as Partial<Estado>;
    // Mescla com o padrão para tolerar estados salvos por versões anteriores.
    return { ...estadoInicial(), ...salvo };
  } catch {
    return estadoInicial();
  }
};

type Contexto = Estado & {
  paciente: (id?: string) => Paciente | undefined;
  procedimento: (id?: string) => Procedimento | undefined;
  salvarPaciente: (p: Paciente) => void;
  removerPaciente: (id: string) => void;
  salvarAgendamento: (a: Agendamento) => void;
  removerAgendamento: (id: string) => void;
  mudarStatus: (id: string, status: Agendamento["status"]) => void;
  salvarEvolucao: (e: Evolucao) => void;
  salvarProcedimento: (p: Procedimento) => void;
  removerProcedimento: (id: string) => void;
  salvarConfiguracoes: (c: Configuracoes) => void;
  restaurarDemo: () => void;
  novoId: typeof gerarId;
};

const ClinicaContext = createContext<Contexto | null>(null);

export function ClinicaProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(carregar);

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch {
      /* modo privado ou cota cheia: o protótipo segue funcionando em memória */
    }
  }, [estado]);

  const upsert = useCallback(
    <T extends { id: string }>(chave: keyof Estado, item: T) =>
      setEstado((s) => {
        const lista = s[chave] as unknown as T[];
        const existe = lista.some((i) => i.id === item.id);
        return {
          ...s,
          [chave]: existe ? lista.map((i) => (i.id === item.id ? item : i)) : [...lista, item],
        };
      }),
    [],
  );

  const remover = useCallback(
    (chave: keyof Estado, id: string) =>
      setEstado((s) => ({
        ...s,
        [chave]: (s[chave] as unknown as { id: string }[]).filter((i) => i.id !== id),
      })),
    [],
  );

  const valor = useMemo<Contexto>(
    () => ({
      ...estado,
      paciente: (id) => estado.pacientes.find((p) => p.id === id),
      procedimento: (id) => estado.procedimentos.find((p) => p.id === id),
      salvarPaciente: (p) => upsert("pacientes", p),
      removerPaciente: (id) =>
        setEstado((s) => ({
          ...s,
          pacientes: s.pacientes.filter((p) => p.id !== id),
          agendamentos: s.agendamentos.filter((a) => a.pacienteId !== id),
          evolucoes: s.evolucoes.filter((e) => e.pacienteId !== id),
        })),
      salvarAgendamento: (a) => upsert("agendamentos", a),
      removerAgendamento: (id) => remover("agendamentos", id),
      mudarStatus: (id, status) =>
        setEstado((s) => ({
          ...s,
          agendamentos: s.agendamentos.map((a) => (a.id === id ? { ...a, status } : a)),
        })),
      salvarEvolucao: (e) => upsert("evolucoes", e),
      salvarProcedimento: (p) => upsert("procedimentos", p),
      removerProcedimento: (id) => remover("procedimentos", id),
      salvarConfiguracoes: (c) => setEstado((s) => ({ ...s, configuracoes: c })),
      restaurarDemo: () => setEstado(estadoInicial()),
      novoId: gerarId,
    }),
    [estado, upsert, remover],
  );

  return <ClinicaContext.Provider value={valor}>{children}</ClinicaContext.Provider>;
}

export function useClinica() {
  const ctx = useContext(ClinicaContext);
  if (!ctx) throw new Error("useClinica precisa estar dentro de <ClinicaProvider>");
  return ctx;
}
