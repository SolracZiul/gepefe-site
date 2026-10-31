import { Button } from "@/components/ui/button";
import { openExternalUrl } from '@/lib/native';
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
        <Card key={article.id} className="w-full max-w-full overflow-hidden">
          <CardHeader className="px-4 py-3 sm:px-6 sm:py-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Badge variant="secondary" className="max-w-full truncate text-[11px] sm:text-xs">
                    {article.category}
                  </Badge>
                  <span className="flex items-center text-xs text-muted-foreground sm:text-sm">
                    <Calendar className="mr-1 h-3 w-3 shrink-0" />
                    {format(new Date(article.publish_date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
                <CardTitle className="mb-1.5 break-words text-base leading-snug sm:text-lg">
                  {article.title}
                </CardTitle>
                <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 break-words text-xs text-muted-foreground sm:text-sm">
                  <span className="flex min-w-0 items-center">
                    <User className="mr-1 h-3 w-3 shrink-0" />
                    <span className="min-w-0 break-words">{article.authors.join(", ")}</span>
                  </span>
                  <span className="flex items-center">
                    <Download className="mr-1 h-3 w-3 shrink-0" />
                    {article.download_count} downloads
                  </span>
                </div>
                <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                  {article.abstract}
                </CardDescription>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  aria-label="Editar publicação"
                  className="h-10 w-10 shrink-0 p-0"
                  onClick={() => onEdit(article)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  aria-label="Excluir publicação"
                  className="h-10 w-10 shrink-0 p-0 text-destructive hover:text-destructive"
                  onClick={() => onDelete(article.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

          </CardHeader>
          <CardContent className="px-4 pb-3 sm:px-6 sm:pb-6">
            <div className="flex flex-wrap gap-1.5">
              {article.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            {article.pdf_url && (
              <div className="mt-3">
                <Button
                  variant="link"
                  onClick={() => { if (article.pdf_url) void openExternalUrl(article.pdf_url); }}
                  className="h-auto p-0 text-sm"
                >
                  Ver PDF →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};