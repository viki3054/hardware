"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ArrowDownToLine, ArrowUpFromLine, PackagePlus } from "lucide-react";
import PageHeader from "@/components/app/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useDemoStore } from "@/lib/store";
import type { StockMovementType } from "@/lib/types";

export default function StockPage() {
  const items = useDemoStore((s) => s.items);
  const movements = useDemoStore((s) => s.movements);
  const recordMovement = useDemoStore((s) => s.recordMovement);

  const [type, setType] = useState<StockMovementType>("RECEIVE");
  const [adjustDirection, setAdjustDirection] = useState<"INCREASE" | "DECREASE">(
    "INCREASE",
  );
  const [itemId, setItemId] = useState(items[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [reference, setReference] = useState("");

  const recent = useMemo(() => movements.slice(0, 20), [movements]);

  const selectedItem = useMemo(() => items.find((i) => i.id === itemId), [items, itemId]);

  const icon =
    type === "RECEIVE" ? (
      <ArrowDownToLine className="h-4 w-4" />
    ) : type === "ISSUE" ? (
      <ArrowUpFromLine className="h-4 w-4" />
    ) : (
      <PackagePlus className="h-4 w-4" />
    );

  return (
    <div>
      <PageHeader
        title="Stock"
        subtitle="Record receiving, issuing and adjustments. This updates inventory instantly."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>New Stock Movement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Type">
                <Select value={type} onChange={(e) => setType(e.target.value as StockMovementType)}>
                  <option value="RECEIVE">Receive</option>
                  <option value="ISSUE">Issue</option>
                  <option value="ADJUST">Adjust</option>
                </Select>
              </Field>
              <Field label="Item">
                <Select value={itemId} onChange={(e) => setItemId(e.target.value)}>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={type === "ISSUE" ? "Quantity (to remove)" : "Quantity"}>
                <Input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value || 0))}
                />
              </Field>
              {type === "ADJUST" ? (
                <Field label="Adjustment">
                  <Select
                    value={adjustDirection}
                    onChange={(e) =>
                      setAdjustDirection(
                        e.target.value === "DECREASE" ? "DECREASE" : "INCREASE",
                      )
                    }
                  >
                    <option value="INCREASE">Increase stock</option>
                    <option value="DECREASE">Decrease stock</option>
                  </Select>
                </Field>
              ) : null}
              <Field label="Reference (optional)">
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Supplier bill / challan / note"
                />
              </Field>
              <Field label="Note" className="sm:col-span-2">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any details (supplier, reason, etc.)"
                />
              </Field>
            </div>

            <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">Selected item</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {selectedItem ? `${selectedItem.sku} • ${selectedItem.brand}` : "—"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">Current stock</div>
                  <div className="text-lg font-semibold">
                    {selectedItem ? `${selectedItem.quantity} ${selectedItem.unit}` : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                onClick={() => {
                  if (!itemId) return;
                  const q = Math.max(1, Math.floor(qty));
                  const delta =
                    type === "ISSUE"
                      ? -q
                      : type === "ADJUST"
                        ? (adjustDirection === "DECREASE" ? -q : q)
                        : q;
                  recordMovement({
                    type,
                    itemId,
                    quantityDelta: delta,
                    note: note.trim() || undefined,
                    reference: reference.trim() || undefined,
                  });
                  setQty(1);
                  setNote("");
                  setReference("");
                }}
              >
                {icon}
                Record
              </Button>
              <Button variant="outline" onClick={() => {
                setQty(1);
                setNote("");
                setReference("");
              }}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Movements</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length ? (
              <Table>
                <THead>
                  <TR>
                    <TH>Type</TH>
                    <TH>Item</TH>
                    <TH>Qty</TH>
                    <TH>Reference</TH>
                    <TH>When</TH>
                  </TR>
                </THead>
                <tbody>
                  {recent.map((m) => (
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
                      <TD>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">
                          {m.itemName}
                        </div>
                        {m.note ? (
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            {m.note}
                          </div>
                        ) : null}
                      </TD>
                      <TD className={m.quantityDelta < 0 ? "font-semibold text-rose-600" : "font-semibold text-emerald-700"}>
                        {m.quantityDelta}
                      </TD>
                      <TD className="text-xs text-zinc-500 dark:text-zinc-400">
                        {m.reference ?? "—"}
                      </TD>
                      <TD className="text-xs text-zinc-500 dark:text-zinc-400">
                        {format(new Date(m.createdAt), "dd MMM, HH:mm")}
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                No movements yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={className}>
      <div className="mb-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
        {label}
      </div>
      {children}
    </label>
  );
}
