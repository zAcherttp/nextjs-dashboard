import {
  Tables,
  TablesInsert,
  TablesUpdate,
} from "../utils/supabase.types";

export type User = Tables<"users">;
export type Customer = Tables<"customers">;
export type Invoice = Tables<"invoices"> & {
  status: "pending" | "paid";
};
export type Revenue = Tables<"revenue">;

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, "amount"> & {
  amount: number;
};

export type InvoicesTableRaw = Tables<"invoices"> & {
  name: string;
  email: string;
  image_url: string;
};

export type InvoicesTable = Omit<InvoicesTableRaw, "customer_id">

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: "pending" | "paid";
};

// Insert and Update types for convenience
export type UserInsert = TablesInsert<"users">;
export type UserUpdate = TablesUpdate<"users">;

export type CustomerInsert = TablesInsert<"customers">;
export type CustomerUpdate = TablesUpdate<"customers">;

export type InvoiceInsert = TablesInsert<"invoices">;
export type InvoiceUpdate = TablesUpdate<"invoices">;
