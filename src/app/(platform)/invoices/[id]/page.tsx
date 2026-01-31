"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { useDemoStore } from "@/lib/store";
import { formatINR } from "@/lib/utils";

export default function InvoiceViewPage() {
  const params = useParams<{ id: string }>();
  const invoiceId = params?.id;

  const shopName = useDemoStore((s) => s.shopName);
  const invoice = useDemoStore((s) => s.invoices.find((i) => i.id === invoiceId));

  if (!invoice) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between print:hidden">
          <Link
            href="/billing"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Billing
          </Link>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          Invoice not found in this browser.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link
          href="/billing"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Billing
        </Link>
        <Button
          variant="secondary"
          onClick={() => {
            window.print();
          }}
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      <Card className="print:border-0 print:shadow-none">
        <CardHeader className="print:pb-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-xl">{shopName}</CardTitle>
              <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Inventory • Billing • Stock (Demo)
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{invoice.invoiceNo}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {format(new Date(invoice.createdAt), "dd MMM yyyy, HH:mm")}
              </div>
              <div className="mt-2">
                {invoice.paid ? (
                  <Badge variant="success">Paid</Badge>
                ) : (
                  <Badge variant="warning">Unpaid</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mt-2 grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="grid gap-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Bill To
              </div>
              <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                {invoice.customerName}
              </div>
              <div className="text-zinc-600 dark:text-zinc-300">
                {invoice.customerPhone}
              </div>
              <div className="text-zinc-600 dark:text-zinc-300">
                {invoice.customerAddress}
              </div>
              {invoice.customerGstin ? (
                <div className="text-zinc-600 dark:text-zinc-300">
                  GSTIN: {invoice.customerGstin}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            <Table>
              <THead>
                <TR>
                  <TH>Item</TH>
                  <TH className="text-right">Qty</TH>
                  <TH className="text-right">Rate</TH>
                  <TH className="text-right">Discount</TH>
                  <TH className="text-right">Amount</TH>
                </TR>
              </THead>
              <tbody>
                {invoice.lines.map((l) => (
                  <TR key={l.id}>
                    <TD className="font-medium">{l.itemName}</TD>
                    <TD className="text-right">{l.qty}</TD>
                    <TD className="text-right">{formatINR(l.unitPrice)}</TD>
                    <TD className="text-right">{formatINR(l.discount)}</TD>
                    <TD className="text-right font-semibold">
                      {formatINR(l.qty * l.unitPrice - l.discount)}
                    </TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="mt-4 ml-auto w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <div className="text-zinc-600 dark:text-zinc-300">Subtotal</div>
              <div className="font-semibold">{formatINR(invoice.subtotal)}</div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-zinc-600 dark:text-zinc-300">
                Tax ({Math.round(invoice.taxRate * 100)}%)
              </div>
              <div className="font-semibold">{formatINR(invoice.tax)}</div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3 text-base dark:border-zinc-800">
              <div className="font-semibold">Total</div>
              <div className="text-lg font-semibold">{formatINR(invoice.total)}</div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Thank you! This is a demo invoice generated from sample data.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
