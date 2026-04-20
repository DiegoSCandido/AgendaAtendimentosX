import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { appointments } from "@/data/mockData";

/**
 * Verifica se há uma consulta nos próximos 30 minutos e dispara um toast.
 * Reavalia a cada minuto e evita notificar a mesma consulta mais de uma vez.
 */
export function useUpcomingAppointmentToast() {
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const limit = new Date(now.getTime() + 30 * 60 * 1000);

      const upcoming = appointments
        .map((a) => ({ ...a, dateObj: new Date(a.date) }))
        .filter((a) => a.dateObj > now && a.dateObj <= limit)
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())[0];

      if (!upcoming || notifiedRef.current.has(upcoming.id)) return;

      notifiedRef.current.add(upcoming.id);

      const minutes = Math.max(
        1,
        Math.round((upcoming.dateObj.getTime() - now.getTime()) / 60000),
      );
      const horario = upcoming.dateObj.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      toast(`Próxima consulta em ${minutes} min`, {
        description: `${upcoming.patientName} • ${upcoming.procedure} às ${horario}`,
        duration: 10000,
      });
    };

    check();
    const id = window.setInterval(check, 60 * 1000);
    return () => window.clearInterval(id);
  }, []);
}
