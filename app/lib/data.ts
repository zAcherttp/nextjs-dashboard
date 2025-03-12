import { count } from "console";
import { supabase } from "../utils/supabase";
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoice,
  Revenue,
} from "./definitions";
import { formatCurrency } from "./utils";

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log("Fetching revenue data...");
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    const { data, error } = await supabase.from("revenue").select("*");

    // console.log('Data fetch completed after 3 seconds.');
    const revenues: Revenue[] = data as Revenue[];
    return revenues;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select(
        `
        amount,
        ...customers!inner(
          name,
          image_url,
          email
        ),
        id
      `
      )
      .order("date", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Database Error:", error);
      throw new Error("Failed to fetch the latest invoices.");
    }
    const latestInvoices: LatestInvoice[] = data.map((invoice: any) => ({
      id: invoice.id,
      name: invoice.name,
      email: invoice.email,
      image_url: invoice.image_url,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    const [invoiceCountResult, customerCountResult, invoiceStatusResult] =
      await Promise.all([
        supabase.from("invoices").select("*", { count: "exact", head: true }),
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.rpc("get_invoice_status_summary"),
      ]);

    if (
      invoiceCountResult.error ||
      customerCountResult.error ||
      invoiceStatusResult.error
    ) {
      throw new Error("Failed to fetch card data.");
    }

    const numberOfInvoices = Number(invoiceCountResult.count ?? "0");
    const numberOfCustomers = Number(customerCountResult.count ?? "0");
    const totalPaidInvoices = formatCurrency(
      invoiceStatusResult.data?.[0].paid ?? "0"
    );
    const totalPendingInvoices = formatCurrency(
      invoiceStatusResult.data?.[0].pending ?? "0"
    );

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const { data, error } = await supabase.rpc("fetch_filtered_invoices", {
      search_query: query,
      search_offset: offset,
      search_limit: ITEMS_PER_PAGE,
    });
    if (error) {
      console.error("Database Error:", error);
      throw new Error("Failed to fetch filtered invoices.");
    }
    const invoicesTable: InvoicesTable[] = data.map((invoice: any) => ({
      amount: invoice.amount,
      id: invoice.id,
      date: invoice.date,
      status: invoice.status,
      name: invoice.customer_name,
      email: invoice.customer_email,
      image_url: invoice.customer_image_url,
    }));
    return invoicesTable;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const { data, error } = await supabase.rpc("count_filtered_invoices", {
      search_query: query,
    });

    if (error) {
      console.error("Database Error:", error);
    } else {
      const totalPages = Math.ceil(data / ITEMS_PER_PAGE);
      return totalPages;
    }
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("*, customers!inner(email, name)")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Database Error:", error);
      throw error;
    }

    const invoice: InvoiceForm = {
      id: data.id,
      customer_id: data.customer_id,
      amount: data.amount / 100, // Convert amount from cents to dollars
      status: data.status as "pending" | "paid",
    };

    return invoice;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchCustomers() {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select(
        `id,
        name`
      )
      .order("name", { ascending: true });

    if (error) {
      throw new Error("Failed to fetch all customers.");
    }

    const customers: CustomerField[] = data;
    return customers;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const { data, error } = await supabase.rpc("fetch_filtered_customers", {
      search_query: query,
    });

    if (error) {
      throw error;
    }

    const customersTable: CustomersTableType[] = data;
    return customersTable;
  } catch (err) {
    console.error("Database Error:", err);
    throw new Error("Failed to fetch customer table.");
  }
}
