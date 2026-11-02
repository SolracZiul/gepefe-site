import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Article {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  category: string;
  publish_date: string;
  download_count: number;
  pdf_url: string | null;
  file_path: string | null;
  file_size: number | null;
  file_type: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  content_type?: string;
  summary?: string;
  content?: string;
  image_url?: string;
  images?: string[];
}

export const articlesQueryKey = ['articles'] as const;

export const useArticles = () => {
  const query = useQuery({
    queryKey: articlesQueryKey,
    staleTime: 60_000,
    queryFn: async (): Promise<Article[]> => {
      const { data, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const refetch = useCallback(async () => { await query.refetch(); }, [query.refetch]);
  return { articles: query.data ?? [], loading: query.isPending, error: query.error?.message ?? null, refetch };
};
