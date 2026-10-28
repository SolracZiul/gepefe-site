import { useState, useEffect } from "react";
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { downloadDocument } from '@/lib/downloads';
import { useToast } from '@/hooks/use-toast';
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
    [key: string]: any;
  };
  isOpen: boolean;
  onClose: () => void;
}

export const ArticleViewer = ({ article, isOpen, onClose }: ArticleViewerProps) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getFileUrl = (): string | null => {
    if (article.file_path) {
      if (article.file_path.startsWith('http://') || article.file_path.startsWith('https://')) {
        return article.file_path;
      }
      const { data } = supabase.storage
        .from('academic-articles')
        .getPublicUrl(article.file_path);
      
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    }
    return article.pdf_url || null;
  };

  const getPreviewUrl = (url: string): string => {
    // O Google Docs Viewer renderiza PDFs mesmo quando o navegador do sistema
    // trataria a resposta do Storage como um download.
    const parsedUrl = new URL(url, window.location.href);
    const absoluteUrl = parsedUrl.toString();
    const pathname = parsedUrl.pathname;
    const isPdf = article.file_type?.toLowerCase().includes('pdf') || pathname.toLowerCase().endsWith('.pdf');
    const isRemoteUrl = parsedUrl.origin !== window.location.origin;

    if (Capacitor.isNativePlatform() && isPdf && isRemoteUrl) {
      return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(absoluteUrl)}`;
    }

    return absoluteUrl;
  };

  const handleOpenExternal = async () => {
    const url = getFileUrl();
    if (!url) {
      toast({ title: 'Link do documento não encontrado', variant: 'destructive' });
      return;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        await Browser.open({ url: getPreviewUrl(url) });
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error opening external URL:', error);
      toast({ title: 'Não foi possível abrir o documento', variant: 'destructive' });
    }
  };

  const handleDownload = async () => {
    try {
      const url = getFileUrl();
      if (!url) throw new Error('URL inválida');

      if (Capacitor.isNativePlatform()) {
        await Browser.open({ url });
      } else {
        await downloadDocument(article as any);
      }

      if (article.file_path) {
        await supabase
          .from('articles')
          .update({ download_count: (article.download_count || 0) + 1 })
          .eq('id', article.id);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({ title: 'Não foi possível baixar o documento', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (isOpen) {
      const url = getFileUrl();
      setFileUrl(url);
    }
  }, [isOpen, article.id]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="repository flex h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] w-[calc(100vw-1rem)] max-w-6xl flex-col overflow-hidden p-0 sm:w-[95vw]">
        <DialogHeader className="flex-shrink-0 pl-3 pr-12 pt-3 pb-2 sm:pl-6 sm:pr-14 sm:pt-5 sm:pb-3 border-b">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <DialogTitle className="min-w-0 flex-1 text-sm leading-tight break-words sm:text-lg font-bold">{article.title}</DialogTitle>
            <div className="flex flex-nowrap items-center justify-end gap-2 sm:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenExternal}
                className="shrink-0 whitespace-nowrap text-xs sm:text-sm"
              >
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Abrir no navegador</span>
                <span className="sm:hidden">Abrir</span>
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                className="shrink-0 whitespace-nowrap text-xs sm:text-sm"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2 pb-4 pt-4 sm:px-6 sm:pb-6">
          <div className="bg-muted/30 flex flex-col items-center justify-center rounded-lg p-4 text-center sm:p-6">
            <FileText className="w-16 h-16 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              {article.abstract || "Clique no botão abaixo para visualizar ou descarregar o documento completo no seu dispositivo."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button onClick={handleOpenExternal} className="text-sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Visualizar Documento
              </Button>
              <Button variant="outline" onClick={handleDownload} className="text-sm">
                <Download className="w-4 h-4 mr-2" />
                Baixar Arquivo
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArticleViewer;
