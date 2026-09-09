import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useClinica } from "@/store/clinica";

/**
 * Avisa quando há atendimento dentro da janela configurada em Configurações.
 * Reavalia a cada minuto e nunca notifica o mesmo agendamento duas vezes.
 */
export function useLembreteConsulta() {
  const { agendamentos, configuracoes, paciente, procedimento } = useClinica();
  const notificados = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checar = () => {
      const agora = new Date();
      const limite = new Date(agora.getTime() + configuracoes.lembreteMinutos * 60000);

      const proximo = agendamentos
        .filter((a) => a.status === "agendado" || a.status === "confirmado")
        .map((a) => ({ ...a, quando: new Date(a.inicio) }))
        .filter((a) => a.quando > agora && a.quando <= limite)
        .sort((a, b) => +a.quando - +b.quando)[0];

      if (!proximo || notificados.current.has(proximo.id)) return;
      notificados.current.add(proximo.id);

      const minutos = Math.max(1, Math.round((+proximo.quando - +agora) / 60000));
      toast(`Próximo atendimento em ${minutos} min`, {
        description: `${paciente(proximo.pacienteId)?.nome} • ${
          procedimento(proximo.procedimentoId)?.nome
        } às ${proximo.quando.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
        duration: 10000,
      });
    };

    checar();
    const id = window.setInterval(checar, 60000);
    return () => window.clearInterval(id);
  }, [agendamentos, configuracoes.lembreteMinutos, paciente, procedimento]);
}
