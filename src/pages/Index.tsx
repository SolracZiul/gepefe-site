import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ArticleCard } from "@/components/ArticleCard";
import { Footer } from "@/components/Footer";
import { useArticles } from "@/hooks/useArticles";
import { useState, useMemo } from "react";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const { articles, loading, error } = useArticles();

  // Filter articles based on search and category
  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // Filter by category
    if (selectedCategory !== "Todos") {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(query) ||
        article.authors.some(author => author.toLowerCase().includes(query)) ||
        article.abstract.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [articles, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        onSearch={setSearchQuery}
        onCategoryFilter={setSelectedCategory}
      />
      
      <HeroSection />
      
      <AboutSection />
      
      {/* Articles Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Publicações Recentes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore nossa coleção de artigos, textos acadêmicos e pesquisas 
              em Educação Física escolar.
            </p>
          </div>

          {/* Filter Results Info */}
          <div className="mb-6 text-center">
            <p className="text-muted-foreground">
              {loading ? "Carregando publicações..." : 
               filteredArticles.length === articles.length 
                 ? `${filteredArticles.length} publicações disponíveis`
                 : `${filteredArticles.length} de ${articles.length} publicações encontradas`
              }
              {selectedCategory !== "Todos" && (
                <span className="ml-2">
                  na categoria "{selectedCategory}"
                </span>
              )}
              {searchQuery && (
                <span className="ml-2">
                  para "{searchQuery}"
                </span>
              )}
            </p>
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando publicações...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold text-destructive mb-4">
                Erro ao carregar publicações
              </h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Nenhuma publicação encontrada com os critérios selecionados.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("Todos");
                }}
                className="text-primary hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
