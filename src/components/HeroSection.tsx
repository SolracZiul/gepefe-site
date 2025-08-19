import { Button } from "@/components/ui/button";
import { BookOpen, Users, Download } from "lucide-react";
export const HeroSection = () => {
  return <section className="relative py-20 px-4 bg-gradient-hero overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center text-primary-foreground">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Grupo de Estudos e Pesquisas em 
            <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Educação Física e Escola
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-3xl mx-auto">
            Repositório de acesso aberto com artigos, textos acadêmicos e pesquisas 
            produzidos pelo GEPEFE para a comunidade acadêmica.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" variant="secondary" className="bg-white/90 text-primary hover:bg-white shadow-elegant">
              <BookOpen className="mr-2 h-5 w-5" />
              Explorar Publicações
            </Button>
            <Button size="lg" variant="secondary" className="border-white/40 bg-white/90 text-slate-950">
              <Users className="mr-2 h-5 w-5" />
              Sobre o GEPEFE
            </Button>
          </div>

          {/* Stats */}
          
        </div>
      </div>
    </section>;
};