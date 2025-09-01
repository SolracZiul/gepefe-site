import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

console.log("useArticles hook: Starting imports...");

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

export const useArticles = () => {
  console.log("useArticles hook: Called");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    console.log("useArticles hook: Fetching articles...");
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log("useArticles hook: Articles fetched successfully", data);
      setArticles(data || []);
      setError(null);
    } catch (err: any) {
      console.log("useArticles hook: Error fetching articles", err);
      setError(err.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useArticles hook: useEffect triggered");
    fetchArticles();
  }, []);

  return {
    articles,
    loading,
    error,
    refetch: fetchArticles,
  };
};