-- Ativar real-time updates para a tabela articles
ALTER TABLE public.articles REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação de real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;