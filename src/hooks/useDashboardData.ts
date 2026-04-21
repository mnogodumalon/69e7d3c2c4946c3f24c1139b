import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Fermenter2Livebild } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';

export function useDashboardData() {
  const [fermenter2Livebild, setFermenter2Livebild] = useState<Fermenter2Livebild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [fermenter2LivebildData] = await Promise.all([
        LivingAppsService.getFermenter2Livebild(),
      ]);
      setFermenter2Livebild(fermenter2LivebildData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    async function silentRefresh() {
      try {
        const [fermenter2LivebildData] = await Promise.all([
          LivingAppsService.getFermenter2Livebild(),
        ]);
        setFermenter2Livebild(fermenter2LivebildData);
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    window.addEventListener('dashboard-refresh', handleRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleRefresh);
  }, []);

  return { fermenter2Livebild, setFermenter2Livebild, loading, error, fetchAll };
}