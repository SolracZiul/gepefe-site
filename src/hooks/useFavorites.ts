import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = (userId: string | null) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFavorites = async () => {
    if (!userId) {
      setFavorites([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select('article_id')
        .eq('user_id', userId);

      if (error) throw error;

      setFavorites(data?.map(fav => fav.article_id) || []);
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (articleId: string) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Faça login",
        description: "Você precisa estar logado para favoritar artigos.",
      });
      return;
    }

    const isFavorited = favorites.includes(articleId);

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('article_id', articleId);

        if (error) throw error;

        setFavorites(prev => prev.filter(id => id !== articleId));
        toast({
          title: "Removido dos favoritos",
          description: "Artigo removido da sua lista de favoritos.",
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: userId, article_id: articleId });

        if (error) throw error;

        setFavorites(prev => [...prev, articleId]);
        toast({
          title: "Adicionado aos favoritos",
          description: "Artigo salvo na sua lista de favoritos.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar os favoritos.",
      });
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [userId]);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorited: (articleId: string) => favorites.includes(articleId)
  };
};