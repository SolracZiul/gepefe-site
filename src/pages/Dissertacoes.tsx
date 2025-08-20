import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { useState } from "react";
import { mockArticles } from "@/data/articles";

export default function Dissertacoes() {
  const [filteredArticles, setFilteredArticles] = useState(
    mockArticles.filter(article => article.category === "Dissertações")
  );

  const handleSearch = (query: string) => {
    const filtered = mockArticles.filter(article => 
      article.category === "Dissertações" &&
      (article.title.toLowerCase().includes(query.toLowerCase()) ||
       article.authors.some(author => author.toLowerCase().includes(query.toLowerCase())) ||
       article.abstract.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredArticles(filtered);
  };

  const handleCategoryFilter = (category: string) => {
    if (category === "Todos") {
      setFilteredArticles(mockArticles.filter(article => article.category === "Dissertações"));
    } else {
      setFilteredArticles(mockArticles.filter(article => article.category === category));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation onSearch={handleSearch} onCategoryFilter={handleCategoryFilter} />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Dissertações
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Dissertações de mestrado e teses de doutorado produzidas por membros e 
            orientandos do GEPEFE, representando pesquisas aprofundadas na área.
          </p>
          <div className="mt-6 text-lg text-primary font-semibold">
            {filteredArticles.length} dissertações encontradas
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {/* Empty State */}
        {filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-primary mb-4">
              Nenhuma dissertação encontrada
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