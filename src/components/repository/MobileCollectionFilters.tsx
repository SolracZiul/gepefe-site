import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  area: string; type: string; sort: string; year: string; author: string;
  years: string[]; authors: string[]; category: string;
  areas: string[]; types: string[];
  onArea: (value: string) => void; onType: (value: string) => void; onSort: (value: string) => void;
  onYear: (value: string) => void; onAuthor: (value: string) => void; onReset: () => void;
}
const sortOptions = [
  { value: 'recent', label: 'Mais Recentes' },
  { value: 'downloads', label: 'Mais Baixados' },
  { value: 'title', label: 'A–Z' },
];
export function MobileCollectionFilters(props: Props) {
  const [open, setOpen] = useState(false);
  const advanced = Boolean(props.year || props.author || props.area || props.type || props.sort !== 'recent');
  const chips = [
    { label: 'Tudo', selected: !props.area && !props.type && !advanced, action: props.onReset },
    ...(!props.category || props.category === 'Artigos Completos' ? [{ label: 'Artigos Completos', selected: props.type === 'Artigos Completos', action: () => props.onType(props.type === 'Artigos Completos' ? '' : 'Artigos Completos') }] : []),
    { label: 'Educação Física Escolar', selected: props.area === 'Educação Física Escolar', action: () => props.onArea(props.area === 'Educação Física Escolar' ? '' : 'Educação Física Escolar') },
    { label: 'Inclusão', selected: props.area === 'Inclusão', action: () => props.onArea(props.area === 'Inclusão' ? '' : 'Inclusão') },
    { label: 'Mais Recentes', selected: props.sort === 'recent', action: () => props.onSort('recent') },
  ];
  const fields = [
    { label: 'Área de Estudo', value: props.area, options: props.areas, change: props.onArea },
    { label: 'Categoria / Tipo de Documento', value: props.type, options: props.types, change: props.onType },
    { label: 'Ano', value: props.year, options: props.years, change: props.onYear },
    { label: 'Autor', value: props.author, options: props.authors, change: props.onAuthor },
  ];
  return <>
    <section aria-label="Filtros rápidos" className="mb-3 flex min-w-0 items-center gap-2 lg:hidden">
      <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-1">{chips.map(chip => <Button key={chip.label} variant={chip.selected ? 'secondary' : 'outline'} size="sm" aria-pressed={chip.selected} onClick={chip.action} className={`h-9 shrink-0 rounded-full px-4 text-xs ${chip.selected ? 'bg-foreground text-background hover:bg-foreground/90 hover:text-background' : 'bg-card'}`}>{chip.label}</Button>)}</div>
      <Button variant="ghost" size="icon" aria-label="Filtros Avançados" title="Filtros Avançados" aria-expanded={open} onClick={() => setOpen(true)} className={`relative shrink-0 ${advanced ? 'text-primary' : ''}`}><SlidersHorizontal />{advanced && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />}</Button>
    </section>
    <Sheet open={open} onOpenChange={setOpen}><SheetContent side="bottom" className="repository max-h-[85dvh] overflow-y-auto rounded-t-lg pb-[calc(24px+env(safe-area-inset-bottom))]"><SheetHeader><SheetTitle className="mb-5 text-left">Filtros Avançados</SheetTitle></SheetHeader>
      <div className="space-y-6">
        {fields.map(field => <div key={field.label}><label className="mb-2 block text-sm font-medium">{field.label}</label><Select value={field.value || 'all'} onValueChange={value => field.change(value === 'all' ? '' : value)}><SelectTrigger aria-label={field.label} className="h-11 bg-background text-sm"><SelectValue /></SelectTrigger><SelectContent className="max-h-64"><SelectItem value="all">Todos</SelectItem>{field.options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select></div>)}
        <div><label className="mb-2 block text-sm font-medium">Ordenação</label><Select value={props.sort} onValueChange={props.onSort}><SelectTrigger aria-label="Ordenação" className="h-11 bg-background text-sm"><SelectValue /></SelectTrigger><SelectContent>{sortOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="sticky bottom-0 mt-6 flex gap-3 bg-background pb-[calc(16px+env(safe-area-inset-bottom))] pt-2"><Button variant="outline" className="flex-1 h-11" onClick={props.onReset}>Limpar</Button><Button className="flex-1 h-11" onClick={() => setOpen(false)}>Ver resultados</Button></div>
    </SheetContent></Sheet>
  </>;
}
