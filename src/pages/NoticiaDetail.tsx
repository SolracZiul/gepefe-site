import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, User, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import useEmblaCarousel from 'embla-carousel-react';

interface News {
  id: string;
  title: string;
  summary: string;
  image_url: string;
  images: string[];
  content: string;
  authors: string[];
  publish_date: string;
  tags: string[];
  created_at: string;
}

export default function NoticiaDetail() {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .eq('content_type', 'news')
        .single();

      if (error) {
        console.error('Error fetching news:', error);
      } else {
        setNews(data);
      }
      setLoading(false);
    };

    fetchNews();
  }, [id]);

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  const onSelect = () => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  };

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
  }, [emblaApi]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: news?.title,
        text: news?.summary,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Notícia não encontrada</h1>
            <Link to="/noticias">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Notícias
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const publishDate = new Date(news.publish_date);
  const formattedDate = format(publishDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <Link to="/noticias" className="inline-block mb-6">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Notícias
            </Button>
          </Link>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4 leading-tight">
              {news.title}
            </h1>
            
            {news.summary && (
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {news.summary}
              </p>
            )}

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
              
              {news.authors.length > 0 && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{news.authors.join(", ")}</span>
                </div>
              )}
              
              <Button onClick={handleShare} variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>

            <Separator className="mb-8" />
          </header>

          {/* Featured images carousel */}
          {news.images && news.images.length > 0 ? (
            <div className="mb-8">
              <div className="relative">
                <div className="overflow-hidden rounded-lg" ref={emblaRef}>
                  <div className="flex">
                    {news.images.map((imageUrl, index) => (
                      <div key={index} className="relative flex-[0_0_100%]">
                        <img
                          src={imageUrl}
                          alt={`${news.title} - Imagem ${index + 1}`}
                          className="w-full h-64 md:h-96 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Navigation buttons */}
                {news.images.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-none shadow-lg"
                      onClick={scrollPrev}
                      disabled={!prevBtnEnabled}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border-none shadow-lg"
                      onClick={scrollNext}
                      disabled={!nextBtnEnabled}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                {/* Dots indicator */}
                {news.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {news.images.map((_, index) => (
                      <button
                        key={index}
                        className="w-2 h-2 rounded-full bg-white/60 hover:bg-white/80 transition-colors"
                        onClick={() => emblaApi && emblaApi.scrollTo(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : news.image_url && (
            <div className="mb-8">
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Content */}
          <article className="prose prose-lg max-w-none mb-8">
            <div 
              className="text-foreground leading-relaxed"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {news.content}
            </div>
          </article>

          {/* Tags */}
          {news.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {news.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}