import { supabase } from "../utils/supabase";
import { formatCurrency } from "../lib/utils";
import { off } from "process";

async function listInvoices() {
  const { data, error } = await supabase
    .from("customers")
    .select(
      `name,
    invoices!inner(amount)`
    )
    .eq("invoices.amount", 666);
  if (error) throw error;

  return data;
}

const ITEMS_PER_PAGE = 6;
export async function testing(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const { data, error } = await supabase.rpc("fetch_filtered_invoices", {
      search_query: query,
      search_offset: offset,
      search_limit: ITEMS_PER_PAGE,
    });
    return data;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function GET() {
  try {
    return Response.json(await testing("balaz", 1));
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
