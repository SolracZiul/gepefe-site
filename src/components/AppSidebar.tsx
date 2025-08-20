import { useState } from "react";
import { 
  BookOpen, 
  FileText, 
  Search, 
  GraduationCap, 
  Grid3X3,
  Home
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const categories = [
  { 
    name: "Início", 
    path: "/", 
    icon: Home,
    description: "Página inicial" 
  },
  { 
    name: "Todos", 
    path: "/todos", 
    icon: Grid3X3,
    description: "Todas as publicações" 
  },
  { 
    name: "Artigos Completos", 
    path: "/artigos-completos", 
    icon: BookOpen,
    description: "Artigos acadêmicos completos" 
  },
  { 
    name: "Textos Acadêmicos", 
    path: "/textos-academicos", 
    icon: FileText,
    description: "Textos e resumos acadêmicos" 
  },
  { 
    name: "Pesquisas", 
    path: "/pesquisas", 
    icon: Search,
    description: "Trabalhos de pesquisa" 
  },
  { 
    name: "Dissertações", 
    path: "/dissertacoes", 
    icon: GraduationCap,
    description: "Dissertações e teses" 
  },
];

interface AppSidebarProps {
  onCategoryFilter?: (category: string) => void;
}

export function AppSidebar({ onCategoryFilter }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath === path) return true;
    return false;
  };

  const isExpanded = categories.some((category) => isActive(category.path));

  const getNavClassName = (path: string) => {
    const active = isActive(path);
    return active 
      ? "bg-primary/10 text-primary font-semibold border-r-2 border-primary" 
      : "text-foreground hover:bg-muted/80 hover:text-primary transition-colors";
  };

  const handleCategoryClick = (path: string, categoryName: string) => {
    // Call the category filter callback if provided
    if (onCategoryFilter && categoryName !== "Início") {
      onCategoryFilter(categoryName);
    }
  };

  return (
    <Sidebar
      className={`${state === "collapsed" ? "w-16" : "w-64"} border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`}
      collapsible="icon"
    >
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-sm font-medium text-muted-foreground">
            {state !== "collapsed" && "Categorias"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-1">
              {categories.map((category) => (
                <SidebarMenuItem key={category.name}>
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink 
                      to={category.path} 
                      end
                      className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-200 ${getNavClassName(category.path)}`}
                      onClick={() => handleCategoryClick(category.path, category.name)}
                    >
                      <category.icon className={`h-4 w-4 ${state === "collapsed" ? "" : "mr-3"} flex-shrink-0`} />
                      {state !== "collapsed" && (
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{category.name}</span>
                          {category.description && (
                            <span className="text-xs text-muted-foreground mt-0.5">
                              {category.description}
                            </span>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* About Section when not collapsed */}
        {state !== "collapsed" && (
          <SidebarGroup className="mt-8">
            <SidebarGroupLabel className="px-4 text-sm font-medium text-muted-foreground">
              Sobre o GEPEFE
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-2">
              <div className="px-4 py-2">
                <NavLink 
                  to="/sobre"
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${getNavClassName("/sobre")}`}
                >
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span>Sobre o Grupo</span>
                  </div>
                </NavLink>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}