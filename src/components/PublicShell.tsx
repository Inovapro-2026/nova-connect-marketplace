import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { homeFor } from '@/components/auth/RoleGuard';

export function PublicHeader() {
  const { user, role } = useAuth();
  const dashHref = role ? homeFor(role) : '/auth/login';
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#produtos" className="hover:text-foreground transition-colors">Produtos</a>
          <a href="#vendedores" className="hover:text-foreground transition-colors">Vendedores</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild variant="outline"><Link to={dashHref}>Meu painel</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/auth/login">Entrar</Link></Button>
              <Button asChild size="sm" className="gradient-primary border-0">
                <Link to="/auth/cadastro/cliente">Criar conta</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border/50 mt-20 surface-1">
      <div className="container py-10 grid gap-8 md:grid-cols-4">
        <div>
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground mt-3">O marketplace dos criadores e vendedores digitais.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Plataforma</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/auth/cadastro/vendedor" className="hover:text-foreground">Seja um vendedor</Link></li>
            <li><Link to="/auth/login" className="hover:text-foreground">Entrar</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Legal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Termos de uso</a></li>
            <li><a href="#" className="hover:text-foreground">Privacidade</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm">Suporte</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="mailto:contato@inovapro.shop" className="hover:text-foreground">contato@inovapro.shop</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} InovaPro Shop. Todos os direitos reservados.
      </div>
    </footer>
  );
}
