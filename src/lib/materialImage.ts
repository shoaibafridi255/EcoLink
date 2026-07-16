import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const BUCKET = "material-images";
const EXPIRES_IN = 60 * 60; // 1 hour

// Extract storage path from either a public URL, signed URL, or raw path.
export function extractPath(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) {
    // Not a material-images URL (e.g. placeholder). Return null so caller uses url as-is.
    if (url.startsWith("http") || url.startsWith("/")) return null;
    return url;
  }
  let path = url.substring(idx + marker.length);
  // Strip query string from existing signed URLs
  const q = path.indexOf("?");
  if (q !== -1) path = path.substring(0, q);
  return path;
}

const cache = new Map<string, { url: string; expires: number }>();

export async function getSignedMaterialUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  const path = extractPath(url);
  if (!path) return url; // not a material-images URL, return as-is
  const cached = cache.get(path);
  if (cached && cached.expires > Date.now()) return cached.url;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, EXPIRES_IN);
  if (!data?.signedUrl) return url;
  cache.set(path, { url: data.signedUrl, expires: Date.now() + (EXPIRES_IN - 60) * 1000 });
  return data.signedUrl;
}

export function useSignedMaterialUrl(url: string | null | undefined): string | undefined {
  const [resolved, setResolved] = useState<string | undefined>(() => {
    const p = extractPath(url);
    return p ? undefined : url ?? undefined;
  });
  useEffect(() => {
    let cancelled = false;
    const p = extractPath(url);
    if (!p) {
      setResolved(url ?? undefined);
      return;
    }
    getSignedMaterialUrl(url).then((u) => {
      if (!cancelled) setResolved(u ?? undefined);
    });
    return () => { cancelled = true; };
  }, [url]);
  return resolved;
}

export async function signMany(urls: (string | null | undefined)[]): Promise<(string | null)[]> {
  return Promise.all(urls.map((u) => getSignedMaterialUrl(u).then((v) => v ?? null)));
}