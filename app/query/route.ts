import { fetchInvoicesPages } from "../lib/data";
import { CustomersTableType, LatestInvoice } from "../lib/definitions";
import { formatCurrency } from "../lib/utils";
import { supabase } from "../utils/supabase";
import { Revenue,LatestInvoiceRaw } from "../lib/definitions";

export async function testing() {
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

export async function GET() {
  try {
    return Response.json(await testing());
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
