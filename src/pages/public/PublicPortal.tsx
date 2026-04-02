import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../../api/public";
import type { PublicReleaseInfo } from "../../api/public";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { Calendar, Copy, Download, HardDrive, Package, Search, Tag, User } from "lucide-react";

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

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

  const [search, setSearch] = useState("");
  const [responsibleFilter, setResponsibleFilter] = useState("");
  const [copyDone, setCopyDone] = useState(false);

  const copyPortalLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyDone(true);
      window.setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setCopyDone(false);
    }
  };

  const developers = useMemo(() => {
    const list = releases ?? [];
    const names = new Set<string>();
    for (const r of list) {
      const d = r.developer?.trim();
      if (d) names.add(d);
    }
    return [...names].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [releases]);

  const filteredReleases = useMemo(() => {
    const list = releases ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((r: PublicReleaseInfo) => {
      if (responsibleFilter) {
        const dev = (r.developer ?? "").trim();
        if (dev !== responsibleFilter) return false;
      }
      if (!q) return true;
      const label = r.project.replace(/-/g, " ").toLowerCase();
      const slug = r.project.toLowerCase();
      return label.includes(q) || slug.includes(q);
    });
  }, [releases, search, responsibleFilter]);

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
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-brand-600" />
              <span className="font-bold text-xl text-slate-800 tracking-tight uppercase">
                {organization.replace(/-/g, " ")}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-sm font-medium text-slate-500 hidden sm:inline">
                Portal de Downloads
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-slate-700 border-slate-200"
                onClick={() => void copyPortalLink()}
              >
                <Copy className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{copyDone ? "Copiado!" : "Copiar link"}</span>
                <span className="sm:hidden">{copyDone ? "Ok!" : "Copiar"}</span>
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-600" asChild>
                <Link to="/login">Área da equipe</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-12">
        {releases?.length === 0 ? (
          <>
            <div className="mb-10 max-w-3xl">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Softwares e soluções
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
                Últimas versões oficiais liberadas para download. Mantenha seus sistemas atualizados com
                desempenho e segurança.
              </p>
            </div>
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <Package className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Nenhum sistema disponível</h3>
              <p className="text-slate-500 mt-1">A organização ainda não publicou nenhuma release.</p>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] xl:items-start xl:gap-8">
              <div className="min-w-0">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  Softwares e soluções
                </h1>
                <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
                  Últimas versões oficiais liberadas para download. Use a busca e o filtro à direita para
                  localizar o instalador.
                </p>
              </div>
              <div className="shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-[4.5rem] xl:z-20 xl:shadow-md">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Buscar e filtrar
                </p>
                <div className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="portal-search" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Projeto
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="portal-search"
                        type="search"
                        placeholder="Nome ou identificador..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="portal-responsible" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Responsável pela release
                    </label>
                    <select
                      id="portal-responsible"
                      value={responsibleFilter}
                      onChange={(e) => setResponsibleFilter(e.target.value)}
                      disabled={developers.length === 0}
                      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                    >
                      <option value="">Todos</option>
                      {developers.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    {developers.length === 0 && (
                      <p className="mt-1 text-xs text-slate-500">Sem responsável informado nas releases.</p>
                    )}
                  </div>
                  {(search || responsibleFilter) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setSearch("");
                        setResponsibleFilter("");
                      }}
                    >
                      Limpar filtros
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <p className="mb-4 text-sm text-slate-600">
              Mostrando{" "}
              <span className="font-semibold text-slate-800">{filteredReleases.length}</span>
              {releases && releases.length !== filteredReleases.length && (
                <> de <span className="font-semibold text-slate-800">{releases.length}</span></>
              )}{" "}
              sistema{filteredReleases.length !== 1 ? "s" : ""}
            </p>

            {filteredReleases.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                <Search className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                <h3 className="text-lg font-medium text-slate-900">Nenhum resultado</h3>
                <p className="text-slate-500 mt-1 text-sm max-w-md mx-auto">
                  Ajuste a busca ou o filtro de responsável. Nenhum projeto corresponde aos critérios atuais.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredReleases.map((release) => {
                  const displayName = release.project.replace(/-/g, " ");
                  const pub = new Date(release.published_at);
                  return (
                    <Card
                      key={release.project}
                      className="group flex h-full flex-col overflow-hidden border-slate-200/90 transition-all hover:border-brand-300/80 hover:shadow-md"
                    >
                      <div className="flex flex-1 flex-col p-4 sm:p-4">
                        <div className="flex gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-50 to-emerald-50 text-brand-700 ring-1 ring-brand-100">
                            <Package className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-semibold capitalize leading-snug text-slate-900 line-clamp-2">
                              {displayName}
                            </h3>
                            <p
                              className="mt-0.5 truncate font-mono text-[11px] text-slate-500"
                              title={release.project}
                            >
                              {release.project}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center rounded-md bg-brand-600 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                            v{release.version}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            <Calendar className="h-3 w-3 text-slate-500" />
                            {pub.toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {typeof release.file_size_bytes === "number" && release.file_size_bytes > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600">
                              <HardDrive className="h-3 w-3 shrink-0 text-slate-400" />
                              {formatBytes(release.file_size_bytes)}
                            </span>
                          )}
                        </div>

                        <dl className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 text-xs">
                          <div className="flex items-start gap-2">
                            <dt className="flex shrink-0 items-center gap-1 font-medium text-slate-500">
                              <Tag className="h-3.5 w-3.5" />
                              Org.
                            </dt>
                            <dd className="truncate font-mono text-slate-700" title={release.organization}>
                              {release.organization}
                            </dd>
                          </div>
                          <div className="flex items-start gap-2">
                            <dt className="flex shrink-0 items-center gap-1 font-medium text-slate-500">
                              <User className="h-3.5 w-3.5" />
                              Resp.
                            </dt>
                            <dd className="line-clamp-2 min-h-[2.25rem] text-slate-700">
                              {release.developer?.trim() || (
                                <span className="text-slate-400">Não informado</span>
                              )}
                            </dd>
                          </div>
                        </dl>

                        <div className="mt-3 flex-1 border-t border-slate-100 pt-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Notas da versão
                          </p>
                          <p className="mt-1 line-clamp-4 text-[13px] leading-relaxed text-slate-600 whitespace-pre-line">
                            {release.notes?.trim() || (
                              <span className="text-slate-400">Sem notas para esta versão.</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 bg-slate-50/90 p-3">
                        <Button
                          className="h-10 w-full gap-2 text-sm font-semibold shadow-sm transition-transform active:scale-[0.98]"
                          onClick={() => handleDownload(release.organization, release.project)}
                        >
                          <Download className="h-4 w-4" />
                          Baixar instalador
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
