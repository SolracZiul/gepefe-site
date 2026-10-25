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
      // Se já for uma URL completa
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

  const handleOpenExternal = async () => {
    const url = getFileUrl();
    if (!url) {
      toast({ title: 'Link do documento não encontrado', variant: 'destructive' });
      return;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        await Browser.open({ url });
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

  const isPDF = article.file_type?.includes('pdf') || article.pdf_url?.toLowerCase().includes('.pdf') || article.file_path?.toLowerCase().endsWith('.pdf');
  const isExternalLink = !!article.pdf_url && !article.file_path;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="repository max-w-6xl max-h-[90vh] w-[95vw] h-[95vh] sm:max-w-[95vw] sm:w-[95vw] sm:h-[90vh] sm:max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pl-3 pr-12 pt-3 pb-2 sm:pl-6 sm:pr-14 sm:pt-5 sm:pb-3 border-b">
          <DialogTitle className="text-sm leading-tight break-words sm:text-lg font-bold">{article.title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-2 sm:px-6 pb-2 sm:pb-6 mt-4">
          <div className="bg-muted/30 rounded-lg overflow-hidden h-full flex flex-col items-center justify-center p-6 text-center">
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
