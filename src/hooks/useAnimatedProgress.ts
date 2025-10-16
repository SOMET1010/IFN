import { useEffect, useMemo, useState } from 'react';

export function useAnimatedProgress(target: number, storageKey = 'signup_progress') {
  const initialPrev = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    const stored = Number(sessionStorage.getItem(storageKey) || '0');
    return Number.isFinite(stored) ? stored : 0;
  }, [storageKey]);

  const [value, setValue] = useState<number>(initialPrev);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setValue(target);
      try { sessionStorage.setItem(storageKey, String(target)); } catch (error) {
      // Silently ignore storage errors
    }
    });
    return () => cancelAnimationFrame(id);
  }, [target, storageKey]);

  return value;
}

