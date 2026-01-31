"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, Printer, ShoppingCart } from "lucide-react";
import PageHeader from "@/components/app/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { useDemoStore } from "@/lib/store";
import type { PaymentMethod } from "@/lib/types";
import { formatINR } from "@/lib/utils";

const TAX_RATES = [
  { label: "0%", value: 0 },
  { label: "5%", value: 0.05 },
  { label: "12%", value: 0.12 },
  { label: "18%", value: 0.18 },
];

const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "UPI", "Card", "Bank"];

export default function BillingPage() {
  const router = useRouter();
  const customers = useDemoStore((s) => s.customers);
  const items = useDemoStore((s) => s.items);
  const invoices = useDemoStore((s) => s.invoices);
  const createInvoice = useDemoStore((s) => s.createInvoice);
  const toggleInvoicePaid = useDemoStore((s) => s.toggleInvoicePaid);

  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [taxRate, setTaxRate] = useState(0.18);
  const [paid, setPaid] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");

  const [lines, setLines] = useState<
    { itemId: string; itemName: string; qty: number; unitPrice: number; discount: number }[]
  >(() => {
    const first = items[0];
    return first
      ? [
          {
            itemId: first.id,
            itemName: first.name,
            qty: 2,
            unitPrice: first.sellingPrice,
            discount: 0,
          },
        ]
      : [];
  });

  const totals = useMemo(() => {
    const subtotal = lines.reduce((sum, l) => sum + l.qty * l.unitPrice - l.discount, 0);
    const tax = Math.round(subtotal * taxRate);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [lines, taxRate]);

  const recentInvoices = useMemo(() => invoices.slice(0, 10), [invoices]);

  return (
    <div>
      <PageHeader
        title="Billing"
        subtitle="Create invoices, mark payments and print customer bills."
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Customer">
                <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Tax">
                <Select
                  value={String(taxRate)}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                >
                  {TAX_RATES.map((t) => (
                    <option key={t.label} value={String(t.value)}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Paid">
                <Select value={paid ? "yes" : "no"} onChange={(e) => setPaid(e.target.value === "yes")}>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
              </Field>
              <Field label="Payment Method">
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  disabled={!paid}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold">Items</div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const first = items[0];
                    if (!first) return;
                    setLines((s) => [
                      ...s,
                      {
                        itemId: first.id,
                        itemName: first.name,
                        qty: 1,
                        unitPrice: first.sellingPrice,
                        discount: 0,
                      },
                    ]);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add line
                </Button>
              </div>

              {/* Mobile: line items as cards */}
              <div className="grid gap-3 md:hidden">
                {lines.map((l, idx) => (
                  <div
                    key={`${l.itemId}-${idx}`}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm font-semibold">Line {idx + 1}</div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setLines((s) => s.filter((_, i) => i !== idx))}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="mt-3 grid gap-3">
                      <div>
                        <div className="mb-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                          Item
                        </div>
                        <Select
                          value={l.itemId}
                          onChange={(e) => {
                            const item = items.find((it) => it.id === e.target.value);
                            if (!item) return;
                            setLines((s) =>
                              s.map((x, i) =>
                                i === idx
                                  ? {
                                      ...x,
                                      itemId: item.id,
                                      itemName: item.name,
                                      unitPrice: item.sellingPrice,
                                    }
                                  : x,
                              ),
                            );
                          }}
                        >
                          {items.map((it) => (
                            <option key={it.id} value={it.id}>
                              {it.name}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="mb-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                            Qty
                          </div>
                          <Input
                            type="number"
                            value={l.qty}
                            onChange={(e) => {
                              const qty = Math.max(1, Number(e.target.value || 1));
                              setLines((s) =>
                                s.map((x, i) => (i === idx ? { ...x, qty } : x)),
                              );
                            }}
                          />
                        </div>
                        <div>
                          <div className="mb-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                            Rate
                          </div>
                          <Input
                            type="number"
                            value={l.unitPrice}
                            onChange={(e) => {
                              const unitPrice = Math.max(0, Number(e.target.value || 0));
                              setLines((s) =>
                                s.map((x, i) =>
                                  i === idx ? { ...x, unitPrice } : x,
                                ),
                              );
                            }}
                          />
                        </div>
                        <div className="col-span-2">
                          <div className="mb-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                            Discount
                          </div>
                          <Input
                            type="number"
                            value={l.discount}
                            onChange={(e) => {
                              const discount = Math.max(0, Number(e.target.value || 0));
                              setLines((s) =>
                                s.map((x, i) =>
                                  i === idx ? { ...x, discount } : x,
                                ),
                              );
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900">
                        <div className="text-zinc-600 dark:text-zinc-300">Amount</div>
                        <div className="font-semibold">
                          {formatINR(l.qty * l.unitPrice - l.discount)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block">
                <Table>
                  <THead>
                    <TR>
                      <TH>Item</TH>
                      <TH className="w-[90px]">Qty</TH>
                      <TH className="w-[130px]">Rate</TH>
                      <TH className="w-[120px]">Discount</TH>
                      <TH className="w-[140px]">Amount</TH>
                      <TH className="w-[60px]"></TH>
                    </TR>
                  </THead>
                  <tbody>
                    {lines.map((l, idx) => (
                      <TR key={`${l.itemId}-${idx}`}
                      >
                        <TD>
                          <Select
                            value={l.itemId}
                            onChange={(e) => {
                              const item = items.find((it) => it.id === e.target.value);
                              if (!item) return;
                              setLines((s) =>
                                s.map((x, i) =>
                                  i === idx
                                    ? {
                                        ...x,
                                        itemId: item.id,
                                        itemName: item.name,
                                        unitPrice: item.sellingPrice,
                                      }
                                    : x,
                                ),
                              );
                            }}
                          >
                            {items.map((it) => (
                              <option key={it.id} value={it.id}>
                                {it.name}
                              </option>
                            ))}
                          </Select>
                        </TD>
                        <TD>
                          <Input
                            type="number"
                            value={l.qty}
                            onChange={(e) => {
                              const qty = Math.max(1, Number(e.target.value || 1));
                              setLines((s) =>
                                s.map((x, i) => (i === idx ? { ...x, qty } : x)),
                              );
                            }}
                          />
                        </TD>
                        <TD>
                          <Input
                            type="number"
                            value={l.unitPrice}
                            onChange={(e) => {
                              const unitPrice = Math.max(0, Number(e.target.value || 0));
                              setLines((s) =>
                                s.map((x, i) =>
                                  i === idx ? { ...x, unitPrice } : x,
                                ),
                              );
                            }}
                          />
                        </TD>
                        <TD>
                          <Input
                            type="number"
                            value={l.discount}
                            onChange={(e) => {
                              const discount = Math.max(0, Number(e.target.value || 0));
                              setLines((s) =>
                                s.map((x, i) =>
                                  i === idx ? { ...x, discount } : x,
                                ),
                              );
                            }}
                          />
                        </TD>
                        <TD className="font-medium">
                          {formatINR(l.qty * l.unitPrice - l.discount)}
                        </TD>
                        <TD>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setLines((s) => s.filter((_, i) => i !== idx))}
                          >
                            ✕
                          </Button>
                        </TD>
                      </TR>
                    ))}
                  </tbody>
                </Table>
              </div>

              {!lines.length ? (
                <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                  Add at least one line item.
                </div>
              ) : null}
            </div>

            <div className="mt-4 grid gap-2 rounded-2xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-2">
              <div className="text-zinc-600 dark:text-zinc-300">Subtotal</div>
              <div className="text-right font-semibold">{formatINR(totals.subtotal)}</div>
              <div className="text-zinc-600 dark:text-zinc-300">Tax</div>
              <div className="text-right font-semibold">{formatINR(totals.tax)}</div>
              <div className="text-zinc-900 dark:text-zinc-100">Total</div>
              <div className="text-right text-lg font-semibold">{formatINR(totals.total)}</div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                onClick={() => {
                  if (!customerId || !lines.length) return;
                  const invoiceId = createInvoice({
                    customerId,
                    lines,
                    taxRate,
                    paid,
                    paymentMethod: paid ? paymentMethod : undefined,
                  });
                  if (!invoiceId) return;
                  router.push(`/invoices/${invoiceId}`);
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                Generate Invoice
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setLines([]);
                }}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {recentInvoices.length ? (
              <>
                {/* Mobile: cards */}
                <div className="grid gap-3 md:hidden">
                  {recentInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
                          >
                            {inv.invoiceNo}
                          </Link>
                          <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                            {format(new Date(inv.createdAt), "dd MMM, HH:mm")}
                          </div>
                        </div>
                        {inv.paid ? (
                          <Badge variant="success">Paid</Badge>
                        ) : (
                          <Badge variant="warning">Unpaid</Badge>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                        {inv.customerName}
                      </div>
                      <div className="mt-2 flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900">
                        <div className="text-zinc-600 dark:text-zinc-300">Total</div>
                        <div className="font-semibold">{formatINR(inv.total)}</div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          className="flex-1"
                          size="sm"
                          variant="outline"
                          onClick={() => toggleInvoicePaid(inv.id)}
                        >
                          Toggle Paid
                        </Button>
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                        >
                          <Printer className="h-4 w-4" />
                          Print
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: table */}
                <div className="hidden md:block">
                  <Table>
                    <THead>
                      <TR>
                        <TH>Invoice</TH>
                        <TH>Total</TH>
                        <TH>Status</TH>
                        <TH className="text-right">Actions</TH>
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
                              {format(new Date(inv.createdAt), "dd MMM, HH:mm")} • {inv.customerName}
                            </div>
                          </TD>
                          <TD className="font-semibold">{formatINR(inv.total)}</TD>
                          <TD>
                            {inv.paid ? (
                              <Badge variant="success">Paid</Badge>
                            ) : (
                              <Badge variant="warning">Unpaid</Badge>
                            )}
                          </TD>
                          <TD className="text-right">
                            <div className="inline-flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleInvoicePaid(inv.id)}
                              >
                                Toggle
                              </Button>
                              <Link
                                href={`/invoices/${inv.id}`}
                                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                              >
                                <Printer className="h-4 w-4" />
                                Print
                              </Link>
                            </div>
                          </TD>
                        </TR>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                No invoices yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label>
      <div className="mb-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
        {label}
      </div>
      {children}
    </label>
  );
}
