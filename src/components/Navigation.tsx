import { Button } from "@/components/ui/button";
import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
interface NavigationProps {
  onSearch: (query: string) => void;
  onCategoryFilter: (category: string) => void;
}
export const Navigation = ({
  onSearch,
  onCategoryFilter
}: NavigationProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const categories = [{
    name: "Todos",
    path: "/"
  }, {
    name: "Artigos Completos",
    path: "/artigos-completos"
  }, {
    name: "Textos Acadêmicos",
    path: "/textos-academicos"
  }, {
    name: "Pesquisas",
    path: "/pesquisas"
  }, {
    name: "Dissertações",
    path: "/dissertacoes"
  }];
  const handleCategoryClick = (category: {
    name: string;
    path: string;
  }) => {
    if (category.name === "Todos") {
      navigate("/");
    } else {
      navigate(category.path);
    }
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };
  return <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8">
              <img src="/lovable-uploads/24fb75f9-0b2a-410a-8f90-d6d3efcf52e4.png" alt="GEPEFE Logo" className="h-8 w-auto object-contain" />
            </div>
            <div>
              
              <p className="text-xs text-muted-foreground">Repositório Acadêmico</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {categories.map(category => <Button key={category.name} variant="ghost" onClick={() => handleCategoryClick(category)} className="text-foreground hover:text-primary hover:bg-primary/10">
                {category.name}
              </Button>)}
          </div>

          {/* Search */}
          <div className="flex items-center space-x-2">
            <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar publicações..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 w-64" />
              </div>
            </form>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Categories */}
        <div className="md:hidden py-4 overflow-x-auto">
          <div className="flex space-x-2">
            {categories.map(category => <Button key={category.name} variant="outline" size="sm" onClick={() => handleCategoryClick(category)} className="whitespace-nowrap">
                {category.name}
              </Button>)}
          </div>
        </div>
      </div>
    </nav>;
};