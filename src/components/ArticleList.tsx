import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Download, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Article {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  category: string;
  publish_date: string;
  download_count: number;
  pdf_url: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface ArticleListProps {
  articles: Article[];
  onEdit: (article: Article) => void;
  onDelete: (articleId: string) => void;
}

export const ArticleList = ({ articles, onEdit, onDelete }: ArticleListProps) => {
  if (articles.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Nenhuma publicação encontrada
            </h3>
            <p className="text-muted-foreground">
              Clique em "Nova Publicação" para adicionar a primeira publicação.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <Card key={article.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{article.category}</Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(article.publish_date), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Download className="h-3 w-3 mr-1" />
                    {article.download_count} downloads
                  </div>
                </div>
                <CardTitle className="text-lg mb-2">{article.title}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <User className="h-3 w-3 mr-1" />
                  {article.authors.join(", ")}
                </div>
                <CardDescription className="line-clamp-2">
                  {article.abstract}
                </CardDescription>
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(article)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(article.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {article.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            {article.pdf_url && (
              <div className="mt-3">
                <a
                  href={article.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Ver PDF →
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};