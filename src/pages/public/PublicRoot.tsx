import { PublicPortal } from "./PublicPortal";
import { PublicHome } from "./PublicHome";

/** Raiz do site: portal da org padrão (env) ou página explicativa. */
export function PublicRoot() {
  const slug = import.meta.env.VITE_PUBLIC_ORG_SLUG?.trim();
  if (slug) {
    return <PublicPortal orgSlugOverride={slug} />;
  }
  return <PublicHome />;
}
