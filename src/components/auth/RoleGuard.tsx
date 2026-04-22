import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, AccountType } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface Props {
  allow: AccountType[];
  children: React.ReactNode;
}

const homeFor = (role: AccountType | null) => {
  if (role === 'admin') return '/admin';
  if (role === 'vendedor') return '/app/vendedor';
  if (role === 'cliente') return '/app/cliente';
  return '/auth/login';
};

export function RoleGuard({ allow, children }: Props) {
  const { loading, user, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  }

  if (role && !allow.includes(role)) {
    return <Navigate to={homeFor(role)} replace />;
  }

  return <>{children}</>;
}

export { homeFor };
