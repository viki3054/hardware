import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  FileText,
  Package,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Hardware OS</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Inventory • Billing • Stock
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <ButtonLink href="/dashboard" variant="primary">
            Open Demo <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-12">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200">
              <Sparkles className="h-4 w-4" />
              Vercel-ready demo (sample data)
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              A modern single-platform system for hardware shops.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
              Show a shop owner a real workflow: manage inventory, record stock movements,
              and generate invoices—all in one clean dashboard.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/dashboard" variant="primary" size="lg">
                Launch Demo
                <ArrowRight className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink href="/billing" variant="outline" size="lg">
                Try Billing
                <FileText className="h-5 w-5" />
              </ButtonLink>
            </div>
            <div className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
              Tip: use “Reset demo” in the sidebar to replay the flow.
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Boxes className="h-5 w-5 text-indigo-600" /> Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600 dark:text-zinc-300">
              Products, pricing, min stock alerts, and quick adjustments.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" /> Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600 dark:text-zinc-300">
              Invoice builder with tax, discounts, payment status and print view.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-600" /> Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600 dark:text-zinc-300">
              Receive, issue and adjust stock—inventory updates instantly.
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-400">
        Demo built for Jan 2026 pitching. Data is stored locally in the browser.
      </footer>
    </div>
  );
}
