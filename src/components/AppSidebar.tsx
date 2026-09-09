import { LayoutDashboard, Users, CalendarDays, Settings, Sparkles, Wallet } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useClinica } from "@/store/clinica";
import { iniciais } from "@/lib/clinica";

const principais = [
  { titulo: "Visão geral", url: "/", icon: LayoutDashboard },
  { titulo: "Agenda", url: "/agenda", icon: CalendarDays },
  { titulo: "Pacientes", url: "/pacientes", icon: Users },
  { titulo: "Financeiro", url: "/financeiro", icon: Wallet },
];

const sistema = [{ titulo: "Configurações", url: "/configuracoes", icon: Settings }];

export function AppSidebar() {
  const { state } = useSidebar();
  const { configuracoes } = useClinica();
  const recolhido = state === "collapsed";

  const grupo = (
    itens: typeof principais,
    rotulo: string,
    exato = false,
  ) => (
    <SidebarGroup>
      {!recolhido && (
        <SidebarGroupLabel className="px-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
          {rotulo}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {itens.map((item) => (
            <SidebarMenuItem key={item.titulo}>
              <SidebarMenuButton asChild className="h-11 rounded-xl" tooltip={item.titulo}>
                <NavLink
                  to={item.url}
                  end={exato || item.url === "/"}
                  className="flex items-center gap-3 px-3 text-sidebar-foreground/80 transition-smooth hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-soft"
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                  {!recolhido && <span className="text-sm">{item.titulo}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border/60 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-spa shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" aria-hidden />
          </div>
          {!recolhido && (
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-display text-lg font-semibold text-sidebar-foreground">
                {configuracoes.nomeClinica}
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Estética &amp; Bem-estar
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {grupo(principais, "Principal")}
        <div className="mt-4">{grupo(sistema, "Sistema", true)}</div>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar className="h-9 w-9 shrink-0 border border-sidebar-border">
            <AvatarFallback className="bg-gradient-spa text-xs text-primary-foreground">
              {iniciais(configuracoes.profissional)}
            </AvatarFallback>
          </Avatar>
          {!recolhido && (
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-medium text-sidebar-foreground">
                {configuracoes.profissional}
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {configuracoes.registro}
              </span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
