import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { ArticleCard } from "@/components/ArticleCard";
import { Footer } from "@/components/Footer";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useArticles } from "@/hooks/useArticles";
import { useState, useMemo } from "react";
console.log("Index.tsx: Starting imports...");
const Index = () => {
  console.log("Index component rendering...");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const {
    articles,
    loading,
    error
  } = useArticles();

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
      filtered = filtered.filter(article => article.title.toLowerCase().includes(query) || article.authors.some(author => author.toLowerCase().includes(query)) || article.abstract.toLowerCase().includes(query) || article.tags.some(tag => tag.toLowerCase().includes(query)));
    }
    return filtered;
  }, [articles, searchQuery, selectedCategory]);
  return <>
      <AppSidebar onCategoryFilter={setSelectedCategory} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                
              </div>
              
              <Navigation onSearch={setSearchQuery} onCategoryFilter={setSelectedCategory} />
            </div>
          </div>
        </header>
        
        <main className="flex-1">
          <HeroSection />
          
          <AboutSection />
          
          {/* Articles Section */}
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-primary mb-4">
                  Publicações Recentes
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Explore os trabalhos mais recentes do GEPEFE em Educação Física e Escola
                </p>
              </div>

              {loading ? <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div> : error ? <div className="text-center py-16">
                  <p className="text-destructive mb-4">Erro ao carregar artigos: {error}</p>
                  <p className="text-muted-foreground">Tente recarregar a página</p>
                </div> : filteredArticles.length === 0 ? <div className="text-center py-16">
                  <p className="text-muted-foreground">
                    {searchQuery ? "Nenhum artigo encontrado para sua busca." : "Nenhum artigo disponível no momento."}
                  </p>
                </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.slice(0, 6).map(article => <ArticleCard key={article.id} article={article} />)}
                </div>}

              {filteredArticles.length > 6 && <div className="text-center mt-8">
                  <p className="text-muted-foreground">
                    Mostrando 6 de {filteredArticles.length} artigos.{" "}
                    <a href="/todos" className="text-primary hover:underline">
                      Ver todos os artigos
                    </a>
                  </p>
                </div>}
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>;
};
export default Index;