import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appointments } from "@/data/mockData";
import { format, isSameDay, addDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";

const Agenda = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));

  const weekStart = startOfDay(new Date());
  const weekDays = Array.from({ length: 14 }, (_, i) => addDays(weekStart, i));

  const dayAppointments = appointments
    .filter((a) => isSameDay(new Date(a.date), selectedDate))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8h - 18h

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Agenda</p>
            <h1 className="mt-2 font-display text-4xl font-medium md:text-5xl">
              <span className="italic text-primary">Seus</span> atendimentos
            </h1>
          </div>
          <Button className="rounded-full bg-primary text-primary-foreground shadow-elegant hover:bg-primary/90">
            <Plus className="mr-1 h-4 w-4" /> Novo agendamento
          </Button>
        </header>

        {/* Day strip */}
        <Card className="border-border/60 bg-card/80 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
                {weekDays.map((d) => {
                  const active = isSameDay(d, selectedDate);
                  const count = appointments.filter((a) => isSameDay(new Date(a.date), d)).length;
                  return (
                    <button
                      key={d.toISOString()}
                      onClick={() => setSelectedDate(d)}
                      className={`flex min-w-[68px] flex-col items-center gap-1 rounded-2xl px-3 py-3 transition-smooth ${
                        active
                          ? "bg-primary text-primary-foreground shadow-elegant"
                          : "bg-muted/40 text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className={`text-[10px] uppercase tracking-widest ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        {format(d, "EEE", { locale: ptBR })}
                      </span>
                      <span className="font-display text-2xl font-semibold leading-none">
                        {format(d, "d")}
                      </span>
                      <span className={`mt-1 text-[10px] ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        {count > 0 ? `${count} ag.` : "—"}
                      </span>
                    </button>
                  );
                })}
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="border-border/60 bg-card/80 shadow-soft">
          <CardContent className="p-6 md:p-8">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-medium capitalize">
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </h2>
              <p className="text-sm text-muted-foreground">{dayAppointments.length} atendimentos</p>
            </div>

            <div className="relative">
              {hours.map((h) => {
                const slot = dayAppointments.find((a) => new Date(a.date).getHours() === h);
                return (
                  <div key={h} className="grid grid-cols-[60px_1fr] gap-4 border-t border-border/50 py-3 first:border-t-0">
                    <div className="pt-1 text-xs font-medium text-muted-foreground">
                      {String(h).padStart(2, "0")}:00
                    </div>
                    <div>
                      {slot ? (
                        <div className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-gradient-to-r from-secondary/50 to-transparent p-4 transition-smooth hover:shadow-soft">
                          <Avatar className="h-12 w-12 border-2 border-background shadow-soft">
                            <AvatarFallback className="bg-gradient-spa text-sm font-medium text-primary-foreground">
                              {slot.patientInitials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">{slot.patientName}</p>
                            <p className="text-sm text-muted-foreground">{slot.procedure}</p>
                          </div>
                          <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              {format(new Date(slot.date), "HH:mm")} • {slot.duration}min
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`rounded-full text-[11px] capitalize ${
                              slot.status === "confirmado"
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-accent/40 bg-accent/20 text-accent-foreground"
                            }`}
                          >
                            {slot.status}
                          </Badge>
                        </div>
                      ) : (
                        <div className="h-12 rounded-2xl border border-dashed border-border/50 transition-smooth hover:border-primary/40 hover:bg-muted/30" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Agenda;
