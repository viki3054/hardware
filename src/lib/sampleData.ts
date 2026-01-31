import type { Customer, InventoryItem, Invoice, StockMovement } from "./types";
import { makeId } from "./utils";

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function createSampleData(): {
  shopName: string;
  items: InventoryItem[];
  customers: Customer[];
  invoices: Invoice[];
  movements: StockMovement[];
} {
  const items: InventoryItem[] = [
    {
      id: makeId("item"),
      sku: "HDW-101",
      name: "PVC Pipe 1 inch",
      brand: "Supreme",
      category: "Pipes & Fittings",
      unit: "m",
      costPrice: 38,
      sellingPrice: 52,
      quantity: 120,
      minStock: 40,
      location: "Aisle A / Rack 2",
      updatedAt: isoDaysAgo(1),
    },
    {
      id: makeId("item"),
      sku: "HDW-102",
      name: "PVC Elbow 1 inch",
      brand: "Supreme",
      category: "Pipes & Fittings",
      unit: "pcs",
      costPrice: 7,
      sellingPrice: 12,
      quantity: 240,
      minStock: 60,
      location: "Aisle A / Bin 4",
      updatedAt: isoDaysAgo(2),
    },
    {
      id: makeId("item"),
      sku: "HDW-201",
      name: "Wall Putty 20kg",
      brand: "Birla White",
      category: "Cement & Putty",
      unit: "bag",
      costPrice: 410,
      sellingPrice: 465,
      quantity: 28,
      minStock: 30,
      location: "Godown / Stack 1",
      updatedAt: isoDaysAgo(4),
    },
    {
      id: makeId("item"),
      sku: "HDW-202",
      name: "Cement 50kg",
      brand: "UltraTech",
      category: "Cement & Putty",
      unit: "bag",
      costPrice: 345,
      sellingPrice: 390,
      quantity: 64,
      minStock: 40,
      location: "Godown / Stack 2",
      updatedAt: isoDaysAgo(3),
    },
    {
      id: makeId("item"),
      sku: "HDW-301",
      name: "LED Bulb 9W",
      brand: "Philips",
      category: "Electrical",
      unit: "pcs",
      costPrice: 82,
      sellingPrice: 120,
      quantity: 16,
      minStock: 25,
      location: "Counter / Shelf 1",
      updatedAt: isoDaysAgo(1),
    },
    {
      id: makeId("item"),
      sku: "HDW-401",
      name: "Paint Brush 2 inch",
      brand: "Asian Paints",
      category: "Paint Tools",
      unit: "pcs",
      costPrice: 55,
      sellingPrice: 79,
      quantity: 52,
      minStock: 20,
      location: "Aisle C / Rack 1",
      updatedAt: isoDaysAgo(6),
    },
    {
      id: makeId("item"),
      sku: "HDW-402",
      name: "Teflon Tape",
      brand: "Generic",
      category: "Plumbing",
      unit: "pcs",
      costPrice: 9,
      sellingPrice: 15,
      quantity: 180,
      minStock: 50,
      location: "Aisle A / Bin 1",
      updatedAt: isoDaysAgo(5),
    },
  ];

  const customers: Customer[] = [
    {
      id: makeId("cust"),
      name: "Rohit Sharma",
      phone: "+91 98765 43210",
      address: "Ward 3, Main Road",
    },
    {
      id: makeId("cust"),
      name: "Maa Durga Contractors",
      phone: "+91 91234 56789",
      address: "Industrial Area, Plot 12",
      gstin: "22AAAAA0000A1Z5",
    },
    {
      id: makeId("cust"),
      name: "Priya Verma",
      phone: "+91 99887 77665",
      address: "Green Park, Near Temple",
    },
  ];

  const get = (sku: string) => items.find((i) => i.sku === sku)!;

  const invoices: Invoice[] = [
    (() => {
      const line1 = get("HDW-102");
      const line2 = get("HDW-402");
      const lines = [
        {
          id: makeId("line"),
          itemId: line1.id,
          itemName: line1.name,
          qty: 10,
          unitPrice: line1.sellingPrice,
          discount: 0,
        },
        {
          id: makeId("line"),
          itemId: line2.id,
          itemName: line2.name,
          qty: 6,
          unitPrice: line2.sellingPrice,
          discount: 0,
        },
      ];
      const subtotal = lines.reduce(
        (sum, l) => sum + l.qty * l.unitPrice - l.discount,
        0,
      );
      const taxRate = 0.18;
      const tax = Math.round(subtotal * taxRate);
      const total = subtotal + tax;
      const c = customers[0];
      return {
        id: makeId("inv"),
        invoiceNo: "INV-0007",
        customerId: c.id,
        customerName: c.name,
        customerPhone: c.phone,
        customerAddress: c.address,
        customerGstin: c.gstin,
        lines,
        taxRate,
        subtotal,
        tax,
        total,
        paid: true,
        paymentMethod: "UPI",
        createdAt: isoDaysAgo(1),
      } satisfies Invoice;
    })(),
    (() => {
      const line1 = get("HDW-202");
      const lines = [
        {
          id: makeId("line"),
          itemId: line1.id,
          itemName: line1.name,
          qty: 12,
          unitPrice: line1.sellingPrice,
          discount: 120,
        },
      ];
      const subtotal = lines.reduce(
        (sum, l) => sum + l.qty * l.unitPrice - l.discount,
        0,
      );
      const taxRate = 0.0;
      const tax = 0;
      const total = subtotal;
      const c = customers[1];
      return {
        id: makeId("inv"),
        invoiceNo: "INV-0008",
        customerId: c.id,
        customerName: c.name,
        customerPhone: c.phone,
        customerAddress: c.address,
        customerGstin: c.gstin,
        lines,
        taxRate,
        subtotal,
        tax,
        total,
        paid: false,
        paymentMethod: "Cash",
        createdAt: isoDaysAgo(3),
      } satisfies Invoice;
    })(),
    (() => {
      const line1 = get("HDW-301");
      const line2 = get("HDW-401");
      const lines = [
        {
          id: makeId("line"),
          itemId: line1.id,
          itemName: line1.name,
          qty: 4,
          unitPrice: line1.sellingPrice,
          discount: 0,
        },
        {
          id: makeId("line"),
          itemId: line2.id,
          itemName: line2.name,
          qty: 3,
          unitPrice: line2.sellingPrice,
          discount: 0,
        },
      ];
      const subtotal = lines.reduce(
        (sum, l) => sum + l.qty * l.unitPrice - l.discount,
        0,
      );
      const taxRate = 0.12;
      const tax = Math.round(subtotal * taxRate);
      const total = subtotal + tax;
      const c = customers[2];
      return {
        id: makeId("inv"),
        invoiceNo: "INV-0009",
        customerId: c.id,
        customerName: c.name,
        customerPhone: c.phone,
        customerAddress: c.address,
        customerGstin: c.gstin,
        lines,
        taxRate,
        subtotal,
        tax,
        total,
        paid: true,
        paymentMethod: "Card",
        createdAt: isoDaysAgo(6),
      } satisfies Invoice;
    })(),
  ];

  // Roughly simulate stock impacts for sample invoices
  const movements: StockMovement[] = invoices.flatMap((inv) =>
    inv.lines.map((l) => ({
      id: makeId("mov"),
      type: "ISSUE" as const,
      itemId: l.itemId,
      itemName: l.itemName,
      quantityDelta: -l.qty,
      note: `Sold via ${inv.invoiceNo}`,
      reference: inv.invoiceNo,
      createdAt: inv.createdAt,
    })),
  );

  // Apply those movements to initial stock to make numbers feel real
  for (const m of movements) {
    const item = items.find((i) => i.id === m.itemId);
    if (item) item.quantity += m.quantityDelta;
  }

  return {
    shopName: "Sharma Hardware",
    items,
    customers,
    invoices,
    movements,
  };
}
