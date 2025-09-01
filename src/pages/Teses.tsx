import React, { useMemo, useEffect } from 'react';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ArticleCard } from '@/components/ArticleCard';
import { useArticlesContext } from '@/contexts/ArticlesContext';
import { useSearch } from '@/contexts/SearchContext';
const Teses = () => {
  console.log("Teses component: Rendering");
  const {
    articles,
    loading
  } = useArticlesContext();
  const {
    searchQuery,
    selectedCategory
  } = useSearch();

  // Filter articles
  const filteredArticles = useMemo(() => {
    console.log("Teses component: Filtering articles", {
      total: articles.length,
      searchQuery,
      selectedCategory
    });
    return articles.filter(article => {
      // Exclude news from repository pages
      const isNotNews = article.content_type !== 'news';
      // Always filter by category first
      const matchesCategory = article.category === "Teses";

      // Then filter by search query if present
      const matchesSearch = !searchQuery || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        article.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) || 
        article.abstract.toLowerCase().includes(searchQuery.toLowerCase()) || 
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return isNotNews && matchesCategory && matchesSearch;
    });
  }, [articles, searchQuery, selectedCategory]);
  useEffect(() => {
    console.log("Teses component: Filtered articles count:", filteredArticles.length);
  }, [filteredArticles]);
  if (loading) {
    return <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando teses...</p>
          </div>
        </div>
        <Footer />
      </div>;
  }
  return <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Teses</h1>
            <p className="text-muted-foreground">Teses em Educação Física e Escola desenvolvidas pelo GEPEFE</p>
          </header>

          {filteredArticles.length === 0 ? <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {searchQuery ? `Nenhuma tese encontrada para "${searchQuery}"` : "Nenhuma tese disponível no momento."}
              </p>
            </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map(article => <ArticleCard key={article.id} article={article} />)}
            </div>}
        </div>
      </main>
      
      <Footer />
    </div>;
};
export default Teses;