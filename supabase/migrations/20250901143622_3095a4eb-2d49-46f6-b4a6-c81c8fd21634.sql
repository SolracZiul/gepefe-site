-- Inserir notícia tutorial sobre como fazer publicações
INSERT INTO public.articles (
  title,
  authors,
  abstract,
  category,
  content_type,
  publish_date,
  tags,
  summary,
  content,
  created_by
) VALUES (
  'Como Publicar Notícias no Portal GEPEFE',
  ARRAY['Administração GEPEFE'],
  'Guia completo para administradores sobre como utilizar o sistema de publicação de notícias do portal GEPEFE.',
  'Tutorial',
  'news',
  CURRENT_DATE,
  ARRAY['tutorial', 'administração', 'publicação', 'notícias'],
  'Aprenda passo a passo como criar e publicar notícias no portal do GEPEFE. Este guia abrange desde o acesso ao painel administrativo até a publicação final.',
  '## Como Acessar o Painel Administrativo

Para começar a publicar notícias, você precisa:

1. **Fazer login** no sistema com suas credenciais de administrador
2. **Acessar o painel administrativo** através do botão "Admin" no menu de navegação
3. **Verificar suas permissões** - apenas usuários com perfil de administrador podem publicar conteúdo

## Criando uma Nova Notícia

No painel administrativo, siga estes passos:

### 1. Iniciar Nova Publicação
- Clique no botão **"Nova Notícia"** localizado no canto superior direito
- Você será direcionado para o formulário de criação

### 2. Preenchimento dos Campos Obrigatórios

**Título**: Escreva um título claro e atrativo que resuma o conteúdo da notícia

**Autores**: 
- Para notícias institucionais, marque a opção **"Criação do GEPEFE"**
- Para notícias de membros individuais, marque **"Integrante do GEPEFE"** e informe o nome
- Para colaboradores externos, deixe ambas opções desmarcadas e digite os nomes

**Resumo**: Escreva um resumo conciso de 2-3 frases que capture os pontos principais

**Conteúdo**: 
- Use a formatação markdown para estruturar o texto
- **Negrito**: `**texto em negrito**`
- *Itálico*: `*texto em itálico*`
- Títulos: `## Título da Seção`

**Data de Publicação**: Selecione a data de publicação (padrão é a data atual)

**Tags**: Adicione palavras-chave separadas por vírgula para facilitar a busca

### 3. Adicionando Imagens

**Imagem Principal**: Upload de uma imagem que será exibida como destaque

**Galeria de Imagens**: 
- Adicione múltiplas imagens relacionadas à notícia
- As imagens aparecerão em formato de carrossel na página da notícia
- Formatos aceitos: JPG, PNG, WebP
- Tamanho recomendado: máximo 2MB por imagem

## Formatação do Conteúdo

O editor suporta markdown básico:

- `## Título` para seções principais
- `**negrito**` para destacar informações importantes  
- `*itálico*` para ênfase
- Quebras de linha duplas para novos parágrafos

## Publicação e Revisão

1. **Revisar**: Confira todos os campos antes de publicar
2. **Salvar**: Clique em "Criar Notícia" para publicar
3. **Verificar**: A notícia aparecerá imediatamente no portal

## Editando Notícias Existentes

- No painel administrativo, localize a notícia na lista
- Clique no ícone de **editar** (lápis)
- Faça as alterações necessárias
- Clique em "Atualizar Notícia" para salvar

## Dicas Importantes

- **Qualidade das imagens**: Use imagens de alta resolução e relacionadas ao conteúdo
- **Títulos atrativos**: Crie títulos que despertem interesse do leitor
- **Conteúdo estruturado**: Use títulos de seção para organizar textos longos
- **Tags relevantes**: Escolha palavras-chave que facilitem a descoberta da notícia
- **Revisão final**: Sempre revise ortografia e formatação antes de publicar

## Suporte

Em caso de dúvidas ou problemas técnicos, entre em contato com a administração do portal.',
  'afc858b9-f89e-4052-8923-e6c25f7ec676'
);