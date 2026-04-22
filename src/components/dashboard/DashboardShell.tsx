import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { toast } from 'sonner';
import { NotificationBell } from '@/components/shared/NotificationBell';

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface Props { items: NavItem[]; title: string; children: ReactNode; }

export function DashboardShell({ items, title, children }: Props) {
  const { usuario, signOut } = useAuth();
  const nav = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    toast.success('Você saiu da conta');
    nav('/auth/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-border/50 bg-sidebar/50 backdrop-blur-xl sticky top-0 h-screen">
        <div className="p-6 border-b border-border/50">
          <Logo size="sm" />
        </div>
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-surface-2/50 border border-border/30">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center text-sm font-black text-white shadow-lg">
              {usuario?.nome?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold truncate">{usuario?.nome ?? 'Usuário'}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-black opacity-70">{title}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-none">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split('/').length <= 3}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  isActive
                    ? 'gradient-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-2/80'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="ml-auto text-[10px] bg-primary/20 text-primary rounded-full px-2 py-0.5 font-black">{item.badge}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border/50">
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl h-12 font-bold">
            <LogOut className="h-5 w-5 mr-3" /> Sair da Conta
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-sidebar border-r border-border/50 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
             <div className="p-6 border-b border-border/50 flex items-center justify-between">
                <Logo size="sm" />
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}><X className="h-6 w-6" /></Button>
             </div>
             <nav className="flex-1 p-4 space-y-2">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                        isActive ? 'gradient-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
             </nav>
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header Bar */}
        <header className="h-16 border-b border-border/50 bg-background/50 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
           <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
                 <Menu className="h-6 w-6" />
              </Button>
              <h2 className="font-display font-black text-xl tracking-tight hidden sm:block">{title}</h2>
           </div>
           
           <div className="flex items-center gap-2">
              <NotificationBell />
              <div className="h-8 w-[1px] bg-border/50 mx-2 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full border border-border/30 bg-surface-2/50">
                 <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center text-[10px] font-black text-white">
                    {usuario?.nome?.[0]?.toUpperCase()}
                 </div>
                 <span className="text-xs font-bold">{usuario?.nome}</span>
              </div>
           </div>
        </header>

        <div className="flex-1 container py-6 lg:py-10 max-w-6xl animate-fade-in">
           {children}
        </div>
      </main>
    </div>
  );
}
