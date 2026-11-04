import { Link, useNavigate } from 'react-router-dom';
import { History, LogOut, Moon, Settings, Shield, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { bibliotecaHref, privacyPath } from '@/lib/repository-navigation';
import { userAvatarUrl, userDisplayName } from '@/lib/user-avatar';
import { UserAvatar } from './UserAvatar';

export function AccountSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, isAdmin, signOut } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const name = userDisplayName(user, 'Minha conta');
  const avatar = userAvatarUrl(user);
  const dark = resolvedTheme === 'dark';
  const close = () => onOpenChange(false);
  const options = [
    { label: 'Informações Pessoais', icon: User, href: '/profile' },
    { label: 'Histórico de Leitura', icon: History, href: bibliotecaHref('historico') },
    ...(isAdmin ? [{ label: 'Painel Administrativo', icon: Shield, href: '/admin' }] : []),
    { label: 'Configurações', icon: Settings, href: '/profile' },
  ];
  return <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="repository w-full overflow-y-auto sm:max-w-sm">
      <SheetHeader><SheetTitle className="text-left text-xl">Conta</SheetTitle></SheetHeader>
      <div className="mt-6 flex items-center gap-4">
        <UserAvatar name={name} avatar={avatar} className="h-14 w-14 shrink-0 text-xl" />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{name}</p>
          <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3 border-y border-border py-4">
        {dark ? <Moon className="h-5 w-5 shrink-0 text-muted-foreground" /> : <Sun className="h-5 w-5 shrink-0 text-muted-foreground" />}
        <span className="flex-1 text-sm font-medium">Tema do Aplicativo</span>
        <span className="text-xs text-muted-foreground">{dark ? 'Escuro' : 'Claro'}</span>
        <Switch aria-label="Alternar entre modo claro e escuro" checked={dark} onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')} />
      </div>
      <nav aria-label="Opções da conta" className="mt-2">
        {options.map(option => <Link key={option.label} to={option.href} onClick={close} className="flex items-center gap-4 rounded-md px-2 py-3.5 text-sm hover:bg-muted">
          <option.icon className="h-5 w-5 shrink-0 text-muted-foreground" />{option.label}
        </Link>)}
        <button type="button" onClick={() => { close(); void signOut().then(() => navigate('/auth')); }} className="flex w-full items-center gap-4 rounded-md px-2 py-3.5 text-left text-sm text-destructive hover:bg-destructive/10">
          <LogOut className="h-5 w-5 shrink-0" />Sair / Encerrar Sessão
        </button>
      </nav>
      <p className="mt-8 text-center text-xs text-muted-foreground"><Link to={privacyPath} onClick={close} className="hover:underline">Política de Privacidade</Link></p>
    </SheetContent>
  </Sheet>;
}
