import { useState } from "react";
import { Search, Menu, User, Heart, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface NavigationProps {
  onSearch: (query: string) => void;
  onCategoryFilter: (category: string) => void;
}

export const Navigation = ({ onSearch, onCategoryFilter }: NavigationProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  const categories = [
    { name: "Todos", path: "/todos" },
    { name: "Artigos Completos", path: "/artigos-completos" },
    { name: "Textos Acadêmicos", path: "/textos-academicos" },
    { name: "Pesquisas", path: "/pesquisas" },
    { name: "Dissertações", path: "/dissertacoes" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleCategoryClick = (path: string) => {
    navigate(path);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8">
              <img 
                src="/lovable-uploads/24fb75f9-0b2a-410a-8f90-d6d3efcf52e4.png" 
                alt="GEPEFE Logo" 
                className="h-8 w-auto object-contain" 
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Repositório Acadêmico</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={location.pathname === category.path ? "default" : "ghost"}
                onClick={() => handleCategoryClick(category.path)}
                className="text-foreground hover:text-primary hover:bg-primary/10"
              >
                {category.name}
              </Button>
            ))}
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
                  className="pl-10 w-64"
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
                    onClick={() => navigate("/favoritos")}
                    className="flex items-center gap-2"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="hidden sm:inline">Favoritos</span>
                  </Button>

                  {/* User menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {user.email?.split('@')[0] || 'Usuário'}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {isAdmin && (
                        <>
                          <DropdownMenuItem onClick={() => navigate("/admin")}>
                            <User className="h-4 w-4 mr-2" />
                            Painel Admin
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
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
                      />
                    </div>
                  </form>

                  {/* Mobile categories */}
                  {categories.map((category) => (
                    <Button
                      key={category.name}
                      variant={location.pathname === category.path ? "default" : "ghost"}
                      onClick={() => handleCategoryClick(category.path)}
                      className="justify-start"
                    >
                      {category.name}
                    </Button>
                  ))}
                  
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/sobre")}
                    className="justify-start"
                  >
                    Sobre
                  </Button>

                  {user && (
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/favoritos")}
                      className="justify-start"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Favoritos
                    </Button>
                  )}
                  
                  {user ? (
                    <>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          onClick={() => navigate("/admin")}
                          className="justify-start"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Painel Admin
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
                      onClick={() => navigate("/auth")}
                      className="justify-start"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Entrar
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Categories */}
        <div className="md:hidden py-4 overflow-x-auto">
          <div className="flex space-x-2">
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={location.pathname === category.path ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryClick(category.path)}
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};