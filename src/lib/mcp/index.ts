import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMaterialsTool from "./tools/list-materials";
import searchMaterialsTool from "./tools/search-materials";
import getMaterialTool from "./tools/get-material";

const supabaseUrl = process.env.SUPABASE_URL ?? "https://supabase.invalid";

export default defineMcp({
  name: "ecolink-mcp",
  title: "EcoLink MCP",
  version: "0.1.0",
  instructions:
    "Tools for EcoLink, a waste-to-resource marketplace. Use list_materials to browse active listings, search_materials for keyword search, and get_material for full details of a specific listing.",
  tools: [listMaterialsTool, searchMaterialsTool, getMaterialTool],
  auth: auth.oauth.issuer({
    issuer: `${supabaseUrl}/auth/v1`,
    acceptedAudiences: "authenticated",
    jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
  }),
});