import { Article } from "@/components/ArticleCard";

export const mockArticles: Article[] = [
  {
    id: "1",
    title: "A Importância da Educação Física na Formação Integral do Estudante",
    authors: ["Dr. Maria Silva", "Prof. João Santos"],
    abstract: "Este estudo analisa o papel fundamental da Educação Física no desenvolvimento cognitivo, motor e social dos estudantes no ambiente escolar. A pesquisa foi conduzida com 200 alunos do ensino fundamental e apresenta dados significativos sobre os benefícios da prática regular de atividades físicas no contexto educacional.",
    category: "Artigos Completos",
    publishDate: "2024-01-15",
    downloadCount: 245,
    pdfUrl: "/articles/educacao-fisica-formacao-integral.pdf",
    tags: ["Educação Física", "Desenvolvimento Cognitivo", "Ensino Fundamental", "Formação Integral"]
  },
  {
    id: "2",
    title: "Metodologias Ativas no Ensino da Educação Física Escolar",
    authors: ["Prof. Ana Costa", "Dr. Carlos Oliveira", "Profa. Lucia Martins"],
    abstract: "Uma análise comparativa das diferentes metodologias ativas aplicadas ao ensino da Educação Física, incluindo gamificação, aprendizagem baseada em projetos e metodologias colaborativas. O estudo apresenta resultados de aplicação prática em três escolas públicas.",
    category: "Pesquisas",
    publishDate: "2024-02-20",
    downloadCount: 189,
    pdfUrl: "/articles/metodologias-ativas-ef.pdf",
    tags: ["Metodologias Ativas", "Gamificação", "Ensino", "Inovação Pedagógica"]
  },
  {
    id: "3",
    title: "Inclusão na Educação Física: Estratégias Pedagógicas para Estudantes com Deficiência",
    authors: ["Dra. Patricia Rocha", "Prof. Roberto Lima"],
    abstract: "Este texto acadêmico apresenta estratégias pedagógicas eficazes para promover a inclusão de estudantes com diferentes tipos de deficiência nas aulas de Educação Física. Baseado em experiências práticas e fundamentação teórica sólida.",
    category: "Textos Acadêmicos",
    publishDate: "2024-03-10",
    downloadCount: 312,
    pdfUrl: "/articles/inclusao-educacao-fisica.pdf",
    tags: ["Inclusão", "Educação Especial", "Estratégias Pedagógicas", "Acessibilidade"]
  },
  {
    id: "4",
    title: "O Papel do Jogo na Aprendizagem Motora: Uma Perspectiva Construtivista",
    authors: ["Prof. Fernando Dias", "Dra. Mariana Torres"],
    abstract: "Investigação sobre como os jogos podem ser utilizados como ferramenta pedagógica para o desenvolvimento motor na Educação Física escolar, sob a perspectiva da teoria construtivista de aprendizagem.",
    category: "Artigos Completos",
    publishDate: "2024-01-28",
    downloadCount: 198,
    pdfUrl: "/articles/jogo-aprendizagem-motora.pdf",
    tags: ["Aprendizagem Motora", "Construtivismo", "Jogos Pedagógicos", "Desenvolvimento Motor"]
  },
  {
    id: "5",
    title: "Avaliação em Educação Física: Além das Medidas Antropométricas",
    authors: ["Dra. Sandra Mendes", "Prof. Alberto Ferreira"],
    abstract: "Uma reflexão crítica sobre os métodos de avaliação tradicionalmente utilizados na Educação Física escolar e propostas alternativas que consideram aspectos qualitativos do desenvolvimento dos estudantes.",
    category: "Dissertações",
    publishDate: "2024-02-05",
    downloadCount: 156,
    pdfUrl: "/articles/avaliacao-educacao-fisica.pdf",
    tags: ["Avaliação", "Métodos Qualitativos", "Desenvolvimento Estudantil", "Práticas Pedagógicas"]
  },
  {
    id: "6",
    title: "Educação Física e Saúde Mental: Benefícios da Atividade Física Regular",
    authors: ["Dr. Paulo Rodrigues", "Profa. Camila Nascimento"],
    abstract: "Estudo longitudinal que investiga os impactos da prática regular de Educação Física na saúde mental de adolescentes, com foco na redução da ansiedade e melhoria da autoestima.",
    category: "Pesquisas",
    publishDate: "2024-03-22",
    downloadCount: 278,
    pdfUrl: "/articles/ef-saude-mental.pdf",
    tags: ["Saúde Mental", "Adolescentes", "Atividade Física", "Bem-estar", "Autoestima"]
  }
];

export const categories = [
  "Todos",
  "Artigos Completos",
  "Textos Acadêmicos", 
  "Pesquisas",
  "Dissertações"
];