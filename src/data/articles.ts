import { Article } from "@/components/ArticleCard";

export const mockArticles: Article[] = [
  {
    id: "1",
    title: "A Importância da Educação Física na Formação Integral do Estudante",
    authors: ["Dr. Maria Silva", "Prof. João Santos"],
    abstract: "Este estudo analisa o papel fundamental da Educação Física no desenvolvimento cognitivo, motor e social dos estudantes no ambiente escolar. A pesquisa foi conduzida com 200 alunos do ensino fundamental e apresenta dados significativos sobre os benefícios da prática regular de atividades físicas no contexto educacional.",
    category: "Artigos Completos",
    publish_date: "2024-01-15",
    download_count: 245,
    pdf_url: "/articles/educacao-fisica-formacao-integral.pdf",
    tags: ["Educação Física", "Desenvolvimento Cognitivo", "Ensino Fundamental", "Formação Integral"]
  },
  {
    id: "2",
    title: "Metodologias Ativas no Ensino da Educação Física Escolar",
    authors: ["Prof. Ana Costa", "Dr. Carlos Oliveira", "Profa. Lucia Martins"],
    abstract: "Uma análise comparativa das diferentes metodologias ativas aplicadas ao ensino da Educação Física, incluindo gamificação, aprendizagem baseada em projetos e metodologias colaborativas. O estudo apresenta resultados de aplicação prática em três escolas públicas.",
    category: "Pesquisas",
    publish_date: "2024-02-20",
    download_count: 189,
    pdf_url: "/articles/metodologias-ativas-ef.pdf",
    tags: ["Metodologias Ativas", "Gamificação", "Ensino", "Inovação Pedagógica"]
  },
  {
    id: "3",
    title: "Inclusão na Educação Física: Estratégias Pedagógicas para Estudantes com Deficiência",
    authors: ["Dra. Patricia Rocha", "Prof. Roberto Lima"],
    abstract: "Este texto acadêmico apresenta estratégias pedagógicas eficazes para promover a inclusão de estudantes com diferentes tipos de deficiência nas aulas de Educação Física. Baseado em experiências práticas e fundamentação teórica sólida.",
    category: "Textos Acadêmicos",
    publish_date: "2024-03-10",
    download_count: 312,
    pdf_url: "/articles/inclusao-educacao-fisica.pdf",
    tags: ["Inclusão", "Educação Especial", "Estratégias Pedagógicas", "Acessibilidade"]
  },
  {
    id: "4",
    title: "O Papel do Jogo na Aprendizagem Motora: Uma Perspectiva Construtivista",
    authors: ["Prof. Fernando Dias", "Dra. Mariana Torres"],
    abstract: "Investigação sobre como os jogos podem ser utilizados como ferramenta pedagógica para o desenvolvimento motor na Educação Física escolar, sob a perspectiva da teoria construtivista de aprendizagem.",
    category: "Artigos Completos",
    publish_date: "2024-01-28",
    download_count: 198,
    pdf_url: "/articles/jogo-aprendizagem-motora.pdf",
    tags: ["Aprendizagem Motora", "Construtivismo", "Jogos Pedagógicos", "Desenvolvimento Motor"]
  },
  {
    id: "5",
    title: "Avaliação em Educação Física: Além das Medidas Antropométricas",
    authors: ["Dra. Sandra Mendes", "Prof. Alberto Ferreira"],
    abstract: "Uma reflexão crítica sobre os métodos de avaliação tradicionalmente utilizados na Educação Física escolar e propostas alternativas que consideram aspectos qualitativos do desenvolvimento dos estudantes.",
    category: "Dissertações",
    publish_date: "2024-02-05",
    download_count: 156,
    pdf_url: "/articles/avaliacao-educacao-fisica.pdf",
    tags: ["Avaliação", "Métodos Qualitativos", "Desenvolvimento Estudantil", "Práticas Pedagógicas"]
  },
  {
    id: "6",
    title: "Educação Física e Saúde Mental: Benefícios da Atividade Física Regular",
    authors: ["Dr. Paulo Rodrigues", "Profa. Camila Nascimento"],
    abstract: "Estudo longitudinal que investiga os impactos da prática regular de Educação Física na saúde mental de adolescentes, com foco na redução da ansiedade e melhoria da autoestima.",
    category: "Pesquisas",
    publish_date: "2024-03-22",
    download_count: 278,
    pdf_url: "/articles/ef-saude-mental.pdf",
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