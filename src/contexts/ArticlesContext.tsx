import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useArticles, articlesQueryKey } from '@/hooks/useArticles';

const ArticlesContext = createContext<ReturnType<typeof useArticles> | undefined>(undefined);

export const ArticlesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = useQueryClient();
  const { articles, loading, error, refetch } = useArticles();
  useEffect(() => {
    const channel = supabase.channel('schema-db-changes').on('postgres_changes', {
      event: '*', schema: 'public', table: 'articles',
    }, () => { void client.invalidateQueries({ queryKey: articlesQueryKey }); }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [client]);
  const value = useMemo(() => ({ articles, loading, error, refetch }), [articles, loading, error, refetch]);
  return <ArticlesContext.Provider value={value}>{children}</ArticlesContext.Provider>;
};

export const useArticlesContext = () => {
  const context = useContext(ArticlesContext);
  if (!context) throw new Error('useArticlesContext must be used within an ArticlesProvider');
  return context;
};
