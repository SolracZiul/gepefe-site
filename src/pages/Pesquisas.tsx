import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { useState, useMemo } from "react";
import { useArticlesContext } from "@/contexts/ArticlesContext";
import { useSearch } from "@/contexts/SearchContext";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Pesquisas() {
  const { searchQuery, selectedCategory } = useSearch();
  const { articles, loading, error } = useArticlesContext();
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 9;

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesCategory = article.category === "Pesquisas";
      const matchesSearch = searchQuery === "" || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        article.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [articles, searchQuery]);

  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Pesquisas</h1>
            <p className="text-muted-foreground">Trabalhos de pesquisa desenvolvidos pelo GEPEFE</p>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                {searchQuery ? "Nenhuma pesquisa encontrada." : "Nenhuma pesquisa disponível."}
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="text-muted-foreground">
                  Mostrando {currentArticles.length} de {filteredArticles.length} pesquisas
                  {totalPages > 1 && ` (Página ${currentPage} de ${totalPages})`}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {currentArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {/* Primeira página */}
                      {currentPage > 2 && (
                        <>
                          <PaginationItem>
                            <PaginationLink onClick={() => setCurrentPage(1)} className="cursor-pointer">
                              1
                            </PaginationLink>
                          </PaginationItem>
                          {currentPage > 3 && <PaginationEllipsis />}
                        </>
                      )}
                      
                      {/* Páginas ao redor da atual */}
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 2, currentPage - 1)) + i;
                        if (pageNum > totalPages) return null;
                        
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink 
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {/* Última página */}
                      {currentPage < totalPages - 1 && (
                        <>
                          {currentPage < totalPages - 2 && <PaginationEllipsis />}
                          <PaginationItem>
                            <PaginationLink onClick={() => setCurrentPage(totalPages)} className="cursor-pointer">
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}