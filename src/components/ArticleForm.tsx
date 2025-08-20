import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";

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
}

interface ArticleFormProps {
  article?: Article | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ArticleForm = ({ article, onSuccess, onCancel }: ArticleFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    authors: "",
    abstract: "",
    category: "",
    publish_date: "",
    pdf_url: "",
    tags: "",
  });
  const { toast } = useToast();

  const categories = [
    "Artigos Completos",
    "Textos Acadêmicos",
    "Pesquisas",
    "Dissertações"
  ];

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        authors: article.authors.join(", "),
        abstract: article.abstract,
        category: article.category,
        publish_date: article.publish_date,
        pdf_url: article.pdf_url || "",
        tags: article.tags.join(", "),
      });
    }
  }, [article]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const authorsArray = formData.authors.split(",").map(author => author.trim()).filter(Boolean);
      const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(Boolean);

      const articleData = {
        title: formData.title,
        authors: authorsArray,
        abstract: formData.abstract,
        category: formData.category,
        publish_date: formData.publish_date,
        pdf_url: formData.pdf_url || null,
        tags: tagsArray,
      };

      if (article) {
        // Update existing article
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', article.id);

        if (error) throw error;

        toast({
          title: "Artigo atualizado",
          description: "As alterações foram salvas com sucesso.",
        });
      } else {
        // Create new article
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase
          .from('articles')
          .insert({
            ...articleData,
            created_by: user?.id,
          });

        if (error) throw error;

        toast({
          title: "Artigo criado",
          description: "O novo artigo foi publicado com sucesso.",
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar artigo",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              {article ? "Editar Publicação" : "Nova Publicação"}
            </h1>
            <p className="text-muted-foreground">
              {article ? "Atualize as informações da publicação" : "Adicione uma nova publicação ao repositório"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Publicação</CardTitle>
            <CardDescription>
              Preencha todos os campos obrigatórios para publicar o artigo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="authors">Autores *</Label>
                <Input
                  id="authors"
                  value={formData.authors}
                  onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                  placeholder="Ex: Dr. João Silva, Profa. Maria Santos"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Separe os autores por vírgula
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="abstract">Resumo *</Label>
                <Textarea
                  id="abstract"
                  value={formData.abstract}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publish_date">Data de Publicação *</Label>
                  <Input
                    id="publish_date"
                    type="date"
                    value={formData.publish_date}
                    onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdf_url">URL do PDF</Label>
                <Input
                  id="pdf_url"
                  type="url"
                  value={formData.pdf_url}
                  onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                  placeholder="https://exemplo.com/arquivo.pdf"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags *</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Ex: Educação Física, Ensino, Metodologia"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Separe as tags por vírgula
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    article ? "Atualizar Publicação" : "Criar Publicação"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};