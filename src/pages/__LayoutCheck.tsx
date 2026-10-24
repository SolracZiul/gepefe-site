import { ArticleList } from "@/components/ArticleList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const sample = [
  {
    id: "1",
    title:
      "Ressignificação das práticas corporais na educação física escolar: relatos de experiência de um coletivo de pesquisa",
    authors: [
      "Maria Aparecida Fernandes da Silva",
      "João Batista dos Santos Oliveira",
      "Ana Beatriz Nogueira Carvalho",
      "Carlos Eduardo Moreira Lima",
    ],
    abstract:
      "A partir de um processo de ressignificação das aulas de educação física, este estudo descreve vivências desenvolvidas em escolas públicas da rede municipal, discutindo inclusão, jogo e cultura corporal.",
    category: "Artigos Completos",
    publish_date: "2024-05-12",
    download_count: 1284,
    pdf_url: "https://example.com/documento.pdf",
    tags: [
      "Educação Física Escolar",
      "Inclusão",
      "Jogo",
      "Cultura Corporal",
      "Relato de Experiência",
      "Rede Municipal de Ensino",
    ],
    created_at: "2024-05-12",
    updated_at: "2024-05-12",
  },
  {
    id: "2",
    title: "Políticas públicas e corpo: um estudo bibliográfico",
    authors: ["Pedro Henrique Vasconcelos"],
    abstract:
      "Levantamento bibliográfico sobre políticas públicas voltadas à prática corporal e ao lazer na infância e na adolescência.",
    category: "Dissertações",
    publish_date: "2023-11-02",
    download_count: 42,
    pdf_url: null,
    tags: ["Políticas Públicas", "Infância"],
    created_at: "2023-11-02",
    updated_at: "2023-11-02",
  },
];

const labels = ["Total", "Artigos", "Notícias", "Dissertações", "Teses", "Pesquisas"];

export default function LayoutCheck() {
  return (
    <div className="bg-background">
      <div className="w-full pb-24">
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {labels.map((label) => (
            <Card key={label}>
              <CardHeader className="space-y-0.5 p-3">
                <CardDescription className="text-xs">{label}</CardDescription>
                <CardTitle className="text-xl">12</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
        <ArticleList articles={sample} onEdit={() => {}} onDelete={() => {}} />
      </div>
    </div>
  );
}
