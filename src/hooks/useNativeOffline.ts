import { useSyncExternalStore } from 'react';
import { isOfflineMode, subscribeOffline } from '@/lib/native-offline';

/** True only inside the native app while the device has no connection. */
export function useNativeOffline() {
  return useSyncExternalStore(subscribeOffline, isOfflineMode, () => false);
}
