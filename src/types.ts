export type Fototipo = "I" | "II" | "III" | "IV" | "V" | "VI";
export type Sensibilidade = "baixa" | "media" | "alta";
export type Exposicao = "baixa" | "moderada" | "alta";

/** Ficha de anamnese estética — preenchida na avaliação inicial e revisada a cada retorno. */
export type Anamnese = {
  queixaPrincipal: string;
  objetivo: string;
  fototipo: Fototipo;
  tipoPele: string;
  sensibilidade: Sensibilidade;

  /* Histórico de saúde — dispara os alertas de contraindicação */
  gestante: boolean;
  lactante: boolean;
  marcapasso: boolean;
  proteseMetalica: boolean;
  diabetes: boolean;
  hipertensao: boolean;
  epilepsia: boolean;
  cancer: boolean;
  tireoide: boolean;
  queloide: boolean;
  herpes: boolean;
  cirurgiasRecentes: string;
  alergias: string[];
  medicamentos: string[];

  /* Hábitos de vida */
  fuma: boolean;
  alcool: boolean;
  exercicio: boolean;
  aguaLitrosDia: number;
  horasSono: number;
  intestinoRegular: boolean;

  /* Pele e rotina */
  filtroSolarDiario: boolean;
  exposicaoSolar: Exposicao;
  rotinaSkincare: string;
  tratamentosAnteriores: string;

  observacoes: string;
  consentimento: boolean;
  atualizadoEm: string;
};

export type Paciente = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  nascimento: string;
  cpf: string;
  profissao: string;
  comoConheceu: string;
  criadoEm: string;
  anamnese: Anamnese;
};

/** Registro de evolução: o que foi feito na sessão e como a paciente respondeu. */
export type Evolucao = {
  id: string;
  pacienteId: string;
  data: string;
  procedimentoId: string;
  profissional: string;
  parametros: string;
  reacao: string;
  orientacoes: string;
  proximaSessao: string;
};

export type StatusAgendamento =
  | "agendado"
  | "confirmado"
  | "concluido"
  | "cancelado"
  | "faltou";

export type Agendamento = {
  id: string;
  pacienteId: string;
  procedimentoId: string;
  inicio: string;
  duracao: number;
  valor: number;
  status: StatusAgendamento;
  observacao: string;
};

export type Procedimento = {
  id: string;
  nome: string;
  categoria: "Facial" | "Corporal" | "Capilar" | "Avaliação";
  duracao: number;
  valor: number;
  /** Condições que contraindicam este procedimento (chaves da Anamnese). */
  contraindicacoes: (keyof Anamnese)[];
  ativo: boolean;
};

export type Configuracoes = {
  nomeClinica: string;
  profissional: string;
  registro: string;
  telefone: string;
  endereco: string;
  horaAbertura: number;
  horaFechamento: number;
  intervaloMinutos: number;
  diasAtendimento: number[];
  lembreteMinutos: number;
};
