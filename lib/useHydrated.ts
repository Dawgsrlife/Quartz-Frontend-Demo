import { useEffect, useState } from 'react';

/**
 * Hook to safely access state after hydration is complete.
 * Prevents hydration mismatches in Next.js App Router.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    setHydrated(true);
  }, []);
  
  return hydrated;
}
