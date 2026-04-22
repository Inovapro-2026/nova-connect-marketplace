import { Outlet } from 'react-router-dom';
import { DashboardShell, NavItem } from '@/components/dashboard/DashboardShell';
import { 
  LayoutGrid, Package, ListOrdered, Users, 
  MessageCircle, DollarSign, Star, Settings, 
  ShoppingBag, Landmark, Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function VendedorLayout() {
  const { role } = useAuth();
  
  const items: NavItem[] = [
    { to: '/app/vendedor', label: 'Dashboard', icon: LayoutGrid },
    { to: '/app/vendedor/produtos', label: 'Meus Produtos', icon: Package },
    { to: '/app/vendedor/pedidos', label: 'Pedidos', icon: ListOrdered },
    { to: '/app/vendedor/clientes', label: 'Clientes', icon: Users },
    { to: '/app/vendedor/mensagens', label: 'Mensagens', icon: MessageCircle },
    { to: '/app/vendedor/financeiro', label: 'Financeiro', icon: DollarSign },
    { to: '/app/vendedor/saques', label: 'Saques', icon: Landmark },
    { to: '/app/vendedor/avaliacoes', label: 'Avaliações', icon: Star },
    { to: '/app/vendedor/avisos', label: 'Avisos', icon: Bell },
    { to: '/app/vendedor/conta', label: 'Minha Conta', icon: Settings },
  ];

  if (role === 'vendedor') {
    items.push({ to: '/app/cliente', label: 'Painel Cliente', icon: ShoppingBag });
  }

  return (
    <DashboardShell items={items} title="Painel do Vendedor">
      <Outlet />
    </DashboardShell>
  );
}
