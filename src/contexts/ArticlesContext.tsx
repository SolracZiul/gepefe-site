import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Article } from '@/hooks/useArticles';

interface ArticlesContextType {
  articles: Article[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const ArticlesContext = createContext<ArticlesContextType | undefined>(undefined);

export const ArticlesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log("ArticlesProvider: Provider initialized");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    console.log("ArticlesProvider: Fetching articles...");
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log("ArticlesProvider: Articles fetched successfully", data);
      console.log("ArticlesProvider: Total articles:", data?.length || 0);
      setArticles(data || []);
      setError(null);
    } catch (err: any) {
      console.log("ArticlesProvider: Error fetching articles", err);
      setError(err.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("ArticlesProvider: useEffect triggered - fetching articles and setting up real-time");
    fetchArticles();

    // Configurar real-time updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'articles'
        },
        (payload) => {
          console.log('ArticlesProvider: Real-time update received', payload);
          // Atualizar dados quando houver mudanças
          fetchArticles();
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      console.log("ArticlesProvider: Removing real-time subscription");
      supabase.removeChannel(channel);
    };
  }, []);

  const value: ArticlesContextType = {
    articles,
    loading,
    error,
    refetch: fetchArticles,
  };

  return (
    <ArticlesContext.Provider value={value}>
      {children}
    </ArticlesContext.Provider>
  );
};

export const useArticlesContext = (): ArticlesContextType => {
  const context = useContext(ArticlesContext);
  if (context === undefined) {
    throw new Error('useArticlesContext must be used within an ArticlesProvider');
  }
  console.log("useArticlesContext: Context accessed, articles count:", context.articles.length);
  return context;
};