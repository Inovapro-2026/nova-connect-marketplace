import { Outlet } from 'react-router-dom';
import { DashboardShell, NavItem } from '@/components/dashboard/DashboardShell';
import { LayoutGrid, Package, Heart, ShoppingBag, MessageCircle, Star, User, Store, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ClienteLayout() {
  const { role } = useAuth();
  
  const items: NavItem[] = [
    { to: '/app/cliente', label: 'Visão Geral', icon: LayoutGrid },
    { to: '/app/cliente/pedidos', label: 'Meus Pedidos', icon: Package },
    { to: '/app/cliente/favoritos', label: 'Favoritos', icon: Heart },
    { to: '/app/cliente/carrinho', label: 'Carrinho', icon: ShoppingBag },
    { to: '/app/cliente/mensagens', label: 'Mensagens', icon: MessageCircle },
    { to: '/app/cliente/avaliacoes', label: 'Avaliações', icon: Star },
    { to: '/app/cliente/avisos', label: 'Avisos', icon: Bell },
    { to: '/app/cliente/conta', label: 'Minha Conta', icon: User },
  ];

  if (role === 'vendedor') {
    items.push({ to: '/app/vendedor', label: 'Painel Vendedor', icon: Store });
  }
  return (
    <DashboardShell items={items} title="Painel do Cliente">
      <Outlet />
    </DashboardShell>
  );
}
