import { Outlet } from 'react-router-dom';
import { DashboardShell, NavItem } from '@/components/dashboard/DashboardShell';
import { LayoutGrid, Users, Store, Package, ListOrdered, DollarSign, MessageCircle, Star, Settings } from 'lucide-react';

const items: NavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutGrid },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
  { to: '/admin/vendedores', label: 'Vendedores', icon: Store },
  { to: '/admin/produtos', label: 'Produtos', icon: Package },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ListOrdered },
  { to: '/admin/financeiro', label: 'Financeiro', icon: DollarSign },
  { to: '/admin/mensagens', label: 'Mensagens', icon: MessageCircle },
  { to: '/admin/avaliacoes', label: 'Avaliações', icon: Star },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
];

export default function AdminLayout() {
  return (
    <DashboardShell items={items} title="Painel Admin">
      <Outlet />
    </DashboardShell>
  );
}
