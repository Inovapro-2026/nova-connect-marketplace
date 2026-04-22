import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DashboardShell, NavItem } from '@/components/dashboard/DashboardShell';
import { LayoutGrid, Users, Store, Package, ListOrdered, Settings, Landmark } from 'lucide-react';

const items: NavItem[] = [
  { to: '/admin', label: 'Visão Geral', icon: LayoutGrid },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
  { to: '/admin/vendedores', label: 'Vendedores', icon: Store },
  { to: '/admin/produtos', label: 'Produtos', icon: Package },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ListOrdered },
  { to: '/admin/saques', label: 'Saques', icon: Landmark },
  { to: '/admin/config', label: 'Configurações', icon: Settings },
];

export default function AdminLayoutShell() {
  return (
    <DashboardShell items={items} title="Administração">
      <Outlet />
    </DashboardShell>
  );
}
