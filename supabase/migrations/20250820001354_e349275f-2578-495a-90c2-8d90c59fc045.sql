-- Create articles table for publications
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  abstract TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Artigos Completos', 'Textos Acadêmicos', 'Pesquisas', 'Dissertações')),
  publish_date DATE NOT NULL DEFAULT CURRENT_DATE,
  download_count INTEGER NOT NULL DEFAULT 0,
  pdf_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Create policies for articles - anyone can read, only authenticated users can modify
CREATE POLICY "Anyone can view articles" 
ON public.articles 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create articles" 
ON public.articles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update articles" 
ON public.articles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can delete articles" 
ON public.articles 
FOR DELETE 
TO authenticated
USING (auth.uid() = created_by);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add trigger for profiles timestamps
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert the existing mock data
INSERT INTO public.articles (title, authors, abstract, category, publish_date, download_count, pdf_url, tags) VALUES
('A Importância da Educação Física na Formação Integral do Estudante', 
 ARRAY['Dr. Maria Silva', 'Prof. João Santos'], 
 'Este estudo analisa o papel fundamental da Educação Física no desenvolvimento cognitivo, motor e social dos estudantes no ambiente escolar. A pesquisa foi conduzida com 200 alunos do ensino fundamental e apresenta dados significativos sobre os benefícios da prática regular de atividades físicas no contexto educacional.',
 'Artigos Completos',
 '2024-01-15',
 245,
 '/articles/educacao-fisica-formacao-integral.pdf',
 ARRAY['Educação Física', 'Desenvolvimento Cognitivo', 'Ensino Fundamental', 'Formação Integral']),

('Metodologias Ativas no Ensino da Educação Física Escolar',
 ARRAY['Prof. Ana Costa', 'Dr. Carlos Oliveira', 'Profa. Lucia Martins'],
 'Uma análise comparativa das diferentes metodologias ativas aplicadas ao ensino da Educação Física, incluindo gamificação, aprendizagem baseada em projetos e metodologias colaborativas. O estudo apresenta resultados de aplicação prática em três escolas públicas.',
 'Pesquisas',
 '2024-02-20',
 189,
 '/articles/metodologias-ativas-ef.pdf',
 ARRAY['Metodologias Ativas', 'Gamificação', 'Ensino', 'Inovação Pedagógica']),

('Inclusão na Educação Física: Estratégias Pedagógicas para Estudantes com Deficiência',
 ARRAY['Dra. Patricia Rocha', 'Prof. Roberto Lima'],
 'Este texto acadêmico apresenta estratégias pedagógicas eficazes para promover a inclusão de estudantes com diferentes tipos de deficiência nas aulas de Educação Física. Baseado em experiências práticas e fundamentação teórica sólida.',
 'Textos Acadêmicos',
 '2024-03-10',
 312,
 '/articles/inclusao-educacao-fisica.pdf',
 ARRAY['Inclusão', 'Educação Especial', 'Estratégias Pedagógicas', 'Acessibilidade']),

('O Papel do Jogo na Aprendizagem Motora: Uma Perspectiva Construtivista',
 ARRAY['Prof. Fernando Dias', 'Dra. Mariana Torres'],
 'Investigação sobre como os jogos podem ser utilizados como ferramenta pedagógica para o desenvolvimento motor na Educação Física escolar, sob a perspectiva da teoria construtivista de aprendizagem.',
 'Artigos Completos',
 '2024-01-28',
 198,
 '/articles/jogo-aprendizagem-motora.pdf',
 ARRAY['Aprendizagem Motora', 'Construtivismo', 'Jogos Pedagógicos', 'Desenvolvimento Motor']),

('Avaliação em Educação Física: Além das Medidas Antropométricas',
 ARRAY['Dra. Sandra Mendes', 'Prof. Alberto Ferreira'],
 'Uma reflexão crítica sobre os métodos de avaliação tradicionalmente utilizados na Educação Física escolar e propostas alternativas que consideram aspectos qualitativos do desenvolvimento dos estudantes.',
 'Dissertações',
 '2024-02-05',
 156,
 '/articles/avaliacao-educacao-fisica.pdf',
 ARRAY['Avaliação', 'Métodos Qualitativos', 'Desenvolvimento Estudantil', 'Práticas Pedagógicas']),

('Educação Física e Saúde Mental: Benefícios da Atividade Física Regular',
 ARRAY['Dr. Paulo Rodrigues', 'Profa. Camila Nascimento'],
 'Estudo longitudinal que investiga os impactos da prática regular de Educação Física na saúde mental de adolescentes, com foco na redução da ansiedade e melhoria da autoestima.',
 'Pesquisas',
 '2024-03-22',
 278,
 '/articles/ef-saude-mental.pdf',
 ARRAY['Saúde Mental', 'Adolescentes', 'Atividade Física', 'Bem-estar', 'Autoestima']);