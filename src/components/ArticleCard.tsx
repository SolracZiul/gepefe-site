import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Calendar, User, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";

export interface Article {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  category: string;
  publish_date: string;
  download_count: number;
  pdf_url: string | null;
  tags: string[];
}

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  const { user } = useAuth();
  const { toggleFavorite, isFavorited } = useFavorites(user?.id || null);

  const handleDownload = () => {
    if (article.pdf_url) {
      window.open(article.pdf_url, '_blank');
    } else {
      console.log(`PDF não disponível para: ${article.title}`);
    }
  };

  const handlePreview = () => {
    if (article.pdf_url) {
      window.open(article.pdf_url, '_blank');
    } else {
      console.log(`PDF não disponível para: ${article.title}`);
    }
  };

  return (
    <Card className="group hover:shadow-elegant transition-all duration-300 bg-gradient-card border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {article.category}
          </Badge>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Download className="w-4 h-4 mr-1" />
              {article.download_count}
            </div>
            
            {user && (
              <Button
                variant={isFavorited(article.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFavorite(article.id)}
                className="flex items-center gap-1"
              >
                <Heart className={`h-4 w-4 ${isFavorited(article.id) ? 'fill-current' : ''}`} />
              </Button>
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-1" />
            {article.authors.join(", ")}
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(article.publish_date).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {article.abstract}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handlePreview}
            variant="outline" 
            size="sm" 
            className="flex-1"
            disabled={!article.pdf_url}
          >
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </Button>
          <Button 
            onClick={handleDownload}
            size="sm" 
            className="flex-1 bg-gradient-primary hover:shadow-glow"
            disabled={!article.pdf_url}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};