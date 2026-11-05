import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Languages, History, LogIn, LogOut, Moon, Settings, Shield, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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
  useEffect(() => { if (!open) setView('menu'); }, [open]);
  const name = userDisplayName(user, 'Minha conta');
  const avatar = userAvatarUrl(user);
  const close = () => onOpenChange(false);
  const rowClass = 'flex w-full items-center gap-4 rounded-md px-2 py-3.5 text-left text-sm hover:bg-muted';
  const options = user ? [
    { label: 'Informações Pessoais', icon: User, href: '/profile' },
    { label: 'Histórico de Leitura', icon: History, href: bibliotecaHref('historico') },
    ...(isAdmin ? [{ label: 'Painel Administrativo', icon: Shield, href: '/admin' }] : []),
  ] : [];

  return <Sheet open={open} onOpenChange={onOpenChange}>
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
          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            <span className="flex items-center gap-3 text-sm font-medium"><Languages className="h-5 w-5 text-muted-foreground" />Idioma do Aplicativo</span>
            <Segmented label="Idioma do aplicativo" value={language} onChange={v => { setLanguage(v); saveLanguage(v); }}
              options={[{ value: 'pt', label: 'Português' }, { value: 'en', label: 'Inglês' }]} />
          </div>
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
  </Sheet>;
}
