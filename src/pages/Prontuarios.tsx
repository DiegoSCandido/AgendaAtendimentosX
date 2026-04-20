import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { patients } from "@/data/mockData";
import { Search, Plus, Phone, Mail, ArrowUpRight, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { useState } from "react";

const Prontuarios = () => {
  const [query, setQuery] = useState("");
  const filtered = patients.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Prontuários</p>
            <h1 className="mt-2 font-display text-4xl font-medium md:text-5xl">
              Seus <span className="italic text-primary">pacientes</span>
            </h1>
            <p className="mt-2 text-muted-foreground">{patients.length} prontuários ativos</p>
          </div>
          <Button className="rounded-full bg-primary text-primary-foreground shadow-elegant hover:bg-primary/90">
            <Plus className="mr-1 h-4 w-4" /> Novo prontuário
          </Button>
        </header>

        <div className="relative max-w-lg">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome..."
            className="h-12 rounded-full border-border/60 bg-card/80 pl-11"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="group border-border/60 bg-card/80 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 border-2 border-background shadow-soft">
                    <AvatarFallback className="bg-gradient-spa text-base font-medium text-primary-foreground">
                      {p.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate font-display text-xl font-semibold">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">{p.skinType}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-2 border-t border-border/50 pt-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{p.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{p.email}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Última visita</p>
                    <p className="mt-0.5 font-medium text-foreground">
                      {format(new Date(p.lastVisit), "dd MMM yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/10 text-primary">
                    {p.totalSessions} sessões
                  </Badge>
                </div>

                <Button
                  asChild
                  variant="ghost"
                  className="mt-5 w-full justify-between rounded-xl bg-secondary/40 text-foreground hover:bg-secondary/70"
                >
                  <Link to={`/prontuarios/${p.id}`}>
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Abrir prontuário
                    </span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Prontuarios;
