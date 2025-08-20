import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { useState, useMemo } from "react";
import { useArticles } from "@/hooks/useArticles";

export default function ArtigosCompletos() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Artigos Completos");
  const { articles, loading, error } = useArticles();

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesCategory = article.category === "Artigos Completos";
      const matchesSearch = searchQuery === "" || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        article.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [articles, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation 
        onSearch={setSearchQuery}
        onCategoryFilter={setSelectedCategory}
      />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Artigos Completos</h1>
            <p className="text-muted-foreground">
              Artigos acadêmicos completos desenvolvidos pelo GEPEFE
            </p>
          </div>

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
                {searchQuery ? "Nenhum artigo encontrado para sua busca." : "Nenhum artigo completo disponível no momento."}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  {filteredArticles.length} {filteredArticles.length === 1 ? 'artigo encontrado' : 'artigos encontrados'}
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
      </main>

      <Footer />
    </div>
  );
}