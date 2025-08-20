import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import React, { useState } from "react";
import { useArticles } from "@/hooks/useArticles";

export default function ArtigosCompletos() {
  const { articles, loading, error } = useArticles();
  const [filteredArticles, setFilteredArticles] = useState<any[]>([]);

  // Filter articles by category on load
  React.useEffect(() => {
    if (articles.length > 0) {
      setFilteredArticles(articles.filter(article => article.category === "Artigos Completos"));
    }
  }, [articles]);

  const handleSearch = (query: string) => {
    const filtered = articles.filter(article => 
      article.category === "Artigos Completos" &&
      (article.title.toLowerCase().includes(query.toLowerCase()) ||
       article.authors.some(author => author.toLowerCase().includes(query.toLowerCase())) ||
       article.abstract.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredArticles(filtered);
  };

  const handleCategoryFilter = (category: string) => {
    if (category === "Todos") {
      setFilteredArticles(articles.filter(article => article.category === "Artigos Completos"));
    } else {
      setFilteredArticles(articles.filter(article => article.category === category));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation onSearch={handleSearch} onCategoryFilter={handleCategoryFilter} />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Artigos Completos
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Artigos científicos completos publicados pelos pesquisadores do GEPEFE, 
            abordando diversos aspectos da Educação Física Escolar.
          </p>
          <div className="mt-6 text-lg text-primary font-semibold">
            {filteredArticles.length} artigos encontrados
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando artigos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-destructive mb-4">
              Erro ao carregar artigos
            </h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-primary mb-4">
              Nenhum artigo encontrado
            </h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou termos de busca para encontrar mais conteúdo.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}