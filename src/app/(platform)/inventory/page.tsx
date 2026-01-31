"use client";

import { useMemo, useState } from "react";
import { Boxes, Plus, SlidersHorizontal } from "lucide-react";
import PageHeader from "@/components/app/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Table, TD, TH, THead, TR } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useDemoStore } from "@/lib/store";
import type { InventoryItem, Unit } from "@/lib/types";
import { formatINR, formatNumber } from "@/lib/utils";

const UNITS: Unit[] = ["pcs", "box", "kg", "m", "bag"];

export default function InventoryPage() {
  const items = useDemoStore((s) => s.items);
  const addItem = useDemoStore((s) => s.addItem);
  const updateItem = useDemoStore((s) => s.updateItem);
  const recordMovement = useDemoStore((s) => s.recordMovement);

  const [query, setQuery] = useState("");
  const [openAdd, setOpenAdd] = useState(false);
  const [openAdjust, setOpenAdjust] = useState(false);
  const [selected, setSelected] = useState<InventoryItem | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      [i.name, i.brand, i.category, i.sku]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [items, query]);

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Manage products, pricing and current stock."
        right={
          <Button onClick={() => setOpenAdd(true)}>
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-white">
                <Boxes className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">Products</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {filtered.length} items
                </div>
              </div>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name / brand / SKU"
                className="w-full sm:w-80"
              />
              <Button variant="outline" type="button">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>

          <div className="mt-4">
            {/* Mobile: card list */}
            <div className="grid gap-3 sm:hidden">
              {filtered.map((i) => {
                const low = i.quantity <= i.minStock;
                return (
                  <div
                    key={i.id}
                    className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-zinc-900 dark:text-zinc-100">
                          {i.name}
                        </div>
                        <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                          {i.sku} • {i.brand}
                        </div>
                      </div>
                      {low ? <Badge variant="warning">Low</Badge> : <Badge>OK</Badge>}
                    </div>

                    <div className="mt-3 grid gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="text-zinc-600 dark:text-zinc-300">Stock</div>
                        <div className={low ? "font-semibold text-rose-600" : "font-semibold"}>
                          {formatNumber(i.quantity)} {i.unit}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-zinc-600 dark:text-zinc-300">Min stock</div>
                        <div className="font-medium">{formatNumber(i.minStock)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-zinc-600 dark:text-zinc-300">Sell price</div>
                        <div className="font-medium">{formatINR(i.sellingPrice)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-zinc-600 dark:text-zinc-300">Location</div>
                        <div className="max-w-[60%] truncate font-medium">
                          {i.location}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelected(i);
                          setOpenAdjust(true);
                        }}
                      >
                        Adjust
                      </Button>
                      <Button
                        className="flex-1"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          updateItem(i.id, { minStock: Math.max(0, i.minStock + 5) });
                        }}
                      >
                        Increase Min
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: table */}
            <div className="hidden sm:block">
              <Table>
                <THead>
                  <TR>
                    <TH>Item</TH>
                    <TH>Stock</TH>
                    <TH>Prices</TH>
                    <TH>Location</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <tbody>
                  {filtered.map((i) => {
                    const low = i.quantity <= i.minStock;
                    return (
                      <TR key={i.id}>
                        <TD>
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">
                            {i.name}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            {i.sku} • {i.brand} • {i.category}
                          </div>
                        </TD>
                        <TD>
                          <div className="flex items-center gap-2">
                            <span
                              className={
                                low ? "font-semibold text-rose-600" : "font-semibold"
                              }
                            >
                              {formatNumber(i.quantity)} {i.unit}
                            </span>
                            {low ? (
                              <Badge variant="warning">Low</Badge>
                            ) : (
                              <Badge>OK</Badge>
                            )}
                          </div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            Min {formatNumber(i.minStock)}
                          </div>
                        </TD>
                        <TD>
                          <div className="text-sm">
                            <div>Sell: {formatINR(i.sellingPrice)}</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              Cost: {formatINR(i.costPrice)}
                            </div>
                          </div>
                        </TD>
                        <TD className="text-sm text-zinc-600 dark:text-zinc-300">
                          {i.location}
                        </TD>
                        <TD className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelected(i);
                                setOpenAdjust(true);
                              }}
                            >
                              Adjust
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                updateItem(i.id, {
                                  minStock: Math.max(0, i.minStock + 5),
                                });
                              }}
                            >
                              +Min
                            </Button>
                          </div>
                        </TD>
                      </TR>
                    );
                  })}
                </tbody>
              </Table>
            </div>

            {!filtered.length ? (
              <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                No items match your search.
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <AddItemModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreate={(item) => {
          addItem(item);
          setOpenAdd(false);
        }}
      />

      <AdjustStockModal
        open={openAdjust}
        onClose={() => {
          setOpenAdjust(false);
          setSelected(null);
        }}
        item={selected}
        onSave={({ type, qty, note }) => {
          if (!selected) return;
          const delta = type === "RECEIVE" ? qty : -qty;
          recordMovement({
            type,
            itemId: selected.id,
            quantityDelta: delta,
            note,
          });
          setOpenAdjust(false);
          setSelected(null);
        }}
      />
    </div>
  );
}

function AddItemModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (item: Omit<InventoryItem, "id" | "updatedAt">) => void;
}) {
  const [form, setForm] = useState<Omit<InventoryItem, "id" | "updatedAt">>({
    sku: "HDW-NEW",
    name: "",
    brand: "",
    category: "",
    unit: "pcs",
    costPrice: 0,
    sellingPrice: 0,
    quantity: 0,
    minStock: 10,
    location: "",
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Inventory Item"
      description="Create a new product for the demo inventory."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!form.name.trim()) return;
              onCreate({
                ...form,
                sku: form.sku.trim() || "HDW-NEW",
                name: form.name.trim(),
                brand: form.brand.trim() || "Generic",
                category: form.category.trim() || "General",
                location: form.location.trim() || "Store",
              });
            }}
          >
            Add Item
          </Button>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="SKU">
          <Input
            value={form.sku}
            onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))}
          />
        </Field>
        <Field label="Unit">
          <Select
            value={form.unit}
            onChange={(e) => setForm((s) => ({ ...s, unit: e.target.value as Unit }))}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Name" className="sm:col-span-2">
          <Input
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            placeholder="e.g., Hammer 1kg"
          />
        </Field>
        <Field label="Brand">
          <Input
            value={form.brand}
            onChange={(e) => setForm((s) => ({ ...s, brand: e.target.value }))}
          />
        </Field>
        <Field label="Category">
          <Input
            value={form.category}
            onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
          />
        </Field>
        <Field label="Cost Price">
          <Input
            type="number"
            value={form.costPrice}
            onChange={(e) =>
              setForm((s) => ({ ...s, costPrice: Number(e.target.value || 0) }))
            }
          />
        </Field>
        <Field label="Selling Price">
          <Input
            type="number"
            value={form.sellingPrice}
            onChange={(e) =>
              setForm((s) => ({ ...s, sellingPrice: Number(e.target.value || 0) }))
            }
          />
        </Field>
        <Field label="Opening Stock">
          <Input
            type="number"
            value={form.quantity}
            onChange={(e) =>
              setForm((s) => ({ ...s, quantity: Number(e.target.value || 0) }))
            }
          />
        </Field>
        <Field label="Min Stock">
          <Input
            type="number"
            value={form.minStock}
            onChange={(e) =>
              setForm((s) => ({ ...s, minStock: Number(e.target.value || 0) }))
            }
          />
        </Field>
        <Field label="Location" className="sm:col-span-2">
          <Input
            value={form.location}
            onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
            placeholder="e.g., Aisle B / Rack 3"
          />
        </Field>
      </div>
    </Modal>
  );
}

function AdjustStockModal({
  open,
  onClose,
  item,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSave: (input: { type: "RECEIVE" | "ISSUE"; qty: number; note: string }) => void;
}) {
  const [type, setType] = useState<"RECEIVE" | "ISSUE">("RECEIVE");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Adjust Stock"
      description={item ? `${item.name} (${item.sku})` : ""}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave({ type, qty: Math.max(1, qty), note });
              setNote("");
              setQty(1);
              setType("RECEIVE");
            }}
          >
            Save
          </Button>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Type">
          <Select
            value={type}
            onChange={(e) =>
              setType(e.target.value === "ISSUE" ? "ISSUE" : "RECEIVE")
            }
          >
            <option value="RECEIVE">Receive</option>
            <option value="ISSUE">Issue</option>
          </Select>
        </Field>
        <Field label="Quantity">
          <Input
            type="number"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value || 0))}
          />
        </Field>
        <Field label="Note" className="sm:col-span-2">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note (supplier, reason, etc.)"
          />
        </Field>
      </div>
    </Modal>
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
