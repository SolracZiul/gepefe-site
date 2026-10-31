import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArticleList } from "@/components/ArticleList";
import { Plus, User, Heart, Download, History, LogOut } from "lucide-react";

const sample = [
  {
    id: "1",
    title:
      "A EDUCAÇÃO FÍSICA ESCOLAR E AS PRÁTICAS CORPORAIS: UMA ANÁLISE LONGITUDINAL DAS AULAS NA REDE MUNICIPAL",
    authors: ["Silva, J. A.", "Souza, M. R.", "Pereira, L. C. M."],
    abstract:
      "Este estudo analisa as práticas corporais desenvolvidas nas aulas de Educação Física escolar, discutindo possibilidades metodológicas para a rede municipal de ensino.",
    category: "Artigos Completos",
    publish_date: "2025-03-14",
    download_count: 12,
    pdf_url: null,
    tags: [
      "Educação Física Escolar",
      "Inclusão",
      "Jogos",
      "Metodologia",
      "Currículo",
      "Práticas Corporais",
      "Ensino Médio",
    ],
    created_at: "2025-03-14",
    updated_at: "2025-03-14",
  },
  {
    id: "2",
    title: "Brincar e incluir: propostas para o Ensino Fundamental",
    authors: ["GEPEFE Coletivo"],
    abstract:
      "Proposta pedagógica de jogos adaptados para turmas do Ensino Fundamental com foco na participação de todos os estudantes.",
    category: "Textos Acadêmicos",
    publish_date: "2024-11-02",
    download_count: 3,
    pdf_url: "https://example.org/brincar.pdf",
    tags: ["Inclusão", "Jogos"],
    created_at: "2024-11-02",
    updated_at: "2024-11-02",
  },
];

export default function LayoutCheck() {
  return (
    <div className="bg-background">
      <div className="w-full pb-24">
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {["Total", "Artigos", "Notícias", "Dissertações", "Teses", "Pesquisas"].map((label, i) => (
            <Card key={label}>
              <CardHeader className="space-y-0.5 p-3">
                <CardDescription className="text-xs">{label}</CardDescription>
                <CardTitle className="text-xl">{i}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
          <h2 className="text-lg font-semibold sm:text-xl">Conteúdo</h2>
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
            <Button className="w-full justify-center gap-1.5 px-2 text-xs sm:w-auto sm:px-4 sm:text-sm">
              <Plus className="h-4 w-4 shrink-0" />
              <span className="truncate">Nova Publicação</span>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-center gap-1.5 px-2 text-xs sm:w-auto sm:px-4 sm:text-sm"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="truncate">Nova Notícia</span>
            </Button>
          </div>
        </div>

        <ArticleList articles={sample} onEdit={() => {}} onDelete={() => {}} />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse rapidamente suas funcionalidades favoritas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Heart className="h-4 w-4 mr-2" />
              Meus Favoritos
            </Button>
            <Button variant="outline" className="w-full justify-start lg:hidden">
              <History className="h-4 w-4 mr-2" />
              Histórico de Leitura
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Explorar Publicações
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <User className="h-4 w-4 mr-2" />
              Painel Administrativo
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
