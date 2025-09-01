import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload } from "lucide-react";

interface News {
  id?: string;
  title: string;
  summary: string;
  content: string;
  authors: string[];
  publish_date: string;
  image_url?: string;
  tags: string[];
}

interface NewsFormProps {
  news?: News | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function NewsForm({ news, onSuccess, onCancel }: NewsFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    authors: "",
    publish_date: new Date().toISOString().split('T')[0],
    image_url: "",
    tags: "",
  });

  useEffect(() => {
    if (news) {
      setFormData({
        title: news.title || "",
        summary: news.summary || "",
        content: news.content || "",
        authors: news.authors?.join(", ") || "",
        publish_date: news.publish_date || new Date().toISOString().split('T')[0],
        image_url: news.image_url || "",
        tags: news.tags?.join(", ") || "",
      });
    }
  }, [news]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem (PNG, JPG, JPEG, etc.).",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 5MB.",
      });
      return;
    }

    setSelectedFile(file);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `news-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('academic-articles')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('academic-articles')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse authors and tags
      const authorsArray = formData.authors
        .split(',')
        .map(author => author.trim())
        .filter(author => author);

      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      let imageUrl = formData.image_url;

      // Upload image if selected
      if (selectedFile) {
        setUploading(true);
        const uploadedUrl = await uploadImage(selectedFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          throw new Error('Falha no upload da imagem');
        }
        setUploading(false);
      }

      const newsData = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        authors: authorsArray,
        publish_date: formData.publish_date,
        image_url: imageUrl,
        tags: tagsArray,
        content_type: 'news',
        abstract: formData.summary, // Use summary as abstract for compatibility
        category: 'Notícias',
      };

      if (news?.id) {
        // Update existing news
        const { error } = await supabase
          .from('articles')
          .update(newsData)
          .eq('id', news.id);

        if (error) throw error;

        toast({
          title: "Notícia atualizada",
          description: "A notícia foi atualizada com sucesso.",
        });
      } else {
        // Create new news
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { error } = await supabase
          .from('articles')
          .insert({
            ...newsData,
            created_by: user.id,
          });

        if (error) throw error;

        toast({
          title: "Notícia criada",
          description: "A notícia foi criada com sucesso.",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving news:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar notícia",
        description: error.message || "Ocorreu um erro inesperado.",
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {news ? "Editar Notícia" : "Nova Notícia"}
                </CardTitle>
                <Button onClick={onCancel} variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Digite o título da notícia"
                    required
                  />
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <Label htmlFor="summary">Resumo *</Label>
                  <Textarea
                    id="summary"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Digite um breve resumo da notícia"
                    className="min-h-[80px]"
                    required
                  />
                </div>

                {/* Authors */}
                <div className="space-y-2">
                  <Label htmlFor="authors">Autores *</Label>
                  <Input
                    id="authors"
                    value={formData.authors}
                    onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                    placeholder="Autor 1, Autor 2, Autor 3"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Separe múltiplos autores por vírgula
                  </p>
                </div>

                {/* Publish Date */}
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

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image">Imagem da Notícia</Label>
                  <div className="space-y-4">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                    <p className="text-sm text-muted-foreground">
                      Formatos aceitos: PNG, JPG, JPEG. Tamanho máximo: 5MB
                    </p>
                    
                    {/* Image URL alternative */}
                    <div className="space-y-2">
                      <Label htmlFor="image_url">Ou URL da Imagem</Label>
                      <Input
                        id="image_url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo da Notícia *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Digite o conteúdo completo da notícia"
                    className="min-h-[300px]"
                    required
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="educação física, evento, pesquisa"
                  />
                  <p className="text-sm text-muted-foreground">
                    Separe múltiplas tags por vírgula
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading || uploading}
                    className="flex-1"
                  >
                    {uploading ? (
                      <>
                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                        Enviando imagem...
                      </>
                    ) : loading ? (
                      "Salvando..."
                    ) : news ? (
                      "Atualizar Notícia"
                    ) : (
                      "Criar Notícia"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading || uploading}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}