import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { ArticleForm } from "@/components/ArticleForm";
import { ArticleList } from "@/components/ArticleList";
import { NewsForm } from "@/components/NewsForm";

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
  content_type?: string;
  summary?: string;
  content?: string;
  image_url?: string;
  images?: string[];
}

export default function Admin() {
  const [user, setUser] = useState<any>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [contentType, setContentType] = useState<'article' | 'news'>('article');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/auth");
        return;
      }

      // Enforce admin role server-side via has_role RPC
      const { data: isAdmin, error: roleErr } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'admin',
      });

      if (roleErr || !isAdmin) {
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Você não tem permissão para acessar o painel administrativo.",
        });
        navigate("/");
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
        title: "Erro ao carregar conteúdo",
        description: error.message,
      });
    } else {
      setArticles(data || []);
    }
  };


  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setContentType(article.content_type === 'news' ? 'news' : 'article');
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
    setContentType('article');
    fetchArticles();
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingArticle(null);
    setContentType('article');
  };

  const handleCreateNew = (type: 'article' | 'news') => {
    setContentType(type);
    setEditingArticle(null);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (showForm) {
    if (contentType === 'news') {
      return (
        <NewsForm
          news={editingArticle ? {
            id: editingArticle.id,
            title: editingArticle.title,
            summary: editingArticle.summary || '',
            content: editingArticle.content || '',
            authors: editingArticle.authors,
            publish_date: editingArticle.publish_date,
            image_url: editingArticle.image_url,
            images: editingArticle.images || [],
            tags: editingArticle.tags
          } : null}
          onSuccess={handleFormSuccess}
          onCancel={handleCancelForm}
        />
      );
    } else {
      return (
        <ArticleForm
          article={editingArticle}
          onSuccess={handleFormSuccess}
          onCancel={handleCancelForm}
        />
      );
    }
  }

  return (
    <div className="bg-background">
      <div className="w-full pb-24">

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardHeader className="space-y-0.5 p-3">
              <CardDescription className="text-xs">Total</CardDescription>
              <CardTitle className="text-xl">{articles.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="space-y-0.5 p-3">
              <CardDescription className="text-xs">Artigos</CardDescription>
              <CardTitle className="text-xl">
                {articles.filter(a => a.content_type === "article" || !a.content_type).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="space-y-0.5 p-3">
              <CardDescription className="text-xs">Notícias</CardDescription>
              <CardTitle className="text-xl">
                {articles.filter(a => a.content_type === "news").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="space-y-0.5 p-3">
              <CardDescription className="text-xs">Dissertações</CardDescription>
              <CardTitle className="text-xl">
                {articles.filter(a => a.category === "Dissertações").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="space-y-0.5 p-3">
              <CardDescription className="text-xs">Teses</CardDescription>
              <CardTitle className="text-xl">
                {articles.filter(a => a.category === "Teses").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="space-y-0.5 p-3">
              <CardDescription className="text-xs">Pesquisas</CardDescription>
              <CardTitle className="text-xl">
                {articles.filter(a => a.category === "Pesquisas").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
          <h2 className="text-lg font-semibold sm:text-xl">Conteúdo</h2>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
            <Button
              onClick={() => handleCreateNew('article')}
              className="w-full justify-center gap-1.5 px-2 text-xs sm:w-auto sm:px-4 sm:text-sm"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="truncate">Nova Publicação</span>
            </Button>
            <Button
              onClick={() => handleCreateNew('news')}
              variant="outline"
              className="w-full justify-center gap-1.5 px-2 text-xs sm:w-auto sm:px-4 sm:text-sm"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="truncate">Nova Notícia</span>
            </Button>
          </div>
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