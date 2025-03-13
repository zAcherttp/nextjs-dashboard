
import { InvoicesTable } from "../lib/definitions";
import { supabase } from "../utils/supabase";

const ITEMS_PER_PAGE = 6;
export async function testing(term: string) {
  const offset = (1 - 1) * ITEMS_PER_PAGE;

  try {
    const { data, error } = await supabase.rpc("fetch_filtered_invoices", {
      search_query: term,
      search_offset: offset,
      search_limit: ITEMS_PER_PAGE,
    });
    if (error) {
      console.error("Database Error:", error);
      throw new Error("Failed to fetch filtered invoices.");
    }
    const invoicesTable: InvoicesTable[] = data.map((invoice) => ({
      amount: invoice.amount,
      id: invoice.id,
      date: invoice.date,
      status: invoice.status,
      name: invoice.name,
      email: invoice.email,
      image_url: invoice.image_url,
    }));
    return invoicesTable;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function GET() {
  try {
    return Response.json(await testing("rabbit"));
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
