import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye, Calendar, User, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ArticleViewer } from "./ArticleViewer";
import { useNavigate } from "react-router-dom";

// Component for displaying article information with favorites functionality

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
}

interface ArticleCardProps {
  article: Article;
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  const { user } = useAuth();
  const { toggleFavorite, isFavorited } = useFavorites(user?.id || null);
  const [showPreview, setShowPreview] = useState(false);
  const navigate = useNavigate();

  const handleDownload = async () => {
    try {
      if (article.file_path) {
        // Download from Supabase Storage
        const { data, error } = await supabase.storage
          .from('academic-articles')
          .download(article.file_path);

        if (error) throw error;

        // Create download link
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${article.title}.${article.file_type?.split('/')[1] || 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Update download count
        await supabase
          .from('articles')
          .update({ download_count: article.download_count + 1 })
          .eq('id', article.id);
      } else if (article.pdf_url) {
        // External URL - open in new tab
        window.open(article.pdf_url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const hasFile = article.file_path || article.pdf_url;

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
        
        <h3 
          className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors cursor-pointer"
          onClick={() => navigate(`/article/${article.id}`)}
        >
          {article.title}
        </h3>
        
        <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center min-w-0">
            {article.authors.length === 1 && article.authors[0] === "Integrantes do Grupo de Estudos e Pesquisas em Educação Física e Escola" ? (
              // Criação coletiva do GEPEFE - apenas o selo, sem ícone
              <div className="flex items-center gap-2 min-w-0">
                <span className="bg-gradient-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0">
                  GEPEFE
                </span>
                <span className="font-medium text-primary truncate">
                  {article.authors[0]}
                </span>
              </div>
            ) : article.authors.some(author => author.includes(" (GEPEFE)")) ? (
              // Integrantes individuais do GEPEFE - apenas ícone amarelo, sem badge
              <>
                <User className="w-4 h-4 mr-1 flex-shrink-0 text-yellow-500" />
                <span className="truncate">
                  {article.authors.map(author => author.replace(" (GEPEFE)", "")).join(", ")}
                </span>
              </>
            ) : (
              // Autores externos - ícone cinza normal
              <>
                <User className="w-4 h-4 mr-1 flex-shrink-0" />
                <span className="truncate">{article.authors.join(", ")}</span>
              </>
            )}
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
            <span>{new Date(article.publish_date).toLocaleDateString('pt-BR')}</span>
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
            disabled={!hasFile}
          >
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </Button>
          <Button 
            onClick={handleDownload}
            size="sm" 
            className="flex-1 bg-gradient-primary hover:shadow-glow"
            disabled={!hasFile}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Article Viewer */}
        <ArticleViewer
          article={article}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
      </CardContent>
    </Card>
  );
};