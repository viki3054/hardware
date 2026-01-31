"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Customer,
  InventoryItem,
  Invoice,
  InvoiceLine,
  PaymentMethod,
  StockMovement,
  StockMovementType,
} from "./types";
import { clamp, makeId } from "./utils";
import { createSampleData } from "./sampleData";

type DemoState = {
  shopName: string;
  seeded: boolean;

  items: InventoryItem[];
  customers: Customer[];
  invoices: Invoice[];
  movements: StockMovement[];

  seedIfNeeded: () => void;
  resetDemo: () => void;

  addItem: (item: Omit<InventoryItem, "id" | "updatedAt">) => void;
  updateItem: (id: string, patch: Partial<Omit<InventoryItem, "id">>) => void;
  deleteItem: (id: string) => void;

  recordMovement: (input: {
    type: StockMovementType;
    itemId: string;
    quantityDelta: number;
    note?: string;
    reference?: string;
    createdAt?: string;
  }) => void;

  addCustomer: (customer: Omit<Customer, "id">) => void;

  createInvoice: (input: {
    customerId: string;
    lines: Omit<InvoiceLine, "id">[];
    taxRate: number;
    paid: boolean;
    paymentMethod?: PaymentMethod;
    createdAt?: string;
  }) => string; // invoiceId

  toggleInvoicePaid: (invoiceId: string) => void;
};

const STORAGE_KEY = "hardware-demo-v1";

function computeInvoiceTotals(lines: InvoiceLine[], taxRate: number) {
  const subtotal = lines.reduce(
    (sum, l) => sum + l.qty * l.unitPrice - l.discount,
    0,
  );
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

function nextInvoiceNo(invoices: Invoice[]) {
  const used = invoices
    .map((i) => i.invoiceNo)
    .map((n) => Number(n.replace("INV-", "")))
    .filter((n) => Number.isFinite(n));
  const next = (used.length ? Math.max(...used) : 0) + 1;
  return `INV-${String(next).padStart(4, "0")}`;
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      shopName: "Hardware Demo",
      seeded: false,
      items: [],
      customers: [],
      invoices: [],
      movements: [],

      seedIfNeeded: () => {
        const state = get();
        if (state.seeded) return;
        const sample = createSampleData();
        set({
          shopName: sample.shopName,
          items: sample.items,
          customers: sample.customers,
          invoices: sample.invoices,
          movements: sample.movements,
          seeded: true,
        });
      },

      resetDemo: () => {
        set({
          shopName: "Hardware Demo",
          seeded: false,
          items: [],
          customers: [],
          invoices: [],
          movements: [],
        });
      },

      addItem: (item) => {
        const now = new Date().toISOString();
        const newItem: InventoryItem = {
          ...item,
          id: makeId("item"),
          updatedAt: now,
          quantity: clamp(item.quantity, 0, 1_000_000),
          minStock: clamp(item.minStock, 0, 1_000_000),
        };
        set((s) => ({ items: [newItem, ...s.items] }));
      },

      updateItem: (id, patch) => {
        const now = new Date().toISOString();
        set((s) => ({
          items: s.items.map((it) =>
            it.id === id
              ? {
                  ...it,
                  ...patch,
                  quantity:
                    patch.quantity === undefined
                      ? it.quantity
                      : clamp(patch.quantity, 0, 1_000_000),
                  minStock:
                    patch.minStock === undefined
                      ? it.minStock
                      : clamp(patch.minStock, 0, 1_000_000),
                  updatedAt: now,
                }
              : it,
          ),
        }));
      },

      deleteItem: (id) => {
        set((s) => ({
          items: s.items.filter((i) => i.id !== id),
          movements: s.movements.filter((m) => m.itemId !== id),
        }));
      },

      recordMovement: (input) => {
        const state = get();
        const item = state.items.find((i) => i.id === input.itemId);
        if (!item) return;
        const createdAt = input.createdAt ?? new Date().toISOString();
        const movement: StockMovement = {
          id: makeId("mov"),
          type: input.type,
          itemId: item.id,
          itemName: item.name,
          quantityDelta: input.quantityDelta,
          note: input.note,
          reference: input.reference,
          createdAt,
        };

        set((s) => ({
          movements: [movement, ...s.movements].slice(0, 200),
          items: s.items.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  quantity: clamp(it.quantity + input.quantityDelta, 0, 1_000_000),
                  updatedAt: createdAt,
                }
              : it,
          ),
        }));
      },

      addCustomer: (customer) => {
        set((s) => ({
          customers: [{ ...customer, id: makeId("cust") }, ...s.customers],
        }));
      },

      createInvoice: (input) => {
        const state = get();
        const customer = state.customers.find((c) => c.id === input.customerId);
        if (!customer) return "";

        const createdAt = input.createdAt ?? new Date().toISOString();
        const invoiceNo = nextInvoiceNo(state.invoices);

        const lines: InvoiceLine[] = input.lines.map((l) => ({
          ...l,
          id: makeId("line"),
        }));

        const totals = computeInvoiceTotals(lines, input.taxRate);
        const invoice: Invoice = {
          id: makeId("inv"),
          invoiceNo,
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerAddress: customer.address,
          customerGstin: customer.gstin,
          lines,
          taxRate: input.taxRate,
          subtotal: totals.subtotal,
          tax: totals.tax,
          total: totals.total,
          paid: input.paid,
          paymentMethod: input.paymentMethod,
          createdAt,
        };

        // Reduce stock for each line item
        for (const l of lines) {
          get().recordMovement({
            type: "ISSUE",
            itemId: l.itemId,
            quantityDelta: -clamp(l.qty, 0, 1_000_000),
            note: `Sold via ${invoiceNo}`,
            reference: invoiceNo,
            createdAt,
          });
        }

        set((s) => ({ invoices: [invoice, ...s.invoices] }));
        return invoice.id;
      },

      toggleInvoicePaid: (invoiceId) => {
        set((s) => ({
          invoices: s.invoices.map((inv) =>
            inv.id === invoiceId ? { ...inv, paid: !inv.paid } : inv,
          ),
        }));
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (s) => ({
        shopName: s.shopName,
        seeded: s.seeded,
        items: s.items,
        customers: s.customers,
        invoices: s.invoices,
        movements: s.movements,
      }),
    },
  ),
);
