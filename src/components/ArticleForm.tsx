import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Upload, FileText, Trash2, Users } from "lucide-react";

interface Article {
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

interface ArticleFormProps {
  article?: Article | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ArticleForm = ({ article, onSuccess, onCancel }: ArticleFormProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isGepefeCreation, setIsGepefeCreation] = useState(false);
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
    "Dissertações",
    "Teses"
  ];

  useEffect(() => {
    if (article) {
      // Check if it's a GEPEFE creation by looking at the authors
      const isGepefe = article.authors.length === 1 && 
        article.authors[0] === "Integrantes do Grupo de Estudos e Pesquisas em Educação Física e Escola";
      
      setIsGepefeCreation(isGepefe);
      setFormData({
        title: article.title,
        authors: isGepefe ? "" : article.authors.join(", "),
        abstract: article.abstract,
        category: article.category,
        publish_date: article.publish_date,
        pdf_url: article.pdf_url || "",
        tags: article.tags.join(", "),
      });
    }
  }, [article]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Tipo de arquivo inválido",
          description: "Apenas arquivos PDF, DOC e DOCX são permitidos.",
        });
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB.",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<{ path: string; size: number; type: string } | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('academic-articles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      return {
        path: filePath,
        size: file.size,
        type: file.type
      };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: error.message,
      });
      return null;
    }
  };

  const deleteUploadedFile = async (filePath: string) => {
    try {
      await supabase.storage
        .from('academic-articles')
        .remove([filePath]);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Handle authors based on GEPEFE creation checkbox
      const authorsArray = isGepefeCreation 
        ? ["Integrantes do Grupo de Estudos e Pesquisas em Educação Física e Escola"]
        : formData.authors.split(",").map(author => author.trim()).filter(Boolean);
      
      const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(Boolean);

      let fileData = null;
      if (selectedFile) {
        setUploading(true);
        fileData = await uploadFile(selectedFile);
        setUploading(false);
        
        if (!fileData) {
          setLoading(false);
          return;
        }
      }

      const articleData = {
        title: formData.title,
        authors: authorsArray,
        abstract: formData.abstract,
        category: formData.category,
        publish_date: formData.publish_date,
        pdf_url: formData.pdf_url || null,
        tags: tagsArray,
        file_path: fileData?.path || (article?.file_path || null),
        file_size: fileData?.size || (article?.file_size || null),
        file_type: fileData?.type || (article?.file_type || null),
      };

      if (article) {
        // If updating and there's a new file, delete the old one
        if (fileData && article.file_path) {
          await deleteUploadedFile(article.file_path);
        }

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
      // If there was an error and we uploaded a file, clean it up
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        await deleteUploadedFile(fileName);
      }

      toast({
        variant: "destructive",
        title: "Erro ao salvar artigo",
        description: error.message,
      });
    } finally {
      setLoading(false);
      setUploading(false);
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

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="gepefe-creation" 
                    checked={isGepefeCreation}
                    onCheckedChange={(checked) => setIsGepefeCreation(checked as boolean)}
                  />
                  <Label htmlFor="gepefe-creation" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <Users className="h-4 w-4 text-primary" />
                    Criação do GEPEFE
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Marque esta opção se o artigo foi criado pelos "Integrantes do Grupo de Estudos e Pesquisas em Educação Física e Escola"
                </p>

                {!isGepefeCreation && (
                  <>
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
                  </>
                )}
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

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Arquivo do Documento</Label>
                  <div className="w-full">
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        id="file-upload"
                      />
                      <div className="flex items-center justify-center w-full h-12 px-4 py-2 border-2 border-dashed border-border rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {selectedFile ? selectedFile.name : "Escolher arquivo"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Aceita arquivos PDF, DOC e DOCX (máx. 10MB)
                    </p>
                  </div>
                </div>
                  
                  {selectedFile && (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {article?.file_path && !selectedFile && (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">Arquivo atual hospedado</span>
                      <span className="text-xs text-muted-foreground">
                        ({article.file_size ? (article.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'Tamanho desconhecido'})
                      </span>
                    </div>
                  )}

                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <strong>Ou</strong> use uma URL externa (compatibilidade com links antigos):
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pdf_url">URL Externa do PDF</Label>
                  <Input
                    id="pdf_url"
                    type="url"
                    value={formData.pdf_url}
                    onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                    placeholder="https://exemplo.com/arquivo.pdf"
                  />
                  <p className="text-sm text-muted-foreground">
                    Apenas se não fizer upload do arquivo acima
                  </p>
                </div>
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
                <Button type="submit" disabled={loading || uploading}>
                  {loading || uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploading ? "Fazendo upload..." : "Salvando..."}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {article ? "Atualizar Publicação" : "Criar Publicação"}
                    </>
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