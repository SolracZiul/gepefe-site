import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, BookOpen, Award } from "lucide-react";

export const AboutSection = () => {
  const features = [
    {
      icon: Users,
      title: "Comunidade Acadêmica",
      description: "Conectamos pesquisadores, professores e estudantes interessados em Educação Física escolar."
    },
    {
      icon: Target,
      title: "Pesquisa Aplicada",
      description: "Desenvolvemos estudos que contribuem diretamente para a prática pedagógica na escola."
    },
    {
      icon: BookOpen,
      title: "Acesso Aberto",
      description: "Todos os materiais são disponibilizados gratuitamente para democratizar o conhecimento."
    },
    {
      icon: Award,
      title: "Qualidade Científica",
      description: "Publicações rigorosamente revisadas seguindo os mais altos padrões acadêmicos."
    }
  ];

  return (
    <section className="py-16 px-4 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Sobre o GEPEFE
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            O Grupo de Estudos e Pesquisas em Educação Física e Escola é um coletivo 
            de pesquisadores dedicados ao avanço do conhecimento científico na área 
            da Educação Física escolar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center bg-gradient-card shadow-card hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-gradient-card rounded-lg p-8 shadow-card">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Nossa Missão</h3>
            <p className="text-muted-foreground mb-6">
              Promover o desenvolvimento científico na área da Educação Física escolar 
              através da produção, disseminação e aplicação de conhecimentos que contribuam 
              para a melhoria da qualidade do ensino e da aprendizagem em contextos educacionais.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Pesquisa</h4>
                <p className="text-muted-foreground">
                  Desenvolvemos estudos inovadores que abordam questões centrais da Educação Física escolar.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ensino</h4>
                <p className="text-muted-foreground">
                  Contribuímos para a formação de professores e pesquisadores na área.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Extensão</h4>
                <p className="text-muted-foreground">
                  Conectamos a universidade com as escolas através de projetos colaborativos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};