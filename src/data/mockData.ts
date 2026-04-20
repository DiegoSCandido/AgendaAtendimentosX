export type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  initials: string;
  lastVisit: string;
  totalSessions: number;
  skinType: string;
  allergies: string[];
  medications: string[];
  observations: string;
  procedures: Procedure[];
};

export type Procedure = {
  id: string;
  date: string;
  name: string;
  professional: string;
  notes: string;
};

export type Appointment = {
  id: string;
  patientName: string;
  patientInitials: string;
  procedure: string;
  date: string; // ISO
  duration: number; // minutes
  status: "confirmado" | "pendente" | "concluido";
};

export const patients: Patient[] = [
  {
    id: "1",
    name: "Marina Albuquerque",
    email: "marina.alb@email.com",
    phone: "(11) 98765-4321",
    birthDate: "1989-04-12",
    initials: "MA",
    lastVisit: "2026-04-15",
    totalSessions: 12,
    skinType: "Mista, sensível",
    allergies: ["Ácido glicólico"],
    medications: ["Vitamina D"],
    observations: "Cliente em protocolo de rejuvenescimento facial. Resposta excelente ao radiofrequência.",
    procedures: [
      { id: "p1", date: "2026-04-15", name: "Limpeza de pele profunda", professional: "Dra. Helena", notes: "Pele bem hidratada, sem reações." },
      { id: "p2", date: "2026-03-20", name: "Radiofrequência facial", professional: "Dra. Helena", notes: "Sessão 4 de 6. Bom resultado de firmeza." },
      { id: "p3", date: "2026-02-18", name: "Peeling enzimático", professional: "Dra. Helena", notes: "Renovação celular leve." },
    ],
  },
  {
    id: "2",
    name: "Beatriz Carvalho",
    email: "bia.carvalho@email.com",
    phone: "(11) 97654-3210",
    birthDate: "1995-08-23",
    initials: "BC",
    lastVisit: "2026-04-18",
    totalSessions: 6,
    skinType: "Oleosa, acneica",
    allergies: [],
    medications: ["Isotretinoína"],
    observations: "Tratamento de acne ativa. Evitar procedimentos abrasivos.",
    procedures: [
      { id: "p4", date: "2026-04-18", name: "Microagulhamento leve", professional: "Dra. Helena", notes: "Reduzindo cicatrizes." },
      { id: "p5", date: "2026-03-22", name: "Limpeza de pele", professional: "Dra. Helena", notes: "Comedões removidos." },
    ],
  },
  {
    id: "3",
    name: "Camila Reis",
    email: "camila.reis@email.com",
    phone: "(11) 96543-2109",
    birthDate: "1982-11-05",
    initials: "CR",
    lastVisit: "2026-04-10",
    totalSessions: 24,
    skinType: "Seca, madura",
    allergies: ["Lidocaína"],
    medications: [],
    observations: "Cliente fidelizada, protocolo anti-idade contínuo.",
    procedures: [
      { id: "p6", date: "2026-04-10", name: "Drenagem linfática facial", professional: "Dra. Helena", notes: "Excelente resposta." },
    ],
  },
  {
    id: "4",
    name: "Daniela Fonseca",
    email: "dani.f@email.com",
    phone: "(11) 95432-1098",
    birthDate: "1991-02-14",
    initials: "DF",
    lastVisit: "2026-04-05",
    totalSessions: 3,
    skinType: "Normal",
    allergies: [],
    medications: [],
    observations: "Iniciando protocolo corporal de drenagem.",
    procedures: [
      { id: "p7", date: "2026-04-05", name: "Drenagem linfática corporal", professional: "Dra. Helena", notes: "Primeira sessão, paciente confortável." },
    ],
  },
  {
    id: "5",
    name: "Elisa Monteiro",
    email: "elisa.m@email.com",
    phone: "(11) 94321-0987",
    birthDate: "1978-07-30",
    initials: "EM",
    lastVisit: "2026-03-28",
    totalSessions: 18,
    skinType: "Mista",
    allergies: [],
    medications: ["Anti-hipertensivo"],
    observations: "Atenção à pressão antes de procedimentos.",
    procedures: [
      { id: "p8", date: "2026-03-28", name: "Massagem modeladora", professional: "Dra. Helena", notes: "Sessão 6 do pacote." },
    ],
  },
];

const today = new Date();
const iso = (d: Date) => d.toISOString();
const at = (h: number, m = 0, addDays = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() + addDays);
  d.setHours(h, m, 0, 0);
  return iso(d);
};

export const appointments: Appointment[] = [
  { id: "a1", patientName: "Marina Albuquerque", patientInitials: "MA", procedure: "Radiofrequência facial", date: at(9, 0), duration: 60, status: "confirmado" },
  { id: "a2", patientName: "Beatriz Carvalho", patientInitials: "BC", procedure: "Microagulhamento", date: at(10, 30), duration: 90, status: "confirmado" },
  { id: "a3", patientName: "Camila Reis", patientInitials: "CR", procedure: "Drenagem facial", date: at(13, 0), duration: 45, status: "pendente" },
  { id: "a4", patientName: "Daniela Fonseca", patientInitials: "DF", procedure: "Drenagem corporal", date: at(15, 0), duration: 60, status: "confirmado" },
  { id: "a5", patientName: "Elisa Monteiro", patientInitials: "EM", procedure: "Limpeza de pele", date: at(17, 0), duration: 60, status: "confirmado" },

  { id: "a6", patientName: "Marina Albuquerque", patientInitials: "MA", procedure: "Peeling químico", date: at(10, 0, 1), duration: 60, status: "confirmado" },
  { id: "a7", patientName: "Beatriz Carvalho", patientInitials: "BC", procedure: "Limpeza profunda", date: at(14, 30, 1), duration: 75, status: "pendente" },

  { id: "a8", patientName: "Camila Reis", patientInitials: "CR", procedure: "Massagem relaxante", date: at(11, 0, 2), duration: 60, status: "confirmado" },
  { id: "a9", patientName: "Daniela Fonseca", patientInitials: "DF", procedure: "Avaliação inicial", date: at(16, 0, 3), duration: 30, status: "confirmado" },
];

export const stats = {
  pacientesAtivos: 87,
  agendamentosHoje: 5,
  proceduresMes: 64,
  receitaMes: 24850,
};
