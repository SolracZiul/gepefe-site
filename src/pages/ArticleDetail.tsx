import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, ExternalLink, FileText, Calendar, User, Heart } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@/integrations/supabase/client";
import { useArticlesContext } from "@/contexts/ArticlesContext";
import type { Article } from "@/components/ArticleCard";

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleFavorite, isFavorited } = useFavorites(user?.id || null);
  const { articles, loading } = useArticlesContext();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const article = articles.find((a: Article) => a.id === id);

  const getFileUrl = async () => {
    if (!article) return null;
    
    if (article.file_path) {
      const { data } = supabase.storage
        .from('academic-articles')
        .getPublicUrl(article.file_path);
      return data.publicUrl;
    }
    return article.pdf_url;
  };

  const handleDownload = async () => {
    if (!article) return;
    
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

  const handleOpenExternal = async () => {
    const url = await getFileUrl();
    if (url) {
      window.open(url, '_blank');
    }
  };

  const loadPreview = async () => {
    // Only load preview for uploaded files (file_path), not external URLs (pdf_url only)
    if (!fileUrl && article && article.file_path) {
      setLoadingPreview(true);
      try {
        const url = await getFileUrl();
        setFileUrl(url);
      } catch (error) {
        console.error('Error loading preview:', error);
      } finally {
        setLoadingPreview(false);
      }
    }
  };

  useEffect(() => {
    if (article) {
      loadPreview();
    }
  }, [article]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando artigo...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Artigo não encontrado</h1>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isPDF = article.file_type?.includes('pdf') || article.pdf_url?.includes('.pdf');
  const hasFile = article.file_path || article.pdf_url;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {article.category}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Download className="w-4 h-4 mr-1" />
                  {article.download_count} downloads
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">
                {article.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center">
                  {article.authors.length === 1 && article.authors[0] === "Integrantes do Grupo de Estudos e Pesquisas em Educação Física e Escola" ? (
                    // Criação coletiva do GEPEFE - dois ícones amarelos
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-yellow-500" />
                        <User className="w-4 h-4 text-yellow-500 -ml-1" />
                      </div>
                      <span className="font-medium text-primary">
                        {article.authors[0]}
                      </span>
                    </div>
                  ) : article.authors.some(author => author.includes(" (GEPEFE)")) ? (
                    // Integrantes individuais do GEPEFE - apenas ícone amarelo, sem badge
                    <>
                      <User className="w-4 h-4 mr-1 text-yellow-500" />
                      <span className="font-medium text-primary">
                        {article.authors.map(author => author.replace(" (GEPEFE)", "")).join(", ")}
                      </span>
                    </>
                  ) : (
                    // Autores externos - ícone cinza normal
                    <>
                      <User className="w-4 h-4 mr-1" />
                      {article.authors.join(", ")}
                    </>
                  )}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(article.publish_date).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {user && (
                <Button
                  variant={isFavorited(article.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFavorite(article.id)}
                  className="flex items-center gap-2"
                >
                  <Heart className={`h-4 w-4 ${isFavorited(article.id) ? 'fill-current' : ''}`} />
                  {isFavorited(article.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                </Button>
              )}
              
              {hasFile && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenExternal}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir em nova aba
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownload}
                    className="bg-gradient-primary hover:shadow-glow"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Resumo</h2>
          <p className="text-muted-foreground leading-relaxed">
            {article.abstract}
          </p>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Visualização do Arquivo - só aparece se tiver arquivo carregado */}
        {article.file_path && (
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Visualização do Documento</h2>
            
            <div className="bg-muted/30 rounded-lg overflow-hidden" style={{ height: '70vh', minHeight: '500px' }}>
              {loadingPreview ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando visualização...</p>
                  </div>
                </div>
              ) : fileUrl ? (
                isPDF ? (
                  <iframe
                    src={`${fileUrl}#view=FitH`}
                    className="w-full h-full border-0"
                    title={`Preview: ${article.title}`}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Visualização não disponível</h3>
                    <p className="text-muted-foreground mb-4">
                      Este tipo de arquivo não pode ser visualizado diretamente no navegador.
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Baixar arquivo
                      </Button>
                      <Button variant="outline" onClick={handleOpenExternal}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir externamente
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Arquivo não disponível</h3>
                  <p className="text-muted-foreground">
                    Nenhum arquivo foi encontrado para este artigo.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}