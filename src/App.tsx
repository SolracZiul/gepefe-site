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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/todos" element={<Todos />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/artigos-completos" element={<ArtigosCompletos />} />
          <Route path="/textos-academicos" element={<TextosAcademicos />} />
          <Route path="/pesquisas" element={<Pesquisas />} />
          <Route path="/dissertacoes" element={<Dissertacoes />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
