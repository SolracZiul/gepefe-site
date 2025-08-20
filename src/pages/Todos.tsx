import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { useState, useMemo } from "react";
import { mockArticles } from "@/data/articles";

export default function Todos() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredArticles = useMemo(() => {
    return mockArticles.filter(article => {
      const matchesSearch = searchQuery === "" || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        article.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === "Todos" || article.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation onSearch={handleSearch} onCategoryFilter={handleCategoryFilter} />
      
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Todas as Publicações
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore todo o acervo de publicações do GEPEFE, incluindo artigos completos, 
            textos acadêmicos, pesquisas e dissertações na área de Educação Física Escolar.
          </p>
          <div className="mt-6 text-lg text-primary font-semibold">
            {filteredArticles.length} publicações encontradas
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
              Nenhuma publicação encontrada
            </h3>
            <p className="text-muted-foreground mb-6">
              Tente ajustar os filtros ou termos de busca para encontrar mais conteúdo.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Todos");
              }}
              className="text-primary hover:underline font-medium"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}