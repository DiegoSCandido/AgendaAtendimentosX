import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-soft px-6">
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-spa shadow-glow">
        <Sparkles className="h-6 w-6 text-primary-foreground" aria-hidden />
      </div>
      <p className="rotulo mt-6">Erro 404</p>
      <h1 className="mt-2 font-display text-4xl font-medium">Página não encontrada</h1>
      <p className="mt-3 text-muted-foreground">
        O endereço acessado não existe neste sistema.
      </p>
      <Button asChild className="mt-8 rounded-full">
        <Link to="/">Voltar para a visão geral</Link>
      </Button>
    </div>
  </div>
);

export default NotFound;
