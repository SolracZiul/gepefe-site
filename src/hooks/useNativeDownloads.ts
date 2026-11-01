import { useEffect, useState, useSyncExternalStore } from 'react';
import { downloadsRevision, listDownloads, subscribeDownloads, type OfflinePublication } from '@/lib/native-offline';

export function useNativeDownloads() {
  const revision = useSyncExternalStore(subscribeDownloads, downloadsRevision);
  const [items, setItems] = useState<OfflinePublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    listDownloads().then(data => { if (active) { setItems(data); setError(false); } }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision]);
  return { items, loading, error };
}