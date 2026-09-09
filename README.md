# Aurora Estética — Agenda e Prontuários

MVP funcional de agenda online, anamnese e prontuário eletrônico para clínicas de
estética. Todos os dados são fictícios e ficam no navegador (`localStorage`) — não há
back-end nem envio de informação para fora da máquina.

## Rodar

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # gera dist/
npm test         # regras de negócio (conflito de horário, contraindicações)
```

## O que já funciona

| Tela | O que dá para demonstrar |
|---|---|
| **Visão geral** | Métricas calculadas dos agendamentos reais (pacientes ativos, receita realizada e prevista, ticket médio), agenda do dia e atendimentos por dia dos últimos/próximos 7 dias. |
| **Agenda** | Timeline com blocos proporcionais à duração, navegação por semana, clique em horário vazio para agendar, e por atendimento: confirmar, concluir, editar/reagendar, registrar falta, cancelar, excluir. |
| **Pacientes** | Busca, ordenação, alertas clínicos no card, cadastro e edição completos. |
| **Prontuário** | Anamnese estética completa, evolução por sessão, histórico de agendamentos, resumo financeiro da paciente e impressão da ficha. |
| **Financeiro** | Receita por mês, procedimentos que mais faturam, a receber, taxa de faltas e cancelamentos. |
| **Configurações** | Dados da clínica, horário e dias de atendimento, tabela de procedimentos (duração e valor) e restauração dos dados de demonstração. |

Também: busca global com `Ctrl/⌘ + K`, lembrete automático do próximo atendimento,
modo claro/escuro e layout responsivo.

## Diferenciais para a apresentação

- **Alerta de contraindicação** — a anamnese marca condições (gestante, marca-passo,
  queloide, herpes, uso de isotretinoína…) e o sistema bloqueia visualmente o
  agendamento de procedimentos incompatíveis, no momento em que a profissional escolhe
  o procedimento.
- **Detecção de conflito de horário** em tempo real no formulário de agendamento.
- **Tabela de procedimentos como fonte única** — mudar o valor em Configurações
  reflete na agenda e no financeiro.

## Estrutura

```
src/
  types.ts                 modelo de domínio (paciente, anamnese, agendamento…)
  data/seed.ts             dados fictícios de demonstração
  store/clinica.tsx        estado da aplicação + persistência em localStorage
  lib/clinica.ts           regras: conflito, contraindicação, alertas, formatação
  components/              diálogos, layout, busca global, componentes de UI
  pages/                   Visão geral, Agenda, Pacientes, Prontuário, Financeiro, Configurações
  test/clinica.test.ts     testes das regras de negócio
```

## Limitações conhecidas (próximos passos, se o projeto for adiante)

- Sem back-end: os dados vivem no navegador de quem abre. Multiusuário, acesso de
  outro dispositivo e backup exigem banco de dados e autenticação.
- Sem envio de lembrete por WhatsApp/e-mail — hoje o lembrete é apenas na tela.
- Sem anexo de fotos de antes/depois nem upload de exames.
- Sem controle de pagamentos (recebido x pendente); o financeiro projeta a partir do
  status do atendimento.
