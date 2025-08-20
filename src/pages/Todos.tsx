import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState, useMemo } from "react";
import { useArticles } from "@/hooks/useArticles";

export default function Todos() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const { articles, loading, error } = useArticles();

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
    <>
      <AppSidebar onCategoryFilter={setSelectedCategory} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                <div className="flex items-center space-x-2">
                  <div className="h-8">
                    <img 
                      src="/lovable-uploads/24fb75f9-0b2a-410a-8f90-d6d3efcf52e4.png" 
                      alt="GEPEFE Logo" 
                      className="h-8 w-auto object-contain" 
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Repositório Acadêmico</p>
                  </div>
                </div>
              </div>
              
              <Navigation 
                onSearch={setSearchQuery}
                onCategoryFilter={setSelectedCategory}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2">
                {selectedCategory === "Todos" ? "Todas as Publicações" : selectedCategory}
              </h1>
              <p className="text-muted-foreground">
                {selectedCategory === "Todos" 
                  ? "Explore todo o acervo de publicações do GEPEFE"
                  : `Publicações da categoria ${selectedCategory}`
                }
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
                  {searchQuery ? "Nenhum artigo encontrado para sua busca." : "Nenhum artigo disponível no momento."}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground">
                    {filteredArticles.length} {filteredArticles.length === 1 ? 'publicação encontrada' : 'publicações encontradas'}
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
    </>
  );
}