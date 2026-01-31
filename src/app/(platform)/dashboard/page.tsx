"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format, isSameDay, subDays } from "date-fns";
import { Banknote, Boxes, CircleAlert, FileText, Package } from "lucide-react";
import PageHeader from "@/components/app/PageHeader";
import KpiCard from "@/components/app/KpiCard";
import SalesChart from "@/components/charts/SalesChart";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { useDemoStore } from "@/lib/store";
import { formatINR, formatNumber } from "@/lib/utils";

export default function DashboardPage() {
  const items = useDemoStore((s) => s.items);
  const invoices = useDemoStore((s) => s.invoices);
  const movements = useDemoStore((s) => s.movements);

  const lowStock = useMemo(
    () => items.filter((i) => i.quantity <= i.minStock),
    [items],
  );

  const inventoryValue = useMemo(() => {
    return items.reduce((sum, i) => sum + i.quantity * i.costPrice, 0);
  }, [items]);

  const unpaid = useMemo(() => invoices.filter((i) => !i.paid), [invoices]);

  const last7DaysData = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, idx) => subDays(new Date(), 6 - idx));

    return days.map((d) => {
      const sales = invoices
        .filter((inv) => isSameDay(new Date(inv.createdAt), d))
        .reduce((sum, inv) => sum + inv.total, 0);
      return { day: format(d, "EEE"), sales };
    });
  }, [invoices]);

  const sales7 = useMemo(
    () => last7DaysData.reduce((sum, d) => sum + d.sales, 0),
    [last7DaysData],
  );

  const recentInvoices = useMemo(() => invoices.slice(0, 6), [invoices]);
  const recentMovements = useMemo(() => movements.slice(0, 8), [movements]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="A single place to see stock, sales and billing health."
        right={
          <>
            <ButtonLink href="/billing" variant="primary">
              <FileText className="h-4 w-4" />
              Create Invoice
            </ButtonLink>
            <ButtonLink href="/inventory" variant="outline">
              <Boxes className="h-4 w-4" />
              Manage Items
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Sales (7 days)"
          value={formatINR(sales7)}
          hint="From issued invoices"
          icon={<Banknote className="h-4 w-4" />}
          tone="good"
        />
        <KpiCard
          title="Inventory Value"
          value={formatINR(inventoryValue)}
          hint="Based on cost price"
          icon={<Package className="h-4 w-4" />}
        />
        <KpiCard
          title="Low Stock"
          value={String(lowStock.length)}
          hint="Needs re-order"
          icon={<CircleAlert className="h-4 w-4" />}
          tone={lowStock.length ? "warn" : "good"}
        />
        <KpiCard
          title="Unpaid Invoices"
          value={String(unpaid.length)}
          hint="Follow-ups pending"
          icon={<FileText className="h-4 w-4" />}
          tone={unpaid.length ? "warn" : "good"}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={last7DaysData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length ? (
              <Table>
                <THead>
                  <TR>
                    <TH>Item</TH>
                    <TH>Qty</TH>
                    <TH>Status</TH>
                    <TH className="text-right">Action</TH>
                  </TR>
                </THead>
                <tbody>
                  {lowStock.slice(0, 6).map((i) => (
                    <TR key={i.id}>
                      <TD>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {i.name}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {i.sku} • {i.brand}
                        </div>
                      </TD>
                      <TD>
                        {formatNumber(i.quantity)} {i.unit}
                      </TD>
                      <TD>
                        <Badge variant="warning">Re-order</Badge>
                      </TD>
                      <TD className="text-right">
                        <Link
                          href="/stock"
                          className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
                        >
                          Receive stock
                        </Link>
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                All items are above minimum stock.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {recentInvoices.length ? (
              <Table>
                <THead>
                  <TR>
                    <TH>Invoice</TH>
                    <TH>Customer</TH>
                    <TH>Total</TH>
                    <TH>Status</TH>
                  </TR>
                </THead>
                <tbody>
                  {recentInvoices.map((inv) => (
                    <TR key={inv.id}>
                      <TD>
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="font-medium text-indigo-600 hover:underline dark:text-indigo-300"
                        >
                          {inv.invoiceNo}
                        </Link>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {format(new Date(inv.createdAt), "dd MMM, HH:mm")}
                        </div>
                      </TD>
                      <TD>{inv.customerName}</TD>
                      <TD>{formatINR(inv.total)}</TD>
                      <TD>
                        {inv.paid ? (
                          <Badge variant="success">Paid</Badge>
                        ) : (
                          <Badge variant="warning">Unpaid</Badge>
                        )}
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-300">
                No invoices yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Stock Movements</CardTitle>
          </CardHeader>
          <CardContent>
            {recentMovements.length ? (
              <Table>
                <THead>
                  <TR>
                    <TH>Type</TH>
                    <TH>Item</TH>
                    <TH>Qty</TH>
                    <TH>When</TH>
                  </TR>
                </THead>
                <tbody>
                  {recentMovements.map((m) => (
                    <TR key={m.id}>
                      <TD>
                        <Badge
                          variant={
                            m.type === "RECEIVE"
                              ? "success"
                              : m.type === "ISSUE"
                                ? "danger"
                                : "info"
                          }
                        >
                          {m.type}
                        </Badge>
                      </TD>
                      <TD>{m.itemName}</TD>
                      <TD className={m.quantityDelta < 0 ? "text-rose-600" : "text-emerald-700"}>
                        {m.quantityDelta}
                      </TD>
                      <TD className="text-xs text-zinc-500 dark:text-zinc-400">
                        {format(new Date(m.createdAt), "dd MMM, HH:mm")}
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-sm text-zinc-600 dark:text-zinc-300">
                No movements yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
