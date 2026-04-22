import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleGuard } from "@/components/auth/RoleGuard";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import CadastroCliente from "./pages/auth/CadastroCliente";
import CadastroVendedor from "./pages/auth/CadastroVendedor";
import ResetPassword from "./pages/auth/ResetPassword";
import ProdutoDetalhe from "./pages/produto/ProdutoDetalhe";
import CheckoutRetorno from "./pages/cliente/CheckoutRetorno";

import ClienteLayout from "./pages/cliente/ClienteLayout";
import ClienteDashboard from "./pages/cliente/ClienteDashboard";
import Carrinho from "./pages/cliente/Carrinho";
import Favoritos from "./pages/cliente/Favoritos";
import PedidosCliente from "./pages/cliente/PedidosCliente";

import VendedorLayout from "./pages/vendedor/VendedorLayout";
import VendedorDashboard from "./pages/vendedor/VendedorDashboard";
import ProdutosLista from "./pages/vendedor/ProdutosLista";
import ProdutoForm from "./pages/vendedor/ProdutoForm";
import PedidosVendedor from "./pages/vendedor/PedidosVendedor";
import ClientesVendedor from "./pages/vendedor/ClientesVendedor";
import FinanceiroVendedor from "./pages/vendedor/FinanceiroVendedor";
import SaquesView from "./pages/vendedor/SaquesView";

import AdminLayoutShell from "./pages/admin/AdminLayoutShell";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminVendedores from "./pages/admin/AdminVendedores";
import AdminProdutos from "./pages/admin/AdminProdutos";
import AdminPedidos from "./pages/admin/AdminPedidos";
import AdminSaques from "./pages/admin/AdminSaques";
import AdminConfig from "./pages/admin/AdminConfig";

import { MensagensLista, MensagensThread } from "./pages/shared/Mensagens";
import Avaliacoes from "./pages/shared/Avaliacoes";
import MinhaConta from "./pages/shared/MinhaConta";
import Avisos from "./pages/App/Avisos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="bottom-right" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/produto/:id" element={<ProdutoDetalhe />} />
            <Route path="/checkout/retorno" element={<CheckoutRetorno />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/cadastro/cliente" element={<CadastroCliente />} />
            <Route path="/auth/cadastro/vendedor" element={<CadastroVendedor />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/app/cliente" element={<RoleGuard allow={['cliente', 'vendedor']}><ClienteLayout /></RoleGuard>}>
              <Route index element={<ClienteDashboard />} />
              <Route path="pedidos" element={<PedidosCliente />} />
              <Route path="favoritos" element={<Favoritos />} />
              <Route path="carrinho" element={<Carrinho />} />
              <Route path="mensagens" element={<MensagensLista basePath="/app/cliente/mensagens" />} />
              <Route path="mensagens/:id" element={<MensagensThread basePath="/app/cliente/mensagens" />} />
              <Route path="avaliacoes" element={<Avaliacoes mode="cliente" />} />
              <Route path="avisos" element={<Avisos />} />
              <Route path="conta" element={<MinhaConta mode="cliente" />} />
            </Route>

            <Route path="/app/vendedor" element={<RoleGuard allow={['vendedor']}><VendedorLayout /></RoleGuard>}>
              <Route index element={<VendedorDashboard />} />
              <Route path="produtos" element={<ProdutosLista />} />
              <Route path="produtos/novo" element={<ProdutoForm />} />
              <Route path="produtos/:id/editar" element={<ProdutoForm />} />
              <Route path="pedidos" element={<PedidosVendedor />} />
              <Route path="clientes" element={<ClientesVendedor />} />
              <Route path="mensagens" element={<MensagensLista basePath="/app/vendedor/mensagens" />} />
              <Route path="mensagens/:id" element={<MensagensThread basePath="/app/vendedor/mensagens" />} />
              <Route path="financeiro" element={<FinanceiroVendedor />} />
              <Route path="saques" element={<SaquesView />} />
              <Route path="avaliacoes" element={<Avaliacoes mode="vendedor" />} />
              <Route path="avisos" element={<Avisos />} />
              <Route path="conta" element={<MinhaConta mode="vendedor" />} />
            </Route>

            <Route path="/admin" element={<RoleGuard allow={['admin']}><AdminLayoutShell /></RoleGuard>}>
              <Route index element={<AdminDashboard />} />
              <Route path="usuarios" element={<AdminUsuarios />} />
              <Route path="vendedores" element={<AdminVendedores />} />
              <Route path="produtos" element={<AdminProdutos />} />
              <Route path="pedidos" element={<AdminPedidos />} />
              <Route path="saques" element={<AdminSaques />} />
              <Route path="config" element={<AdminConfig />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
