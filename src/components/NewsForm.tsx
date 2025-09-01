import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, Bold, Italic, Type } from "lucide-react";

interface News {
  id?: string;
  title: string;
  summary: string;
  content: string;
  authors: string[];
  publish_date: string;
  image_url?: string;
  images?: string[];
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [contentTextareaRef, setContentTextareaRef] = useState<HTMLTextAreaElement | null>(null);
  
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
      
      // Set existing images
      if (news.images && news.images.length > 0) {
        setUploadedImages(news.images);
      } else if (news.image_url) {
        setUploadedImages([news.image_url]);
      }
    }
  }, [news]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    
    for (const file of files) {
      // Validate file type (images only)
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Arquivo inválido",
          description: `${file.name} não é uma imagem válida.`,
        });
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: `${file.name} deve ter no máximo 5MB.`,
        });
        continue;
      }

      validFiles.push(file);
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
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

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          variant: "destructive",
          title: "Erro no upload",
          description: `Falha ao enviar ${file.name}`,
        });
      }
    }
    
    return uploadedUrls;
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Formatting functions for content
  const insertFormatting = (format: string) => {
    if (!contentTextareaRef) return;
    
    const start = contentTextareaRef.selectionStart;
    const end = contentTextareaRef.selectionEnd;
    const selectedText = contentTextareaRef.value.substring(start, end);
    
    let formattedText = '';
    let cursorOffset = 0;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case 'heading':
        formattedText = `## ${selectedText}`;
        cursorOffset = selectedText ? 0 : 3;
        break;
    }
    
    const newContent = 
      formData.content.substring(0, start) + 
      formattedText + 
      formData.content.substring(end);
    
    setFormData({ ...formData, content: newContent });
    
    // Restore cursor position
    setTimeout(() => {
      if (contentTextareaRef) {
        const newPosition = start + formattedText.length - cursorOffset;
        contentTextareaRef.setSelectionRange(newPosition, newPosition);
        contentTextareaRef.focus();
      }
    }, 0);
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

      let allImages = [...uploadedImages];

      // Upload new selected files
      if (selectedFiles.length > 0) {
        setUploading(true);
        const newUploadedUrls = await uploadImages(selectedFiles);
        allImages = [...allImages, ...newUploadedUrls];
        setUploading(false);
      }

      const newsData = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        authors: authorsArray,
        publish_date: formData.publish_date,
        image_url: allImages[0] || null, // Keep first image for compatibility
        images: allImages,
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

                {/* Multiple Images Upload */}
                <div className="space-y-2">
                  <Label htmlFor="images">Imagens da Notícia</Label>
                  <div className="space-y-4">
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                    />
                    <p className="text-sm text-muted-foreground">
                      Formatos aceitos: PNG, JPG, JPEG. Tamanho máximo: 5MB por imagem. Você pode selecionar múltiplas imagens.
                    </p>
                    
                    {/* Preview of selected files */}
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <Label>Arquivos selecionados:</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="relative border rounded p-2 text-sm">
                              <span className="block truncate">{file.name}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeSelectedFile(index)}
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Preview of already uploaded images */}
                    {uploadedImages.length > 0 && (
                      <div className="space-y-2">
                        <Label>Imagens atuais:</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {uploadedImages.map((imageUrl, index) => (
                            <div key={index} className="relative">
                              <img
                                src={imageUrl}
                                alt={`Imagem ${index + 1}`}
                                className="w-full h-24 object-cover rounded border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeUploadedImage(index)}
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                              >
                                ×
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Image URL alternative */}
                    <div className="space-y-2">
                      <Label htmlFor="image_url">Ou adicionar URL de Imagem</Label>
                      <div className="flex gap-2">
                        <Input
                          id="image_url"
                          value={formData.image_url}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                          placeholder="https://exemplo.com/imagem.jpg"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (formData.image_url) {
                              setUploadedImages(prev => [...prev, formData.image_url]);
                              setFormData({ ...formData, image_url: "" });
                            }
                          }}
                          disabled={!formData.image_url}
                        >
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Conteúdo da Notícia *</Label>
                  
                  {/* Formatting toolbar */}
                  <div className="flex gap-2 p-2 border border-border rounded-t-md bg-muted/30">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertFormatting('heading')}
                      className="h-8 px-2"
                    >
                      <Type className="h-3 w-3 mr-1" />
                      Título
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertFormatting('bold')}
                      className="h-8 px-2"
                    >
                      <Bold className="h-3 w-3 mr-1" />
                      Negrito
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertFormatting('italic')}
                      className="h-8 px-2"
                    >
                      <Italic className="h-3 w-3 mr-1" />
                      Itálico
                    </Button>
                  </div>
                  
                  <Textarea
                    id="content"
                    ref={setContentTextareaRef}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Digite o conteúdo completo da notícia&#10;&#10;Use:&#10;## Título da seção&#10;**texto em negrito**&#10;*texto em itálico*"
                    className="min-h-[300px] rounded-t-none border-t-0"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Use a barra de ferramentas acima ou digite diretamente: **negrito**, *itálico*, ## título
                  </p>
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