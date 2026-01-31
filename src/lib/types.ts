export type Unit = "pcs" | "box" | "kg" | "m" | "bag";

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  unit: Unit;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  minStock: number;
  location: string;
  updatedAt: string; // ISO
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  gstin?: string;
};

export type StockMovementType = "RECEIVE" | "ISSUE" | "ADJUST";

export type StockMovement = {
  id: string;
  type: StockMovementType;
  itemId: string;
  itemName: string;
  quantityDelta: number;
  note?: string;
  reference?: string;
  createdAt: string; // ISO
};

export type InvoiceLine = {
  id: string;
  itemId: string;
  itemName: string;
  qty: number;
  unitPrice: number;
  discount: number; // absolute amount
};

export type PaymentMethod = "Cash" | "UPI" | "Card" | "Bank";

export type Invoice = {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerGstin?: string;
  lines: InvoiceLine[];
  taxRate: number; // 0..1
  subtotal: number;
  tax: number;
  total: number;
  paid: boolean;
  paymentMethod?: PaymentMethod;
  createdAt: string; // ISO
};
