import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
export default function NotFound() { return <main className="flex min-h-[60vh] items-center justify-center"><div className="text-center"><p className="mb-4 text-xs text-muted-foreground">GEPEFE / 404</p><h1 className="mb-4 text-3xl font-semibold">Página não encontrada</h1><Button variant="outline" asChild><Link to="/"><ArrowLeft />Voltar ao início</Link></Button></div></main>; }
