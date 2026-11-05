import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Languages, History, LogIn, LogOut, Moon, Settings, Shield, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { accountLinks, bibliotecaHref } from '@/lib/repository-navigation';
import { readLanguage, saveLanguage, type AppLanguage } from '@/lib/app-language';
import { userAvatarUrl, userDisplayName } from '@/lib/user-avatar';
import { cn } from '@/lib/utils';
import { UserAvatar } from './UserAvatar';

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string; icon?: typeof Sun }[]; onChange: (v: T) => void }) {
  return <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-border bg-muted/50 p-0.5">
    {options.map(o => <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
      className={cn('flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors', value === o.value && 'bg-background text-foreground shadow-sm')}>
      {o.icon && <o.icon className="h-3.5 w-3.5" />}{o.label}
    </button>)}
  </div>;
}

export function AccountSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, isAdmin, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [view, setView] = useState<'menu' | 'settings'>('menu');
  const [language, setLanguage] = useState<AppLanguage>(readLanguage);
  const [langOpen, setLangOpen] = useState(false);
  useEffect(() => { if (!open) setView('menu'); }, [open]);
  const pickLanguage = (v: AppLanguage) => {
    setLangOpen(false);
    if (v === language) return;
    setLanguage(v); saveLanguage(v); window.location.reload();
  };
  const langOption = (v: AppLanguage) => <button key={v} type="button" role="radio" aria-checked={language === v} onClick={() => pickLanguage(v)} className="flex w-full items-center gap-4 px-6 py-3 text-left">
    <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', language === v ? 'border-primary' : 'border-muted-foreground')}>{language === v && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}</span>
    <span><span className="block text-base font-semibold">{v === 'en' ? 'inglês' : 'português (Brasil)'}</span>
      <span data-no-translate className="block text-sm text-muted-foreground">{v === 'en' ? 'English' : 'Português'}</span></span>
  </button>;
  const other: AppLanguage = language === 'en' ? 'pt' : 'en';
  const name = userDisplayName(user, 'Minha conta');
  const avatar = userAvatarUrl(user);
  const close = () => onOpenChange(false);
  const rowClass = 'flex w-full items-center gap-4 rounded-md px-2 py-3.5 text-left text-sm hover:bg-muted';
  const options = user ? [
    { label: 'Informações Pessoais', icon: User, href: '/profile' },
    { label: 'Histórico de Leitura', icon: History, href: bibliotecaHref('historico') },
    ...(isAdmin ? [{ label: 'Painel Administrativo', icon: Shield, href: '/admin' }] : []),
  ] : [];

  return <>
  <Dialog open={langOpen} onOpenChange={setLangOpen}>
    <DialogContent className="repository max-w-sm gap-0 p-0">
      <DialogHeader className="border-b border-border px-6 py-5"><DialogTitle className="text-left text-xl">Idioma do app</DialogTitle></DialogHeader>
      <div role="radiogroup" aria-label="Idioma do aplicativo" className="py-2">
        <p className="px-6 pb-1 pt-3 text-sm font-semibold text-muted-foreground">Idioma atual</p>
        {langOption(language)}
        <p className="px-6 pb-1 pt-3 text-sm font-semibold text-muted-foreground">Idiomas sugeridos</p>
        {langOption(other)}
      </div>
      <DialogFooter className="border-t border-border px-6 py-3"><Button variant="ghost" onClick={() => setLangOpen(false)}>Cancelar</Button></DialogFooter>
    </DialogContent>
  </Dialog>
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="repository flex w-full flex-col overflow-y-auto sm:max-w-sm">
      {view === 'settings' ? <div className="flex flex-1 flex-col animate-in fade-in slide-in-from-right-4 duration-200">
        <SheetHeader className="flex-row items-center gap-2 space-y-0">
          <Button variant="ghost" size="icon" aria-label="Voltar" onClick={() => setView('menu')} className="-ml-2 h-9 w-9"><ArrowLeft /></Button>
          <SheetTitle className="text-left text-xl">Configurações</SheetTitle>
        </SheetHeader>
        <div className="mt-6 divide-y divide-border border-y border-border">
          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            <span className="flex items-center gap-3 text-sm font-medium">{resolvedTheme === 'dark' ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}Tema do Aplicativo</span>
            <Segmented label="Tema do aplicativo" value={resolvedTheme === 'dark' ? 'dark' : 'light'} onChange={setTheme}
              options={[{ value: 'light', label: 'Claro', icon: Sun }, { value: 'dark', label: 'Escuro', icon: Moon }]} />
          </div>
          <button type="button" onClick={() => setLangOpen(true)} className="flex w-full items-center gap-3 py-4 text-left">
            <Languages className="h-5 w-5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1"><span className="block text-sm font-medium">Idioma do Aplicativo</span>
              <span className="block text-xs text-muted-foreground">{language === 'en' ? 'inglês' : 'português (Brasil)'}</span></span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div> : <div className="flex flex-1 flex-col animate-in fade-in slide-in-from-left-4 duration-200">
        <SheetHeader><SheetTitle className="text-left text-xl">Conta</SheetTitle></SheetHeader>
        {user ? <div className="mt-6 flex items-center gap-4">
          <UserAvatar name={name} avatar={avatar} className="h-14 w-14 shrink-0 text-xl" />
          <div className="min-w-0">
            <p className="truncate text-base font-semibold">{name}</p>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div> : <Button asChild className="mt-6 h-11 w-full"><Link to="/auth" onClick={close}><LogIn />Fazer Login ou Criar Conta</Link></Button>}
        <nav aria-label="Opções da conta" className="mt-4 border-t border-border pt-2">
          {options.map(option => <Link key={option.label} to={option.href} onClick={close} className={rowClass}>
            <option.icon className="h-5 w-5 shrink-0 text-muted-foreground" />{option.label}
          </Link>)}
          <button type="button" onClick={() => setView('settings')} className={rowClass}>
            <Settings className="h-5 w-5 shrink-0 text-muted-foreground" />Configurações
          </button>
          {user && <button type="button" onClick={() => { close(); void signOut().then(() => navigate('/auth')); }} className={cn(rowClass, 'text-destructive hover:bg-destructive/10')}>
            <LogOut className="h-5 w-5 shrink-0" />Sair / Encerrar Sessão
          </button>}
        </nav>
        <div className="mt-auto pt-8">
          <nav aria-label="Links institucionais" className="flex justify-center gap-5 text-xs text-muted-foreground">
            {accountLinks.map(item => <Link key={item.href} to={item.href} onClick={close} className="hover:underline">{item.label}</Link>)}
          </nav>
        </div>
      </div>}
    </SheetContent>
  </Sheet>
  </>;
}
