import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ArticleViewerProps {
  article: {
    id: string;
    title: string;
    abstract: string;
    file_path: string | null;
    file_type: string | null;
    pdf_url: string | null;
    download_count: number;
  };
  isOpen: boolean;
  onClose: () => void;
}

export const ArticleViewer = ({ article, isOpen, onClose }: ArticleViewerProps) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getFileUrl = async () => {
    if (article.file_path) {
      const { data } = supabase.storage
        .from('academic-articles')
        .getPublicUrl(article.file_path);
      return data.publicUrl;
    }
    return article.pdf_url;
  };

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

  const handleOpenExternal = async () => {
    const url = await getFileUrl();
    if (url) {
      window.open(url, '_blank');
    }
  };

  const loadPreview = async () => {
    if (!fileUrl && (article.file_path || article.pdf_url)) {
      setLoading(true);
      try {
        const url = await getFileUrl();
        setFileUrl(url);
      } catch (error) {
        console.error('Error loading preview:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Load preview when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadPreview();
    }
  }, [isOpen]);

  const isPDF = article.file_type?.includes('pdf') || article.pdf_url?.includes('.pdf');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] w-[95vw] sm:max-w-[95vw] sm:w-[95vw] sm:h-[80vh] sm:max-h-[80vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="pb-2 sm:pb-4 px-2 sm:px-6 pt-2 sm:pt-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <DialogTitle className="text-sm sm:text-lg leading-tight sm:pr-8">{article.title}</DialogTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenExternal}
                className="text-xs sm:text-sm"
              >
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Abrir em nova aba</span>
                <span className="sm:hidden">Nova aba</span>
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                className="bg-gradient-primary hover:shadow-glow text-xs sm:text-sm"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-2 sm:px-6 pb-2 sm:pb-6">

          <div className="bg-muted/30 rounded-lg overflow-hidden h-full">
            {loading ? (
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
              <div className="flex flex-col items-center justify-center h-full p-4 sm:p-8 text-center">
                <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Visualização não disponível</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Este tipo de arquivo não pode ser visualizado diretamente no navegador.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button onClick={handleDownload} size="sm" className="text-xs sm:text-sm">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Baixar arquivo
                  </Button>
                  <Button variant="outline" onClick={handleOpenExternal} size="sm" className="text-xs sm:text-sm">
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Abrir externamente
                  </Button>
                </div>
              </div>
            )
           ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 sm:p-8 text-center">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-2">Arquivo não disponível</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Nenhum arquivo foi encontrado para este artigo.
              </p>
            </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};