import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { patients } from "@/data/mockData";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Calendar, Sparkles, Plus, AlertCircle, Pill } from "lucide-react";
import { format, differenceInYears } from "date-fns";
import { ptBR } from "date-fns/locale";

const ProntuarioDetalhe = () => {
  const { id } = useParams();
  const patient = patients.find((p) => p.id === id);

  if (!patient) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-2xl py-16 text-center">
          <h1 className="font-display text-3xl">Prontuário não encontrado</h1>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/prontuarios">Voltar</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const age = differenceInYears(new Date(), new Date(patient.birthDate));

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        <Button asChild variant="ghost" className="rounded-full text-muted-foreground hover:text-foreground -ml-3">
          <Link to="/prontuarios">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para pacientes
          </Link>
        </Button>

        {/* Header card */}
        <Card className="overflow-hidden border-border/60 bg-card/80 shadow-soft">
          <div className="bg-gradient-hero p-8 md:p-10">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
              <Avatar className="h-24 w-24 border-4 border-background shadow-elegant">
                <AvatarFallback className="bg-gradient-spa text-2xl font-medium text-primary-foreground">
                  {patient.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Paciente</p>
                <h1 className="mt-2 font-display text-4xl font-medium md:text-5xl">{patient.name}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {age} anos</span>
                  <span className="flex items-center gap-1.5"><Phone className="h-4 w-4" /> {patient.phone}</span>
                  <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {patient.email}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full border-border/80 bg-background/60 backdrop-blur">
                  Editar
                </Button>
                <Button className="rounded-full bg-primary text-primary-foreground shadow-elegant hover:bg-primary/90">
                  <Plus className="mr-1 h-4 w-4" /> Nova sessão
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="anamnese" className="space-y-6">
          <TabsList className="h-12 rounded-full bg-muted/60 p-1">
            <TabsTrigger value="anamnese" className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-soft">
              Anamnese
            </TabsTrigger>
            <TabsTrigger value="historico" className="rounded-full px-6 data-[state=active]:bg-background data-[state=active]:shadow-soft">
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="anamnese" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border/60 bg-card/80 shadow-soft">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/60">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-medium">Tipo de pele</h3>
                  </div>
                  <p className="text-foreground">{patient.skinType}</p>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/80 shadow-soft">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    </div>
                    <h3 className="font-display text-xl font-medium">Alergias</h3>
                  </div>
                  {patient.allergies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma alergia registrada.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {patient.allergies.map((a) => (
                        <Badge key={a} variant="outline" className="rounded-full border-destructive/30 bg-destructive/10 text-destructive">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/80 shadow-soft">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/30">
                      <Pill className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-medium">Medicamentos</h3>
                  </div>
                  {patient.medications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum medicamento em uso.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {patient.medications.map((m) => (
                        <Badge key={m} variant="secondary" className="rounded-full">{m}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/80 shadow-soft">
                <CardContent className="space-y-4 p-6">
                  <h3 className="font-display text-xl font-medium">Total de sessões</h3>
                  <p className="font-display text-4xl font-semibold text-primary">{patient.totalSessions}</p>
                  <p className="text-sm text-muted-foreground">
                    Última visita: {format(new Date(patient.lastVisit), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/60 bg-card/80 shadow-soft">
              <CardContent className="space-y-3 p-6">
                <h3 className="font-display text-xl font-medium">Observações clínicas</h3>
                <p className="leading-relaxed text-muted-foreground">{patient.observations}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico">
            <Card className="border-border/60 bg-card/80 shadow-soft">
              <CardContent className="p-6 md:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-display text-2xl font-medium">Histórico de procedimentos</h3>
                  <Badge variant="secondary" className="rounded-full">{patient.procedures.length} registros</Badge>
                </div>

                <div className="relative space-y-6 border-l-2 border-secondary pl-6">
                  {patient.procedures.map((proc) => (
                    <div key={proc.id} className="relative">
                      <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-4 border-background bg-primary shadow-glow" />
                      <div className="rounded-2xl border border-border/60 bg-background/60 p-5 transition-smooth hover:shadow-soft">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                              {format(new Date(proc.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                            </p>
                            <h4 className="mt-1 font-display text-xl font-medium">{proc.name}</h4>
                          </div>
                          <Badge variant="outline" className="rounded-full border-border bg-muted/40">
                            {proc.professional}
                          </Badge>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{proc.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ProntuarioDetalhe;
