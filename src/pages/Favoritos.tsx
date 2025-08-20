import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { useArticlesContext } from "@/contexts/ArticlesContext";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const Favoritos = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { articles, loading: articlesLoading } = useArticlesContext();
  const { user, loading: authLoading } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites(user?.id || null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryFilter = () => {
    // Not used in favorites page
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Carregando...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto" />
              <h1 className="text-2xl font-bold">Acesso restrito</h1>
              <p className="text-muted-foreground max-w-md">
                Você precisa estar logado para acessar sua lista de favoritos.
              </p>
              <Link to="/auth">
                <Button>
                  Fazer Login
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const favoriteArticles = articles.filter(article => 
    favorites.includes(article.id) &&
    (searchQuery === "" || 
     article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     article.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
     article.abstract.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isLoading = articlesLoading || favoritesLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Meus Favoritos</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seus artigos salvos para leitura posterior
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Carregando favoritos...</p>
            </div>
          </div>
        ) : favoriteArticles.length === 0 ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-4">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
              <h2 className="text-xl font-semibold">Nenhum favorito ainda</h2>
              <p className="text-muted-foreground max-w-md">
                {searchQuery 
                  ? "Nenhum artigo favorito corresponde à sua pesquisa."
                  : "Comece a explorar e favoritar artigos que deseja ler mais tarde."}
              </p>
              {!searchQuery && (
                <Link to="/todos">
                  <Button variant="outline">
                    Explorar Artigos
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:gap-8">
            {favoriteArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Favoritos;