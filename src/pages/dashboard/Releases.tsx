import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { releasesApi } from "../../api/releases";
import type { ReleaseCreate } from "../../api/releases";
import { projectsApi } from "../../api/projects";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Spinner } from "../../components/ui/Spinner";
import { ArrowLeft, Rocket, UploadCloud, CheckCircle2, ChevronRight } from "lucide-react";

export function Releases() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRelease, setNewRelease] = useState<ReleaseCreate>({ version: "", version_normalized: "", release_notes: "" });
  
  const [uploadingReleaseId, setUploadingReleaseId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch Project context
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
  });
  const project = projects?.find(p => p.id === projectId);

  // Fetch Releases
  const { data: releases, isLoading } = useQuery({
    queryKey: ["releases", projectId],
    queryFn: () => releasesApi.listByProject(projectId!),
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: (data: ReleaseCreate) => releasesApi.create(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["releases", projectId] });
      setIsCreateModalOpen(false);
      setNewRelease({ version: "", version_normalized: "", release_notes: "" });
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ releaseId, file }: { releaseId: string, file: File }) => {
      return releasesApi.uploadAsset(releaseId, file, (progressEvent) => {
         const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
         setUploadProgress(percentCompleted);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["releases", projectId] });
      setUploadingReleaseId(null);
      setSelectedFile(null);
      setUploadProgress(0);
      alert("Arquivo do instalador anexado com sucesso! Agora você já pode Publicar.");
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || "Erro ao fazer upload do instalador.");
      setUploadingReleaseId(null);
      setUploadProgress(0);
    }
  });

  const publishMutation = useMutation({
    mutationFn: (releaseId: string) => releasesApi.publish(releaseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["releases", projectId] });
      alert("Release publicada com sucesso!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.detail || "Erro ao publicar a release.");
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newRelease);
  };

  const handleUpload = (releaseId: string) => {
    if (!selectedFile) return;
    if (selectedFile.size > 200 * 1024 * 1024) {
      alert("Arquivo excede 200MB");
      return;
    }
    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['exe', 'msi', 'zip'].includes(ext || '')) {
      alert("Extensão inválida (.exe, .msi, .zip)");
      return;
    }
    setUploadingReleaseId(releaseId);
    uploadMutation.mutate({ releaseId, file: selectedFile });
  };

  if (isLoading) return <div className="py-20"><Spinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 text-sm font-medium text-slate-500 mb-2">
         <Link to="/dashboard/projects" className="flex items-center hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar aos Projetos
         </Link>
         {project && (
           <>
             <ChevronRight className="h-4 w-4" />
             <span className="text-brand-700">{project.name}</span>
           </>
         )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Histórico de Releases</h1>
          <p className="text-slate-500">Gerencie as versões e uploads do projeto.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Rocket className="h-4 w-4" />
          Rascunhar Release
        </Button>
      </div>

      <div className="grid gap-6">
        {releases?.length === 0 && (
             <div className="py-12 text-center text-slate-500 border border-dashed border-slate-300 rounded-xl">
                 Nenhuma release cadastrada.
             </div>
        )}
        
        {releases?.map((release) => (
          <Card key={release.id} className={release.is_current ? "border-brand-500 shadow-sm" : ""}>
            <CardContent className="flex flex-col sm:flex-row items-center justify-between p-6 gap-6">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                   <h3 className="font-bold text-lg">v{release.version}</h3>
                   {release.is_current && (
                     <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold flex items-center gap-1">
                       <CheckCircle2 className="h-3 w-3" /> Atual
                     </span>
                   )}
                   {!release.is_published && (
                     <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                       Rascunho
                     </span>
                   )}
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{release.release_notes || "Sem notas de atualização."}</p>
                <div className="text-xs font-mono text-slate-400">Criada em: {new Date(release.created_at).toLocaleDateString()}</div>
              </div>

              <div className="w-full sm:w-auto flex flex-col sm:items-end gap-3">
                 {/* Upload form if not published and no assets usually, or allow re-upload if logic permits */}
                 {!release.is_published && (
                   <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 min-w-80">
                     {uploadingReleaseId === release.id ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-slate-600 font-medium">
                            <span>Fazendo upload...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <ProgressBar progress={uploadProgress} />
                        </div>
                     ) : (
                        <div className="flex flex-col gap-2">
                           <input 
                             type="file" 
                             accept=".exe,.msi,.zip"
                             className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                             onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                           />
                           <div className="flex justify-between mt-2">
                             <Button 
                               size="sm" 
                               variant="secondary" 
                               onClick={() => handleUpload(release.id)}
                               disabled={!selectedFile}
                               className="gap-2 w-full text-xs h-8"
                             >
                                <UploadCloud className="h-3 w-3" /> Subir Arquivo
                             </Button>
                           </div>
                        </div>
                     )}
                   </div>
                 )}

                 {/* Publish action - Assume logic verifies if it has an asset in backend, but we'll show it anyway */}
                 {!release.is_current && release.is_published === false && (
                    <div className="w-full space-y-3">
                      <p className="text-[11px] text-amber-600 bg-amber-50 p-2 rounded text-center leading-snug font-medium">
                        Atenção: Primeiro clique em <b>Subir Arquivo</b> e aguarde o final do envio antes de publicar.
                      </p>
                      <Button 
                        onClick={() => publishMutation.mutate(release.id)} 
                        isLoading={publishMutation.isPending}
                        variant="default"
                        className="w-full"
                      >
                         Publicar como Atual
                      </Button>
                    </div>
                 )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Rascunhar Nova Release</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Versão</label>
                <Input 
                  required 
                  value={newRelease.version} 
                  onChange={(e) => setNewRelease({...newRelease, version: e.target.value, version_normalized: e.target.value.replace(/[^0-9.]/g, '')})} 
                  placeholder="Ex: 1.0.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notas da Atualização</label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  value={newRelease.release_notes} 
                  onChange={(e) => setNewRelease({...newRelease, release_notes: e.target.value})} 
                  placeholder="- Correção de bugs..."
                />
              </div>
              
              {createMutation.isError && (
                 <div className="text-red-500 text-sm">Erro ao criar. Verifique se a versão já existe.</div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={createMutation.isPending}>
                  Criar Rascunho
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
