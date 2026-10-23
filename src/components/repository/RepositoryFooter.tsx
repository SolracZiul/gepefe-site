import { Link } from 'react-router-dom';
import { institutionalLinks } from '@/lib/repository-navigation';
export function RepositoryFooter() {
  return <footer className="mt-8 space-y-4 border-t border-border pt-6 text-[11px] text-muted-foreground"><nav aria-label="Links institucionais no rodapé" className="flex flex-wrap gap-x-5 gap-y-3">{institutionalLinks.map(item => <Link key={item.href} to={item.href} className="hover:underline">{item.label}</Link>)}</nav><p>GEPEFE · Repositório Acadêmico Institucional</p></footer>;
}
