import React, { useState, useEffect } from "react";
import { Search, Menu, User, Heart, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useSearch } from "@/contexts/SearchContext";

const NavigationComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, isAdmin } = useAuth();
  const [displayName, setDisplayName] = useState<string>("");
  const { searchQuery, setSearchQuery } = useSearch();

  const categories = [
    { name: "Todos", path: "/todos" },
    { name: "Artigos Completos", path: "/artigos-completos" },
    { name: "Textos Acadêmicos", path: "/textos-academicos" },
    { name: "Pesquisas", path: "/pesquisas" },
    { name: "Dissertações", path: "/dissertacoes" },
  ];

  // Fetch user display name when user changes
  useEffect(() => {
    if (user) {
      const fetchDisplayName = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.display_name) {
          // Pegar apenas o primeiro nome
          const firstName = profile.display_name.split(' ')[0];
          setDisplayName(firstName);
        } else {
          setDisplayName(user.email?.split('@')[0] || 'Usuário');
        }
      };
      
      fetchDisplayName();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search query is now handled by context
  };

  console.log("Navigation: Component rendering, location:", location.pathname);
  
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border min-h-[64px]">
      <div className="container mx-auto px-4 min-h-[64px]">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="h-8 flex-shrink-0">
              <img 
                src="/lovable-uploads/24fb75f9-0b2a-410a-8f90-d6d3efcf52e4.png"
                alt="GEPEFE Logo" 
                className="h-8 w-auto object-contain block"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                onLoad={() => console.log("Logo loaded successfully")}
                onError={() => console.log("Logo failed to load")}
              />
            </div>
            <div className="flex-shrink-0">
              <p className="text-xs text-muted-foreground whitespace-nowrap">Repositório Acadêmico</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 ml-8">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={location.pathname === category.path ? "default" : "ghost"}
                size="sm"
                asChild
                className="text-sm"
              >
                <Link to={category.path}>
                  {category.name}
                </Link>
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-sm mr-12"
            >
              <Link to="/sobre">
                Sobre
              </Link>
            </Button>
          </div>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-2">
            {/* Search form */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar publicações..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-56"
                />
              </div>
            </form>

            {/* User actions */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  {/* Favoritos button - only for logged users */}
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="flex items-center gap-2"
                  >
                    <Link to="/favoritos">
                      <Heart className="h-4 w-4" />
                      <span className="hidden sm:inline">Favoritos</span>
                    </Link>
                  </Button>

                   {/* User menu */}
                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <Button variant="outline" size="sm" className="flex items-center gap-2">
                         <User className="h-4 w-4" />
                         <span className="hidden sm:inline">
                           {displayName || 'Usuário'}
                         </span>
                       </Button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to="/profile">
                            <User className="h-4 w-4 mr-2" />
                            Meu Perfil
                          </Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <>
                            <DropdownMenuItem asChild>
                              <Link to="/admin">
                                <User className="h-4 w-4 mr-2" />
                                Painel Admin
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}
                       <DropdownMenuSeparator />
                       <DropdownMenuItem onClick={handleSignOut}>
                         <LogOut className="h-4 w-4 mr-2" />
                         Sair
                       </DropdownMenuItem>
                     </DropdownMenuContent>
                   </DropdownMenu>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4">
                  {/* Mobile search */}
                  <form onSubmit={handleSearch} className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar publicações..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        autoFocus={false}
                        onFocus={(e) => {
                          // Prevent auto-focus on sheet open, only focus when user actually clicks
                          if (document.activeElement !== e.target) {
                            e.target.blur();
                          }
                        }}
                      />
                    </div>
                  </form>

                  {/* Mobile categories */}
                  {categories.map((category) => (
                    <Button
                      key={category.name}
                      variant={location.pathname === category.path ? "default" : "ghost"}
                      asChild
                      className="justify-start"
                    >
                      <Link to={category.path}>
                        {category.name}
                      </Link>
                    </Button>
                  ))}
                  
                  <Button
                    variant="ghost"
                    asChild
                    className="justify-start"
                  >
                    <Link to="/sobre">
                      Sobre
                    </Link>
                  </Button>

                  {user && (
                    <Button
                      variant="ghost"
                      asChild
                      className="justify-start"
                    >
                      <Link to="/favoritos">
                        <Heart className="h-4 w-4 mr-2" />
                        Favoritos
                      </Link>
                    </Button>
                  )}
                   
                   {user ? (
                     <>
                        <Button
                          variant="ghost"
                          asChild
                          className="justify-start"
                        >
                          <Link to="/profile">
                            <User className="h-4 w-4 mr-2" />
                            Meu Perfil
                          </Link>
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            asChild
                            className="justify-start"
                          >
                            <Link to="/admin">
                              <User className="h-4 w-4 mr-2" />
                              Painel Admin
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          onClick={handleSignOut}
                          className="justify-start text-destructive"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sair
                        </Button>
                      </>
                    ) : (
                     <Button
                       variant="ghost"
                       asChild
                       className="justify-start"
                     >
                       <Link to="/auth">
                         <LogIn className="h-4 w-4 mr-2" />
                         Entrar
                       </Link>
                     </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Categories - now handled by sidebar */}
      </div>
    </nav>
  );
};

// Memoize o componente - agora sem props que mudam
export const Navigation = React.memo(NavigationComponent);