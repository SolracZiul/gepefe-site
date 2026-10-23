import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Heart, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
    
    // Fetch user display name from profile
    if (user) {
      const fetchDisplayName = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.display_name) {
          setDisplayName(profile.display_name);
        } else {
          setDisplayName(user.email?.split('@')[0] || 'Usuário');
        }
      };
      
      fetchDisplayName();
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-0 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-0 flex flex-col">
      
      
      <main className="w-full flex-1 py-0">
        <div className="w-full">
          <div className="grid gap-6 md:grid-cols-2">
            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tipo de Conta</p>
                  <p className="text-base capitalize">
                    {userRole === 'admin' ? 'Administrador' : 'Membro'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Membro desde</p>
                  <p className="text-base">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesse rapidamente suas funcionalidades favoritas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/favoritos")}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Meus Favoritos
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate("/todos")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Explorar Publicações
                </Button>

                {userRole === 'admin' && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/admin")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Painel Administrativo
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Welcome Message */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">
                  Bem-vindo ao GEPEFE, {displayName}!
                </h3>
                <p className="text-muted-foreground">
                  Explore nosso repositório acadêmico com artigos, textos e pesquisas 
                  em Educação Física e Escola. Use os favoritos para salvar os conteúdos 
                  mais importantes para você.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      
    </div>
  );
}