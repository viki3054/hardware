"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import DemoBootstrap from "@/components/DemoBootstrap";
import ThemeToggle from "@/components/ThemeToggle";
import { useDemoStore } from "@/lib/store";
import { useHydrated } from "@/lib/useHydrated";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/billing", label: "Billing", icon: FileText },
  { href: "/stock", label: "Stock", icon: Package },
];

function SidebarContent({
  pathname,
  shopName,
  onNavigate,
  onReset,
}: {
  pathname: string;
  shopName: string;
  onNavigate?: () => void;
  onReset: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={onNavigate}
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">{shopName}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Hardware OS (Demo)
            </div>
          </div>
        </Link>
      </div>

      <nav className="mt-4 grid gap-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 p-4 text-sm dark:border-zinc-800 dark:from-zinc-950 dark:to-zinc-950">
        <div className="flex items-center gap-2 font-semibold">
          <TrendingUp className="h-4 w-4" />
          Sales-ready demo
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Realistic flows: stock movements, invoice creation, low stock alerts.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onReset();
              onNavigate?.();
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Reset demo
          </Button>
        </div>
      </div>

      <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
        Data is stored locally in your browser.
      </div>
    </>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const shopName = useDemoStore((s) => s.shopName);
  const resetDemo = useDemoStore((s) => s.resetDemo);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <DemoBootstrap />

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80 sm:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">{shopName}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Demo
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle variant="outline" size="sm" className="px-2" />
            <Link
              href="/billing"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden min-[380px]:inline">Invoice</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[86%] max-w-sm border-r border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Menu
              </div>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              shopName={shopName}
              onReset={resetDemo}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 sm:grid-cols-[260px_1fr]">
        <aside className="hidden border-b border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-zinc-950 sm:block sm:min-h-screen sm:border-b-0 sm:border-r">
          <SidebarContent
            pathname={pathname}
            shopName={shopName}
            onReset={resetDemo}
          />
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-10 hidden border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-900 dark:bg-zinc-950/80 sm:block">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
              <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                <Search className="h-4 w-4" />
                <Input
                  placeholder="Search (demo UI)"
                  className="h-6 border-0 bg-transparent p-0 shadow-none focus:ring-0"
                />
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle variant="outline" size="sm" />
                <Link href="/billing">
                  <Button variant="secondary" size="sm">
                    <FileText className="h-4 w-4" />
                    New Invoice
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-5xl p-4 sm:p-6">
            {!hydrated ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                Loading demo data…
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
