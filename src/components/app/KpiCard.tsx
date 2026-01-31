import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function KpiCard({
  title,
  value,
  hint,
  icon,
  tone = "default",
}: {
  title: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  tone?: "default" | "good" | "warn";
}) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-50 dark:bg-emerald-950/30"
      : tone === "warn"
        ? "bg-amber-50 dark:bg-amber-950/30"
        : "bg-zinc-50 dark:bg-zinc-950";

  return (
    <Card className={cn("overflow-hidden", toneClass)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {title}
        </CardTitle>
        {icon ? (
          <div className="text-zinc-500 dark:text-zinc-400">{icon}</div>
        ) : null}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {value}
        </div>
        {hint ? (
          <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {hint}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
