import { Mail, ExternalLink, MapPin } from "lucide-react";
export const Footer = () => {
  return <footer className="bg-foreground text-background py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/lovable-uploads/24fb75f9-0b2a-410a-8f90-d6d3efcf52e4.png" alt="GEPEFE Logo" className="h-8 w-auto object-contain" />
              <div>
                <h3 className="font-semibold">GEPEFE</h3>
                <p className="text-sm text-background/70">Repositório Acadêmico</p>
              </div>
            </div>
            <p className="text-background/80 text-sm">Grupo de Estudos e Pesquisas em Educação Física e Escola - Promovendo o conhecimento científico em Educação Física escolar.</p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-background/80">gepefe@universidade.edu.br</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-background/80">Universidade Federal - Campus Principal</span>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-4 h-4 text-primary" />
                <a href="/sobre" className="text-background/80 hover:text-primary transition-colors">
                  Sobre Nós
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <div className="space-y-2 text-sm">
              
              <a href="/todos" className="block text-background/80 hover:text-primary transition-colors">
                Todas as Publicações
              </a>
              <a href="/pesquisas" className="block text-background/80 hover:text-primary transition-colors">
                Pesquisas
              </a>
              <a href="/dissertacoes" className="block text-background/80 hover:text-primary transition-colors">
                Dissertações
              </a>
              <a href="/artigos-completos" className="block text-background/80 hover:text-primary transition-colors">
                Artigos Completos
              </a>
              <a href="/textos-academicos" className="block text-background/80 hover:text-primary transition-colors">
                Textos Acadêmicos
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center">
          <p className="text-sm text-background/60">
            © 2024 GEPEFE - Grupo de Estudos e Pesquisas em Educação Física e Escola. 
            Todos os direitos reservados.
          </p>
          <p className="text-xs text-background/50 mt-2">
            Este repositório é dedicado ao acesso aberto do conhecimento científico.
          </p>
        </div>
      </div>
    </footer>;
};