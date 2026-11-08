import { useEffect } from "react";

export function useSeo(title: string, description: string) {
  useEffect(() => {
    document.title = `${title} | C & Pointers Academy`;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;
    window.scrollTo({ top: 0 });
  }, [title, description]);
}
