import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../../api/public";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { Download, Package2, ShieldCheck, Clock } from "lucide-react";

export function PublicDownload() {
  const { orgSlug, projectSlug } = useParams<{ orgSlug: string, projectSlug: string }>();

  const { data: info, isLoading, isError } = useQuery({
    queryKey: ["publicRelease", orgSlug, projectSlug],
    queryFn: () => publicApi.getLatestReleaseInfo(orgSlug!, projectSlug!),
    enabled: !!orgSlug && !!projectSlug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (isError || !info) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="mx-auto bg-red-100 text-red-600 rounded-full h-16 w-16 mb-6 flex items-center justify-center">
             <Package2 className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Instalador Indisponível</h2>
          <p className="text-slate-500">Não encontramos nenhuma versão pública liberada para este projeto no momento.</p>
        </div>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, dm = 2, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const downloadUrl = publicApi.getDownloadUrl(orgSlug!, projectSlug!);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
           
           <div className="bg-gradient-to-br from-brand-600 to-brand-800 p-8 sm:p-12 text-center text-white">
             <div className="mx-auto bg-white/20 backdrop-blur-sm rounded-2xl h-20 w-20 mb-6 flex items-center justify-center border border-white/30">
               <Download className="h-10 w-10 text-white" />
             </div>
             <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
               Download {info.project}
             </h1>
             <p className="text-brand-100 text-lg max-w-xl mx-auto">
               Você está prestes a baixar a versão mais recente e segura do instalador oficial disponibilizado por {info.organization.toUpperCase()}.
             </p>
           </div>

           <div className="p-8 sm:p-12">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10">
               
               <div className="flex items-start gap-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-xl shrink-0">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Versão Estável</h3>
                    <p className="text-slate-500 mt-1">Versão v{info.version}</p>
                  </div>
               </div>

               <div className="flex items-start gap-4">
                  <div className="bg-purple-50 text-purple-600 p-3 rounded-xl shrink-0">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Atualizada em</h3>
                    <p className="text-slate-500 mt-1">{new Date(info.published_at).toLocaleDateString()}</p>
                  </div>
               </div>

               {typeof info.file_size_bytes === "number" && info.file_size_bytes > 0 && (
               <div className="flex items-start gap-4">
                  <div className="bg-slate-100 text-slate-600 p-3 rounded-xl shrink-0">
                    <Package2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Tamanho Original</h3>
                    <p className="text-slate-500 mt-1">{formatBytes(info.file_size_bytes)}</p>
                  </div>
               </div>
               )}

             </div>

             {info.notes && (
                <div className="mb-10 bg-slate-50 rounded-2xl p-6 border border-slate-200">
                   <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">Notas da Atualização</h3>
                   <div className="text-slate-600 whitespace-pre-wrap text-sm leading-relaxed">
                     {info.notes}
                   </div>
                </div>
             )}

             <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Button 
                 size="lg" 
                 className="h-14 px-8 text-lg font-semibold shadow-lg shadow-brand-500/30 hover:scale-[1.02] transition-transform w-full sm:w-auto"
                 asChild
               >
                 <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                   <Download className="mr-3 h-5 w-5" />
                   Baixar Instalador Seguramente
                 </a>
               </Button>
             </div>
             <p className="text-center text-xs text-slate-400 mt-6">
               Ao baixar, seu IP será registrado temporariamente no hub para fins de segurança e estatísticas corporativas da WM.
             </p>
           </div>

        </div>
      </div>
    </div>
  );
}
