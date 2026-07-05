import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

function sb() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export default defineTool({
  name: "list_materials",
  title: "List materials",
  description:
    "List active materials on EcoLink. Optionally filter by category or location, and limit the number of results.",
  inputSchema: {
    category: z.string().optional().describe("Filter by category (e.g. Metals, Wood, Plastics)."),
    location: z.string().optional().describe("Filter by location substring (case-insensitive)."),
    limit: z.number().int().min(1).max(50).optional().describe("Max rows to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ category, location, limit }) => {
    let q = sb()
      .from("materials")
      .select("id,title,category,price,price_type,location,quantity,created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (category) q = q.eq("category", category);
    if (location) q = q.ilike("location", `%${location}%`);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { materials: data ?? [] },
    };
  },
});