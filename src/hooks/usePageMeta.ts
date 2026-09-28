import { useEffect } from "react";

const SITE = "https://eco-link-web-applicatoin.lovable.app";

interface PageMeta {
  title: string;
  description: string;
  path?: string;
  image?: string;
  jsonLd?: Record<string, unknown> | null;
}

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Sets per-page title, description, social tags, canonical and optional JSON-LD. */
export function usePageMeta({ title, description, path, image, jsonLd }: PageMeta) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : "";
  useEffect(() => {
    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    if (image) {
      setMeta("property", "og:image", image);
      setMeta("name", "twitter:image", image);
    }
    const url = `${SITE}${path ?? window.location.pathname}`;
    setMeta("property", "og:url", url);
    let canon = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canon) {
      canon = document.createElement("link");
      canon.rel = "canonical";
      document.head.appendChild(canon);
    }
    canon.href = url;

    let script: HTMLScriptElement | null = null;
    if (ld) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.pageLd = "true";
      script.text = ld;
      document.head.appendChild(script);
    }
    return () => {
      script?.remove();
    };
  }, [title, description, path, image, ld]);
}
