import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, LockKeyholeOpen, Mail, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { privacyContact, privacyEffectiveDate } from '@/lib/repository-navigation';

const sections = [
  { id: 'introducao', label: 'Introdução' },
  { id: 'recolha-e-uso', label: '1. Recolha e Uso de Informações' },
  { id: 'partilha', label: '2. Partilha de Dados' },
  { id: 'seguranca', label: '3. Segurança das Informações' },
  { id: 'contacto', label: '4. Contacto e Suporte' },
];

const collected = [
  {
    title: 'Dados de conta',
    text: 'Email, nome e fotografia de perfil quando a entrada é feita com a conta Google. Servem apenas para identificar a sua sessão no aplicativo.',
  },
  {
    title: 'Dados de leitura no dispositivo',
    text: 'Publicações guardadas como favoritas, histórico de leitura e preferência de tema. Ficam guardadas apenas no browser ou no aplicativo que está a usar e não servem para avaliar o seu comportamento.',
  },
  {
    title: 'Dados de publicação',
    text: 'Quando envia um documento para o acervo, guardamos o ficheiro e os dados bibliográficos que indica (título, autores, resumo, ano) para que a publicação possa ser consultada.',
  },
];

export default function Privacidade() {
  return (
    <main className="pb-6">
      <header className="border-b border-border pb-8">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Documentos institucionais
        </p>
        <h1 className="text-2xl font-semibold sm:text-3xl">Política de Privacidade - GEPEFE</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          O compromisso do Grupo de Estudos e Pesquisas em Educação Física e Escola (GEPEFE) com a
          privacidade de quem consulta e publica no repositório.
        </p>
        <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          Data de vigência: {privacyEffectiveDate}
        </p>
      </header>

      <div className="grid gap-x-12 gap-y-10 pt-8 lg:grid-cols-[minmax(0,72ch)_minmax(0,1fr)]">
        <div className="min-w-0">
          <section id="introducao" className="scroll-mt-40">
            <h2 className="mb-4 text-xl font-semibold">Introdução</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              O GEPEFE gere um repositório académico de acesso aberto. Esta política explica, em
              linguagem simples, que informações são tratadas quando usa o aplicativo e o site, para
              que servem e como são protegidas.
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              A consulta do acervo é livre e pode ser feita sem criar conta. O registo só é
              necessário para funcionalidades pessoais, como guardar publicações favoritas, manter o
              histórico de leitura ou enviar documentos.
            </p>
          </section>

          <section id="recolha-e-uso" className="scroll-mt-40 border-t border-border py-8">
            <h2 className="mb-4 text-xl font-semibold">1. Recolha e Uso de Informações</h2>
            <p className="rounded-lg border-l-2 border-primary bg-card px-5 py-4 text-sm font-medium leading-6">
              O aplicativo não recolhe dados pessoais sensíveis para o seu funcionamento básico. Não
              pedimos nem guardamos dados de saúde, biometria, origem étnica, religião, orientação
              sexual, opiniões políticas ou dados de localização.
            </p>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Recolhemos apenas o mínimo necessário para que o aplicativo funcione:
            </p>
            <ul className="mt-4 space-y-4">
              {collected.map(item => (
                <li key={item.title} className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Estas informações são usadas para permitir a entrada no aplicativo, manter as suas
              preferências de leitura, apresentar as publicações do acervo e responder a pedidos de
              suporte. Não são usadas para publicidade nem para construir perfis de comportamento.
            </p>
          </section>

          <section id="partilha" className="scroll-mt-40 border-t border-border py-8">
            <h2 className="mb-4 text-xl font-semibold">2. Partilha de Dados</h2>
            <p className="rounded-lg border-l-2 border-primary bg-card px-5 py-4 text-sm font-medium leading-6">
              Os seus dados não são partilhados com terceiros. Não são vendidos, arrendados nem
              trocados com outras organizações, e não são usados para campanhas publicitárias.
            </p>
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Duas situações merecem nota clara, porque fazem parte do próprio serviço:
            </p>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                <Users className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <span>
                  Quem usa o acesso com a conta Google aceita que o Google confirme essa identidade
                  no momento do login, tal como descrito na política de privacidade do próprio
                  Google.
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <span>
                  Os dados bibliográficos das publicações enviadas ao acervo, incluindo os nomes dos
                  autores, são de acesso aberto por natureza e ficam visíveis a quem consulta o
                  repositório.
                </span>
              </li>
            </ul>
          </section>

          <section id="seguranca" className="scroll-mt-40 border-t border-border py-8">
            <h2 className="mb-4 text-xl font-semibold">3. Segurança das Informações</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Adotamos medidas técnicas e organizativas para proteger a informação guardada: o acesso
              à gestão do repositório é limitado às contas autorizadas pela coordenação do grupo, a
              área administrativa distingue as permissões de cada utilizador, e as palavras-passe não
              são guardadas nem apresentadas em texto legível.
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              As preferências pessoais de leitura ficam apenas no dispositivo que está a usar. Quem
              partilhar um computador ou um telemóvel pode sair da conta para que essas informações
              deixem de estar associadas ao seu perfil nesse aparelho.
            </p>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Nenhuma transmissão pela internet é totalmente segura. Se suspeitar que a sua conta foi
              usada por outra pessoa, altere a palavra-passe e avise-nos pelo canal de contacto
              indicado abaixo.
            </p>
          </section>

          <section id="contacto" className="scroll-mt-40 border-t border-border py-8">
            <h2 className="mb-4 text-xl font-semibold">4. Contacto e Suporte</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Para pedir informação sobre os seus dados, corrigi-los ou eliminar a sua conta, ou
              sempre que precisar de apoio técnico, fale com a equipa do GEPEFE:
            </p>
            <div className="mt-5 rounded-lg border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Contacto oficial
              </p>
              <a
                href={`mailto:${privacyContact}`}
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:underline"
              >
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                {privacyContact}
              </a>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Pedidos relacionados com dados pessoais são respondidos pela coordenação do grupo.
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="sm">
                <Link to="/profile">
                  <LockKeyholeOpen />
                  Rever a minha conta
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/todos">
                  <ArrowRight />
                  Voltar ao acervo
                </Link>
              </Button>
            </div>
          </section>

          <footer className="border-t border-border pt-6 text-xs text-muted-foreground">
            Esta política entrou em vigor em {privacyEffectiveDate} e pode ser atualizada para
            refletir mudanças no aplicativo. Alterações relevantes são comunicadas nesta mesma
            página.
          </footer>
        </div>

        <nav aria-label="Secções desta página" className="hidden lg:block">
          <div className="sticky top-[calc(var(--repository-header-height)+24px)] space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Nesta página
            </p>
            <ul className="space-y-2 border-l border-border pl-4 text-xs">
              {sections.map(item => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="leading-5 text-muted-foreground hover:text-foreground hover:underline">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </main>
  );
}
