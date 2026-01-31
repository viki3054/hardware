"use client";

import { useEffect } from "react";
import { useDemoStore } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";

export default function DemoBootstrap() {
  const seedIfNeeded = useDemoStore((s) => s.seedIfNeeded);
  const hydrated = useHydrated();

  useEffect(() => {
    if (!hydrated) return;
    seedIfNeeded();
  }, [hydrated, seedIfNeeded]);

  return null;
}
