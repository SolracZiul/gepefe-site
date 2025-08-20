import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Sobre from "./pages/Sobre";
import ArtigosCompletos from "./pages/ArtigosCompletos";
import TextosAcademicos from "./pages/TextosAcademicos";
import Pesquisas from "./pages/Pesquisas";
import Dissertacoes from "./pages/Dissertacoes";
import Todos from "./pages/Todos";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import EmailConfirmation from "./pages/EmailConfirmation";
import ResetPassword from "./pages/ResetPassword";
import Favoritos from "./pages/Favoritos";
import ArticleDetail from "./pages/ArticleDetail";
import { ArticlesProvider } from "./contexts/ArticlesContext";
import { SearchProvider } from "./contexts/SearchContext";

console.log("App.tsx: All imports loaded successfully - Updated");
console.log("Components check:", { Index, NotFound, Sobre, ArtigosCompletos, TextosAcademicos, Pesquisas, Dissertacoes, Todos, Auth, Admin });

const queryClient = new QueryClient();

const App = () => {
  console.log("App component rendering...");
  return (
    <QueryClientProvider client={queryClient}>
      <ArticlesProvider>
        <SearchProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen w-full">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/todos" element={<Todos />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/artigos-completos" element={<ArtigosCompletos />} />
                <Route path="/textos-academicos" element={<TextosAcademicos />} />
                <Route path="/pesquisas" element={<Pesquisas />} />
                <Route path="/dissertacoes" element={<Dissertacoes />} />
                <Route path="/favoritos" element={<Favoritos />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/email-confirmation" element={<EmailConfirmation />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/article/:id" element={<ArticleDetail />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </SearchProvider>
    </ArticlesProvider>
    </QueryClientProvider>
  );
};

export default App;
