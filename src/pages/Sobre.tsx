import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Award, Globe } from "lucide-react";
export default function Sobre() {
  const handleSearch = (query: string) => {
    console.log("Search:", query);
  };
  const handleCategoryFilter = (category: string) => {
    console.log("Filter:", category);
  };
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
            Sobre o GEPEFE
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Grupo de Estudos e Pesquisas em Educação Física e Escola - 
            Promovendo a pesquisa acadêmica e o conhecimento científico na área de Educação Física.
          </p>
        </div>

        {/* About Content */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-6">Nossa Missão</h2>
            <p className="text-lg text-muted-foreground mb-6">
              O GEPEFE dedica-se à produção e disseminação de conhecimento científico na área de 
              Educação Física Escolar, promovendo pesquisas que contribuam para o desenvolvimento 
              da área e a formação de profissionais qualificados.
            </p>
            <p className="text-lg text-muted-foreground">
              Nosso grupo reúne pesquisadores, professores e estudantes comprometidos com a 
              excelência acadêmica e o avanço do conhecimento em Educação Física.
            </p>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-primary mb-6">Objetivos</h2>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <BookOpen className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">
                  Desenvolver pesquisas científicas de qualidade na área de Educação Física Escolar
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <Users className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">
                  Formar pesquisadores e profissionais capacitados para atuar na área
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <Globe className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">
                  Disseminar o conhecimento produzido para a comunidade acadêmica e sociedade
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <Award className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">
                  Promover a excelência em pesquisa e extensão universitária
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Research Lines */}
        <div className="bg-gradient-card rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-primary mb-8 text-center">
            Linhas de Pesquisa
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-background rounded-lg p-6 shadow-card">
              <h3 className="text-xl font-semibold text-primary mb-3">
                Pedagogia do Esporte
              </h3>
              <p className="text-muted-foreground">
                Estudo dos processos de ensino-aprendizagem do esporte na escola e suas metodologias.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 shadow-card">
              <h3 className="text-xl font-semibold text-primary mb-3">
                Currículo Escolar
              </h3>
              <p className="text-muted-foreground">
                Análise e desenvolvimento de currículos de Educação Física na educação básica.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 shadow-card">
              <h3 className="text-xl font-semibold text-primary mb-3">
                Formação Docente
              </h3>
              <p className="text-muted-foreground">
                Pesquisas sobre a formação inicial e continuada de professores de Educação Física.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">
            Conheça Nossas Publicações
          </h2>
          <p className="text-muted-foreground mb-6">
            Explore nosso repositório de artigos, pesquisas e materiais acadêmicos.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            <BookOpen className="mr-2 h-5 w-5" />
            Ver Publicações
          </Button>
        </div>
      </main>

      <Footer />
    </div>;
}