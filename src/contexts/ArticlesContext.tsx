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
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    console.log("ArticlesProvider: Fetching articles...");
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log("ArticlesProvider: Articles fetched successfully", data);
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
    console.log("ArticlesProvider: Initial fetch triggered");
    fetchArticles();
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
  return context;
};