import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../../api/projects";
import type { ProjectCreate } from "../../api/projects";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Spinner } from "../../components/ui/Spinner";
import { FolderIcon, Plus, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";

export function Projects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", slug: "", description: "" });

  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (data: ProjectCreate) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsCreateModalOpen(false);
      setNewProject({ name: "", slug: "", description: "" });
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    createMutation.mutate({
      ...newProject,
      organization_id: user.organization_id, // We inject the org directly from Context
    });
  };

  // Helper to slugify names automatically
  const handleNameChange = (val: string) => {
    setNewProject({ 
        ...newProject, 
        name: val, 
        slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') 
    });
  };

  if (isLoading) return <div className="py-20"><Spinner /></div>;
  if (isError) return <div className="text-red-500 p-8">Erro ao carregar projetos.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Projetos</h1>
          <p className="text-slate-500">Gerencie todos os sistemas e módulos da organização.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects?.length === 0 && (
             <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-300 rounded-xl">
                 Nenhum projeto encontrado. Crie seu primeiro projeto acima!
             </div>
        )}
        {projects?.map((project) => (
          <Card key={project.id} className="flex flex-col hover:border-brand-300 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                 <div className="bg-brand-50 p-2 rounded-lg">
                    <FolderIcon className="h-6 w-6 text-brand-600" />
                 </div>
                 <div className="flex gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link to={`/dashboard/projects/${project.id}/releases`}>
                            <Settings2 className="h-4 w-4 text-slate-400 hover:text-slate-700" />
                        </Link>
                    </Button>
                 </div>
              </div>
              <CardTitle className="mt-4">{project.name}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-10 mt-1">
                {project.description || "Sem descrição."}
              </CardDescription>
            </CardHeader>
            <div className="flex-1"></div>
            <CardContent className="border-t border-slate-100 pt-4 mt-4">
               <div className="flex justify-between items-center text-xs text-slate-500">
                  <span className="font-mono bg-slate-100 px-2 py-1 rounded">/{project.slug}</span>
                  <span>{project.is_active ? "Ativo" : "Inativo"}</span>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Criar Novo Projeto</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Projeto</label>
                <Input 
                  required 
                  value={newProject.name} 
                  onChange={(e) => handleNameChange(e.target.value)} 
                  placeholder="Ex: ERP Cloud"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug da URL</label>
                <Input 
                  required 
                  value={newProject.slug} 
                  onChange={(e) => setNewProject({...newProject, slug: e.target.value})} 
                  placeholder="erp-cloud"
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <Input 
                  value={newProject.description} 
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})} 
                  placeholder="Sistema de gestão principal..."
                />
              </div>
              
              {createMutation.isError && (
                 <div className="text-red-500 text-sm">Erro ao criar projeto. Verifique se o slug já existe.</div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={createMutation.isPending}>
                  Criar Projeto
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
