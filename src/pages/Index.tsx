import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RepositoryCollection } from '@/components/repository/RepositoryCollection';
import { NewsCard } from '@/components/NewsCard';
import { useArticlesContext } from '@/contexts/ArticlesContext';
import { useSearch } from '@/contexts/SearchContext';
import { useAuth } from '@/hooks/useAuth';
export default function Index() {
  const { articles } = useArticlesContext();
  const { searchQuery } = useSearch();
  const { isAdmin } = useAuth();
  const news = articles.filter(article => article.content_type === 'news' && (isAdmin || article.title !== 'Como Publicar Notícias no Portal GEPEFE')).sort((a, b) => b.publish_date.localeCompare(a.publish_date)).slice(0, 3);
  return <main>
    <RepositoryCollection home />
    {!searchQuery && news.length > 0 && <section className="mt-12 border-t border-border pt-8"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold">Notícias do GEPEFE</h2><Button variant="ghost" size="sm" asChild><Link to="/noticias">Todas as notícias<ArrowRight /></Link></Button></div><div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{news.map(item => <NewsCard key={item.id} news={{ ...item, summary: item.summary || '', image_url: item.image_url || '', images: item.images || [] }} />)}</div></section>}
  </main>;
}
