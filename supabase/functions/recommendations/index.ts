// Personalized recommendations powered by Lovable AI Gateway.
// - Seekers: recommends materials matching their profile & browsing history.
// - Listers: recommends potential buyers/seekers (other users) for their materials.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return json({ error: "Missing LOVABLE_API_KEY" }, 500);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    // Load profile + role
    const [{ data: profile }, { data: roles }] = await Promise.all([
      admin.from("profiles").select("full_name, company, location, bio, interests").eq("id", user.id).maybeSingle(),
      admin.from("user_roles").select("role").eq("user_id", user.id),
    ]);
    const roleList = (roles ?? []).map((r: any) => r.role);
    const role = roleList.includes("lister") ? "lister" : "seeker";

    // Load browsing signals
    const { data: views } = await admin
      .from("material_views")
      .select("material_id, viewed_at, materials(title, category, description)")
      .eq("user_id", user.id)
      .order("viewed_at", { ascending: false })
      .limit(15);

    let candidates: any[] = [];
    let mode: "materials" | "buyers" = "materials";

    if (role === "lister") {
      mode = "buyers";
      // Lister's own materials
      const { data: myMats } = await admin
        .from("materials")
        .select("id, title, category, description")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(10);

      // Candidate buyers: other users (seekers) with profiles
      const { data: seekerRoles } = await admin
        .from("user_roles")
        .select("user_id")
        .eq("role", "seeker")
        .neq("user_id", user.id)
        .limit(50);
      const seekerIds = (seekerRoles ?? []).map((r: any) => r.user_id);
      if (seekerIds.length) {
        const { data: seekerProfiles } = await admin
          .from("profiles")
          .select("id, full_name, company, location, bio, interests, avatar_url")
          .in("id", seekerIds)
          .limit(50);
        candidates = (seekerProfiles ?? []).map((p: any) => ({
          id: p.id,
          name: p.full_name || p.company || "Anonymous seeker",
          company: p.company,
          location: p.location,
          interests: p.interests,
          bio: p.bio,
          avatar_url: p.avatar_url,
        }));
      }

      const prompt = buildListerPrompt(profile, myMats ?? [], candidates);
      const ai = await callAI(lovableKey, prompt);
      return json({ mode, items: hydrateBuyers(ai, candidates) });
    } else {
      // Seeker: recommend materials
      const { data: mats } = await admin
        .from("materials")
        .select("id, title, description, category, location, price_type, price, image_url, images, user_id")
        .eq("status", "active")
        .neq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(60);
      candidates = mats ?? [];
      const prompt = buildSeekerPrompt(profile, views ?? [], candidates);
      const ai = await callAI(lovableKey, prompt);
      return json({ mode, items: hydrateMaterials(ai, candidates) });
    }
  } catch (e) {
    console.error("recommendations error", e);
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function buildSeekerPrompt(profile: any, views: any[], candidates: any[]) {
  return `You are an AI matcher for EcoLink, a waste-to-resource marketplace.
The user is a SEEKER looking for materials.

User profile:
${JSON.stringify(profile ?? {}, null, 2)}

Recently viewed materials (browsing history):
${JSON.stringify((views ?? []).map((v) => v.materials).filter(Boolean), null, 2)}

Available materials (candidates):
${JSON.stringify(candidates.map((c) => ({ id: c.id, title: c.title, description: c.description, category: c.category, location: c.location })), null, 2)}

Pick the 6 BEST material matches for this seeker. Consider category overlap with viewed items, stated interests, bio keywords, and location proximity. Return ONLY valid JSON in this exact shape (no prose, no code fences):
{"recommendations":[{"id":"<material id>","reason":"<one short sentence why it fits>"}]}`;
}

function buildListerPrompt(profile: any, myMats: any[], candidates: any[]) {
  return `You are an AI matcher for EcoLink, a waste-to-resource marketplace.
The user is a LISTER offering byproducts/materials. Recommend potential buyers (seekers).

Lister profile:
${JSON.stringify(profile ?? {}, null, 2)}

Lister's active materials:
${JSON.stringify(myMats, null, 2)}

Candidate seekers:
${JSON.stringify(candidates.map((c) => ({ id: c.id, name: c.name, company: c.company, location: c.location, interests: c.interests, bio: c.bio })), null, 2)}

Pick the 6 BEST potential buyers for this lister's materials. Match on interests/bio keywords vs material categories, and location proximity. Return ONLY valid JSON (no prose, no code fences):
{"recommendations":[{"id":"<seeker id>","reason":"<one short sentence why they'd want these materials>"}]}`;
}

async function callAI(apiKey: string, prompt: string): Promise<{ id: string; reason: string }[]> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You output only valid JSON. No prose, no markdown fences." },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    console.error("AI gateway error", res.status, await res.text());
    return [];
  }
  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  const cleaned = content.replace(/```json|```/g, "").trim();
  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed?.recommendations) ? parsed.recommendations : [];
  } catch {
    console.error("Failed to parse AI output", content);
    return [];
  }
}

function hydrateMaterials(recs: { id: string; reason: string }[], candidates: any[]) {
  const map = new Map(candidates.map((c) => [c.id, c]));
  return recs
    .map((r) => {
      const m = map.get(r.id);
      if (!m) return null;
      return { ...m, reason: r.reason };
    })
    .filter(Boolean);
}

function hydrateBuyers(recs: { id: string; reason: string }[], candidates: any[]) {
  const map = new Map(candidates.map((c) => [c.id, c]));
  return recs
    .map((r) => {
      const c = map.get(r.id);
      if (!c) return null;
      return { ...c, reason: r.reason };
    })
    .filter(Boolean);
}