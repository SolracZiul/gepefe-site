import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { useState, useMemo } from "react";
import { useArticlesContext } from "@/contexts/ArticlesContext";

export default function Todos() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const { articles, loading, error } = useArticlesContext();

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = searchQuery === "" || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        article.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === "Todos" || article.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation 
        onSearch={setSearchQuery}
        onCategoryFilter={setSelectedCategory}
      />
      
      <main className="flex-1">
        {/* Page header */}
        <section className="py-12 bg-background border-b border-border">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary mb-4">
                Todas as Publicações
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore todo o acervo de publicações do GEPEFE em Educação Física e Escola
              </p>
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-destructive mb-4">Erro ao carregar artigos: {error}</p>
                <p className="text-muted-foreground">Tente recarregar a página</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  {searchQuery ? "Nenhum artigo encontrado para sua busca." : "Nenhum artigo disponível no momento."}
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <p className="text-muted-foreground">
                    Mostrando {filteredArticles.length} artigos
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}