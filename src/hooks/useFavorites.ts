import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { readFavoriteCache, writeFavoriteCache, updateFavoriteIds } from '@/lib/favorites-cache';

const pending = new Set<string>();
export const useFavorites = (userId: string | null) => {
  const client = useQueryClient();
  const { toast } = useToast();
  const queryKey = ['favorites', userId] as const;
  const { data: favorites = [], isPending } = useQuery({
    queryKey,
    enabled: Boolean(userId),
    initialData: () => userId ? readFavoriteCache(userId) : [],
    initialDataUpdatedAt: 0,
    staleTime: 60_000,
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase.from('favorites').select('article_id').eq('user_id', userId);
      if (error) throw error;
      const ids = data?.map(favorite => favorite.article_id) ?? [];
      writeFavoriteCache(userId, ids);
      return ids;
    },
  });

  const toggleFavorite = useCallback(async (articleId: string) => {
    if (!userId) {
      toast({ variant: 'destructive', title: 'Faça login', description: 'Você precisa estar logado para favoritar artigos.' });
      return;
    }
    const operationKey = JSON.stringify([userId, articleId]);
    if (pending.has(operationKey)) return;
    pending.add(operationKey);
    const key = ['favorites', userId] as const;
    await client.cancelQueries({ queryKey: key });
    const before = client.getQueryData<string[]>(key) ?? readFavoriteCache(userId) ?? [];
    const wasSaved = before.includes(articleId);
    const apply = (saved: boolean) => {
      const next = updateFavoriteIds(client.getQueryData<string[]>(key) ?? [], articleId, saved);
      client.setQueryData(key, next);
      writeFavoriteCache(userId, next);
    };
    apply(!wasSaved);
    try {
      const { error } = wasSaved
        ? await supabase.from('favorites').delete().eq('user_id', userId).eq('article_id', articleId)
        : await supabase.from('favorites').insert({ user_id: userId, article_id: articleId });
      if (error) throw error;
      toast({ title: wasSaved ? 'Removido dos favoritos' : 'Adicionado aos favoritos', description: wasSaved ? 'Artigo removido da sua lista de favoritos.' : 'Artigo salvo na sua lista de favoritos.' });
    } catch {
      apply(wasSaved);
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar os favoritos.' });
    } finally {
      pending.delete(operationKey);
      if (![...pending].some(item => item.startsWith(`[${JSON.stringify(userId)},`))) void client.invalidateQueries({ queryKey: key });
    }
  }, [userId, client, toast]);

  const isFavorited = useCallback((articleId: string) => favorites.includes(articleId), [favorites]);
  return { favorites, loading: Boolean(userId) && isPending, toggleFavorite, isFavorited };
};
