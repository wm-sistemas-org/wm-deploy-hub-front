import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../../api/public";
import { Button } from "../../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { Download, Package, User } from "lucide-react";

interface PublicPortalProps {
  /** Slug da organização quando a raiz do site (/) é o portal (VITE_PUBLIC_ORG_SLUG). */
  orgSlugOverride?: string;
}

export function PublicPortal({ orgSlugOverride }: PublicPortalProps) {
  const { orgSlug: paramSlug } = useParams<{ orgSlug: string }>();
  const organization = (orgSlugOverride?.trim() || paramSlug?.trim() || "").trim();

  const { data: releases, isLoading, isError } = useQuery({
    queryKey: ["public", "projects", organization],
    queryFn: () => publicApi.getOrganizationReleases(organization),
    enabled: organization.length > 0,
    retry: 1,
  });

  const handleDownload = (org: string, proj: string) => {
    const url = publicApi.getDownloadUrl(org, proj);
    window.location.href = url;
  };

  if (!organization) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <p className="text-slate-600 text-center">Organização inválida ou não informada.</p>
        <Button asChild className="mt-4">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-32">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Página indisponível</h1>
        <p className="text-slate-500">Não foi possível carregar os projetos. Verifique o link fornecido.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-brand-500 selection:text-white pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-brand-600" />
              <span className="font-bold text-xl text-slate-800 tracking-tight uppercase">
                {organization.replace(/-/g, " ")}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-500 hidden sm:inline">
                Portal de Downloads
              </span>
              <Button variant="ghost" size="sm" className="text-slate-600" asChild>
                <Link to="/login">Área da equipe</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12">
        <div className="max-w-3xl mb-12">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Softwares e Soluções
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Nesta página você encontra a última versão oficial liberada para cada um dos nossos sistemas. 
            Mantenha suas aplicações sempre atualizadas para garantir o melhor desempenho e segurança.
          </p>
        </div>

        {releases?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <Package className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Nenhum sistema disponível</h3>
            <p className="text-slate-500 mt-1">A organização ainda não publicou nenhuma release.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {releases?.map((release) => (
              <Card key={release.project} className="flex flex-col overflow-hidden hover:shadow-lg transition-all border-slate-200">
                <CardHeader className="bg-white border-b border-slate-100 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl capitalize text-slate-800">{release.project.replace(/-/g, " ")}</CardTitle>
                        <CardDescription className="font-mono text-xs mt-1 px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full inline-block font-semibold">
                        v{release.version}
                        </CardDescription>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-slate-600 leading-relaxed">
                    <p className="font-medium text-slate-700 mb-1">Notas de Atualização:</p>
                    <p className="line-clamp-3 text-sm min-h-[60px] whitespace-pre-line text-slate-500">
                        {release.notes || "Nenhuma nota de atualização fornecida para esta versão."}
                    </p>
                  </div>
                  <div className="text-xs text-slate-400 mt-4 font-medium flex flex-col gap-1">
                    <span>Liberado em: {new Date(release.published_at).toLocaleDateString()}</span>
                    {release.developer && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> Dev Responsável: {release.developer}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
                  <Button 
                    className="w-full sm:w-auto gap-2 text-sm h-11 transition-transform active:scale-95"
                    onClick={() => handleDownload(release.organization, release.project)}
                  >
                    <Download className="h-4 w-4" />
                    Baixar Instalador
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
