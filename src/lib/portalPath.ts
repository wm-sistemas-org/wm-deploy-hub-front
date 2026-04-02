/** Caminho do app para o portal público de downloads da organização (react-router). */
export function publicPortalPathForOrgSlug(orgSlug: string): string {
  const env = import.meta.env.VITE_PUBLIC_ORG_SLUG?.trim();
  if (env && env === orgSlug) return "/";
  return `/${orgSlug}`;
}
