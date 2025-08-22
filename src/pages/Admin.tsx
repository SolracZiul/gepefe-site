import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, LogOut, Edit, Trash2 } from "lucide-react";
import { ArticleForm } from "@/components/ArticleForm";
import { ArticleList } from "@/components/ArticleList";

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
  created_at: string;
  updated_at: string;
}

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      await fetchArticles();
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar artigos",
        description: error.message,
      });
    } else {
      setArticles(data || []);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleDelete = async (articleId: string) => {
    if (!confirm("Tem certeza que deseja excluir este artigo?")) {
      return;
    }

    console.log("Tentando excluir artigo:", articleId);
    
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', articleId);

    if (error) {
      console.error("Erro ao excluir artigo:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir artigo",
        description: error.message,
      });
    } else {
      console.log("Artigo excluído com sucesso:", articleId);
      toast({
        title: "Artigo excluído",
        description: "O artigo foi removido com sucesso.",
      });
      await fetchArticles();
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingArticle(null);
    fetchArticles();
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingArticle(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <ArticleForm
        article={editingArticle}
        onSuccess={handleFormSuccess}
        onCancel={handleCancelForm}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie as publicações do GEPEFE</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/")}>
              Ver Site
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Artigos</CardDescription>
              <CardTitle className="text-2xl">{articles.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Artigos Completos</CardDescription>
              <CardTitle className="text-2xl">
                {articles.filter(a => a.category === "Artigos Completos").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pesquisas</CardDescription>
              <CardTitle className="text-2xl">
                {articles.filter(a => a.category === "Pesquisas").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Downloads Totais</CardDescription>
              <CardTitle className="text-2xl">
                {articles.reduce((sum, a) => sum + a.download_count, 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Publicações</h2>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Publicação
          </Button>
        </div>

        {/* Articles List */}
        <ArticleList
          articles={articles}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}