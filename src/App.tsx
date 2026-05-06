import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import ScrollToTop from "./components/ScrollToTop";
import CookieBanner from "./components/CookieBanner";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import Index from "./pages/Index";

const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const CategoriesPage = lazy(() => import("./pages/CategoriesPage"));
const TrendingPage = lazy(() => import("./pages/TrendingPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminAuthLayout = lazy(() => import("./components/admin/AdminAuthLayout"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminAppearance = lazy(() => import("./pages/admin/AdminAppearance"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

// Preload high-traffic store routes during browser idle time so navigation feels instant
const usePreloadRoutes = () => {
  useEffect(() => {
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback
      || ((cb: () => void) => setTimeout(cb, 800));
    idle(() => {
      void import("./pages/CategoryPage");
      void import("./pages/ProductPage");
      void import("./pages/CartPage");
      void import("./pages/CategoriesPage");
    });
  }, []);
};

const AppShell = () => {
  usePreloadRoutes();
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/produto/:slug" element={<ProductPage />} />
        <Route path="/carrinho" element={<CartPage />} />
        <Route path="/busca" element={<SearchPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/destaques" element={<TrendingPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pedido/:id" element={<OrderConfirmationPage />} />
        <Route path="/privacidade" element={<PrivacyPage />} />
        <Route path="/termos" element={<TermsPage />} />

        <Route element={<AdminAuthLayout />}>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="pedidos" element={<AdminOrders />} />
            <Route path="produtos" element={<AdminProducts />} />
            <Route path="categorias" element={<AdminCategories />} />
            <Route path="aparencia" element={<AdminAppearance />} />
            <Route path="config" element={<AdminSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AppShell />
          <CookieBanner />
          <PWAInstallPrompt />
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
