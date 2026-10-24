import React, { useEffect } from "react";
import { RepositoryShell } from "./components/repository/RepositoryShell";
import { RepositoryCollection } from "./components/repository/RepositoryCollection";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { registerNativeAuthListener, registerNativeLinkListener } from "./lib/native";
import { useToast } from "./hooks/use-toast";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LinhasDePesquisa from "./pages/LinhasDePesquisa";
import { institutionalRedirectTarget } from "./lib/repository-navigation";
import ArtigosCompletos from "./pages/ArtigosCompletos";
import TextosAcademicos from "./pages/TextosAcademicos";
import Pesquisas from "./pages/Pesquisas";
import Dissertacoes from "./pages/Dissertacoes";
import Teses from "./pages/Teses";
import Todos from "./pages/Todos";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import EmailConfirmation from "./pages/EmailConfirmation";
import ResetPassword from "./pages/ResetPassword";
import Favoritos from "./pages/Favoritos";
import ArticleDetail from "./pages/ArticleDetail";
import Noticias from "./pages/Noticias";
import NoticiaDetail from "./pages/NoticiaDetail";
import LayoutCheck from "./pages/__LayoutCheck";
import { ArticlesProvider } from "./contexts/ArticlesContext";
import { SearchProvider } from "./contexts/SearchContext";

console.log("App.tsx: All imports loaded successfully - Updated");
console.log("Components check:", { Index, NotFound, LinhasDePesquisa, ArtigosCompletos, TextosAcademicos, Pesquisas, Dissertacoes, Todos, Auth, Admin, Noticias, NoticiaDetail });

const queryClient = new QueryClient();

function NativeEvents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  useEffect(() => {
    const removeAuth = registerNativeAuthListener(
      () => navigate('/', { replace: true }),
      () => toast({ title: 'Não foi possível concluir o login com Google', description: 'Tente novamente.', variant: 'destructive' }),
    );
    const removeLinks = registerNativeLinkListener(() => toast({ title: 'Não foi possível abrir o documento', variant: 'destructive' }));
    return () => { removeAuth(); removeLinks(); };
  }, [navigate, toast]);
  return null;
}

// Former institutional addresses must never dead-end: they land on the unified page.
function LegacyInstitutionalRedirect() {
  const { hash } = useLocation();
  return <Navigate to={institutionalRedirectTarget(hash)} replace />;
}

const App = () => {
  console.log("App component rendering...");
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange={false}
      >
        <ArticlesProvider>
          <SearchProvider>
            <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <NativeEvents />
            <div className="min-h-screen w-full">
              <RepositoryShell><Routes>
                <Route path="/" element={<Index />} />
                <Route path="/repositorio" element={<Todos />} />
                <Route path="/busca" element={<Todos />} />
                <Route path="/historico" element={<RepositoryCollection title="Histórico de Leitura" mode="history" />} />
                <Route path="/artigo/:id" element={<ArticleDetail />} />
                <Route path="/todos" element={<Todos />} />
                <Route path="/linhas-de-pesquisa" element={<LinhasDePesquisa />} />
                <Route path="/sobre" element={<LegacyInstitutionalRedirect />} />
                <Route path="/integrantes" element={<LegacyInstitutionalRedirect />} />
                <Route path="/artigos-completos" element={<ArtigosCompletos />} />
                <Route path="/textos-academicos" element={<TextosAcademicos />} />
                <Route path="/pesquisas" element={<Pesquisas />} />
                <Route path="/dissertacoes" element={<Dissertacoes />} />
                <Route path="/teses" element={<Teses />} />
                <Route path="/favoritos" element={<Favoritos />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/email-confirmation" element={<EmailConfirmation />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/article/:id" element={<ArticleDetail />} />
                <Route path="/noticias" element={<Noticias />} />
                <Route path="/noticia/:id" element={<NoticiaDetail />} />
                <Route path="/layout-check" element={<LayoutCheck />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes></RepositoryShell>
            </div>
          </BrowserRouter>
          </TooltipProvider>
        </SearchProvider>
      </ArticlesProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
