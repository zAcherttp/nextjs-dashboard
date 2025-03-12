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

export async function testing(query: string, currentPage: number) {}

export async function GET() {
  try {
    return Response.json(await testing("balaz", 1));
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
