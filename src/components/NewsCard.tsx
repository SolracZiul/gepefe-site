import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

interface News {
  id: string;
  title: string;
  summary: string;
  image_url: string;
  authors: string[];
  publish_date: string;
  tags: string[];
}

interface NewsCardProps {
  news: News;
}

export function NewsCard({ news }: NewsCardProps) {
  const publishDate = new Date(news.publish_date);
  const formattedDate = format(publishDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <Link to={`/noticia/${news.id}`}>
      <Card className="group overflow-hidden h-full hover:shadow-lg transition-all duration-300 cursor-pointer">
        <div className="relative h-48 overflow-hidden">
          <div 
            className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
            style={{ 
              backgroundImage: `url(${news.image_url || '/placeholder.svg'})`,
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Title at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2">
              {news.title}
            </h3>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Summary */}
          {news.summary && (
            <p className="text-muted-foreground text-sm line-clamp-2">
              {news.summary}
            </p>
          )}

          {/* Meta information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formattedDate}</span>
            </div>
            
            {news.authors.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="line-clamp-1">{news.authors.join(", ")}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {news.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {news.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {news.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{news.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}