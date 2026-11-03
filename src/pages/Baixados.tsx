import { Navigate } from 'react-router-dom';
import { bibliotecaHref } from '@/lib/repository-navigation';

// The old downloads address lands on the unified library, on the Baixados filter.
export default function Baixados() {
  return <Navigate to={bibliotecaHref('baixados')} replace />;
}
