import { Link } from 'react-router-dom';
import { LockKeyholeOpen } from 'lucide-react';
export function RepositoryFooter() {
  return <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-[11px] text-muted-foreground"><span>GEPEFE · Repositório Acadêmico Institucional</span><Link to="/sobre" className="flex items-center gap-1.5 hover:underline"><LockKeyholeOpen className="h-3.5 w-3.5" />Acesso aberto</Link></footer>;
}
