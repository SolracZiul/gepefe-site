import { Button } from "@/components/ui/button";
import { Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface NavigationProps {
  onSearch: (query: string) => void;
  onCategoryFilter: (category: string) => void;
}

export const Navigation = ({ onSearch, onCategoryFilter }: NavigationProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    "Todos",
    "Artigos Completos", 
    "Textos Acadêmicos",
    "Pesquisas",
    "Dissertações"
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="h-8">
              <img 
                src="/lovable-uploads/24fb75f9-0b2a-410a-8f90-d6d3efcf52e4.png" 
                alt="GEPEFE Logo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-lg">GEPEFE</h1>
              <p className="text-xs text-muted-foreground">Repositório Acadêmico</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {categories.map((category) => (
              <Button
                key={category}
                variant="ghost"
                onClick={() => onCategoryFilter(category)}
                className="text-foreground hover:text-primary hover:bg-primary/10"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center space-x-2">
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
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Categories */}
        <div className="md:hidden py-4 overflow-x-auto">
          <div className="flex space-x-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => onCategoryFilter(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};