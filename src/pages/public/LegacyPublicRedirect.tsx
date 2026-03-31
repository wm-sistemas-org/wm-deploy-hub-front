import { Navigate, useParams } from "react-router-dom";

/** Compatibilidade com links antigos /public/:orgSlug */
export function LegacyPublicRedirect() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  return <Navigate to={`/${orgSlug}`} replace />;
}
