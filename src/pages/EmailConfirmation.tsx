import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EmailConfirmation() {
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string>("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Check if user is already logged in (for OAuth redirects)
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // User is already authenticated (OAuth flow)
          setConfirmed(true);
          toast({
            title: "Login realizado!",
            description: "Você foi autenticado com sucesso.",
          });
          
          // Fetch user profile to check role and redirect accordingly
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();
          
          setTimeout(() => {
            if (profile?.role === 'admin') {
              navigate("/admin");
            } else {
              navigate("/");
            }
          }, 2000);
          return;
        }

        // Check for email confirmation parameters
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');
        
        // Handle OAuth tokens
        if (access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });
          
          if (error) {
            throw error;
          }
          
          if (data.user) {
            setConfirmed(true);
            toast({
              title: "Login realizado!",
              description: "Você foi autenticado com sucesso.",
            });
            
            // Fetch user profile to check role and redirect accordingly
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('user_id', data.user.id)
              .single();
            
            setTimeout(() => {
              if (profile?.role === 'admin') {
                navigate("/admin");
              } else {
                navigate("/");
              }
            }, 2000);
          }
          return;
        }
        
        // Handle email confirmation tokens
        if (token_hash && type) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any
          });

          if (error) {
            throw error;
          }

          if (data.user) {
            setConfirmed(true);
            toast({
              title: "Email confirmado!",
              description: "Sua conta foi verificada com sucesso.",
            });
            
            // Fetch user profile to check role and redirect accordingly
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('user_id', data.user.id)
              .single();
            
            setTimeout(() => {
              if (profile?.role === 'admin') {
                navigate("/admin");
              } else {
                navigate("/");
              }
            }, 2000);
          }
          return;
        }
        
        // If no valid parameters found, redirect to home
        navigate("/");
        
      } catch (error: any) {
        console.error("Error confirming email:", error);
        setError(error.message || "Erro ao processar confirmação");
        toast({
          variant: "destructive",
          title: "Erro na confirmação",
          description: error.message || "Não foi possível processar a confirmação.",
        });
      } finally {
        setLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Confirmação de Email</CardTitle>
          <CardDescription>
            Verificando sua confirmação de email...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {loading ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Confirmando seu email...</p>
            </div>
          ) : confirmed ? (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-green-700">
                  Email confirmado com sucesso!
                </h3>
                <p className="text-muted-foreground">
                  Redirecionando para seu perfil...
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-red-700">
                  Erro na confirmação
                </h3>
                <p className="text-muted-foreground text-sm">
                  {error}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/auth")}
                >
                  Tentar novamente
                </Button>
                <Button onClick={() => navigate("/")}>
                  Ir para início
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}