import React, { useEffect, useRef } from "react";
import { RepositoryShell } from "./components/repository/RepositoryShell";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { registerNativeAppLinkListener, registerNativeAuthListener, registerNativeLinkListener } from "./lib/native";
import { useToast } from "./hooks/use-toast";
import { ThemeProvider } from "next-themes";
import { SplashScreen } from '@capacitor/splash-screen';
import { connectionRestoredMessage, watchNativeConnection } from './lib/native-offline';
import Baixados from './pages/Baixados';

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
import Biblioteca from "./pages/Biblioteca";
import { bibliotecaHref } from "./lib/repository-navigation";
import ArticleDetail from "./pages/ArticleDetail";
import Noticias from "./pages/Noticias";
import NoticiaDetail from "./pages/NoticiaDetail";
import Privacidade from "./pages/Privacidade";
import { ArticlesProvider } from "./contexts/ArticlesContext";
import { SearchProvider } from "./contexts/SearchContext";
import { AuthProvider } from './hooks/useAuth';

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Esconde a ecrã de abertura suavemente quando o React estiver pronto
    SplashScreen.hide();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey="theme"
        disableTransitionOnChange={false}
      >
        <AuthProvider><ArticlesProvider>
          <SearchProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <NativeEvents />
                <div className="min-h-screen w-full">
                  <RepositoryShell>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/repositorio" element={<Todos />} />
                      <Route path="/busca" element={<Todos />} />
                      <Route path="/historico" element={<Navigate to={bibliotecaHref('historico')} replace />} />
                      <Route path="/biblioteca" element={<Biblioteca />} />
                      <Route path="/artigo/:id" element={<LegacyArticleRedirect />} />
                      <Route path="/todos" element={<Todos />} />
                      <Route path="/linhas-de-pesquisa" element={<LinhasDePesquisa />} />
                      <Route path="/sobre" element={<LegacyInstitutionalRedirect />} />
                      <Route path="/integrantes" element={<LegacyInstitutionalRedirect />} />
                      <Route path="/artigos-completos" element={<ArtigosCompletos />} />
                      <Route path="/textos-academicos" element={<TextosAcademicos />} />
                      <Route path="/pesquisas" element={<Pesquisas />} />
                      <Route path="/dissertacoes" element={<Dissertacoes />} />
                      <Route path="/teses" element={<Teses />} />
                      <Route path="/favoritos" element={<Navigate to={bibliotecaHref('salvos')} replace />} />
                      <Route path="/baixados" element={<Baixados />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/email-confirmation" element={<EmailConfirmation />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/perfil" element={<Navigate to="/profile" replace />} />
                    <Route path="/admin" element={<Admin />} />
                      <Route path="/publicacao/:id" element={<ArticleDetail />} />
                      <Route path="/article/:id" element={<LegacyArticleRedirect />} />
                      <Route path="/noticias" element={<Noticias />} />
                      <Route path="/noticia/:id" element={<NoticiaDetail />} />
                      <Route path="/privacidade" element={<Privacidade />} />
                      <Route path="/politica-de-privacidade" element={<Navigate to="/privacidade" replace />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </RepositoryShell>
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </SearchProvider>
        </ArticlesProvider></AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

function NativeEvents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  // useNavigate changes identity on every route change; keep listeners mounted once.
  const navigateRef = useRef(navigate);
  const toastRef = useRef(toast);
  navigateRef.current = navigate;
  toastRef.current = toast;
  useEffect(() => {
    const navigate = (path: string, options?: { replace?: boolean }) => navigateRef.current(path, options);
    const toast: typeof toastRef.current = (...args: Parameters<typeof toastRef.current>) => toastRef.current(...args);
    const removeAuth = registerNativeAuthListener(
      () => navigate('/', { replace: true }),
      () => toast({ title: 'Não foi possível concluir o login com Google', description: 'Tente novamente.', variant: 'destructive' }),
    );
    const removeAppLinks = registerNativeAppLinkListener(path => navigate(path, { replace: true }));
    const removeLinks = registerNativeLinkListener(() => toast({ title: 'Não foi possível abrir o documento', variant: 'destructive' }));
    const removeNetwork = watchNativeConnection(() => navigate('/biblioteca', { replace: true }), () => toast({ title: connectionRestoredMessage }));
    return () => { removeAuth(); removeAppLinks(); removeLinks(); removeNetwork(); };
  }, []);
  return null;
}

// Former institutional addresses must never dead-end: they land on the unified page.
function LegacyInstitutionalRedirect() {
  const { hash } = useLocation();
  return <Navigate to={institutionalRedirectTarget(hash)} replace />;
}

// Former document addresses must never dead-end: they land on the canonical publication page.
function LegacyArticleRedirect() {
  const { id } = useParams();
  return <Navigate to={`/publicacao/${id}`} replace />;
}

export default App;
