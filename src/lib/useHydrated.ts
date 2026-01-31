"use client";

import { useEffect, useState } from "react";
import { useDemoStore } from "@/lib/store";

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useDemoStore.persist.onFinishHydration(() => setHydrated(true));
    if (useDemoStore.persist.hasHydrated()) {
      queueMicrotask(() => setHydrated(true));
    }
    return () => {
      unsub();
    };
  }, []);

  return hydrated;
}
