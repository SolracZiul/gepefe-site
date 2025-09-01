import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { NewsCard } from "@/components/NewsCard";
import { useSearch } from "@/contexts/SearchContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface News {
  id: string;
  title: string;
  summary: string;
  image_url: string;
  content: string;
  authors: string[];
  publish_date: string;
  created_at: string;
  tags: string[];
}

export default function Noticias() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = useSearch();

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('content_type', 'news')
        .order('publish_date', { ascending: false });

      if (error) {
        console.error('Error fetching news:', error);
      } else {
        setNews(data || []);
      }
      setLoading(false);
    };

    fetchNews();
  }, []);

  const filteredNews = news.filter((item) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.summary?.toLowerCase().includes(query) ||
      item.content?.toLowerCase().includes(query) ||
      item.authors.some(author => author.toLowerCase().includes(query)) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">Notícias GEPEFE</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Acompanhe as últimas novidades, eventos e atualizações do Grupo de Estudos e Pesquisas em Educação Física Escolar
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">Nenhuma notícia encontrada</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? `Não foram encontradas notícias para "${searchQuery}"`
                : "Não há notícias publicadas no momento"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}