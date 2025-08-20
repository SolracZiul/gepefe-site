import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { useState, useMemo } from "react";
import { useArticles } from "@/hooks/useArticles";

export default function Dissertacoes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Dissertações");
  const { articles, loading, error } = useArticles();

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesCategory = article.category === "Dissertações";
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
            <h1 className="text-3xl font-bold text-primary mb-2">Dissertações</h1>
            <p className="text-muted-foreground">Dissertações e teses desenvolvidas pelo GEPEFE</p>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                {searchQuery ? "Nenhuma dissertação encontrada." : "Nenhuma dissertação disponível."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}