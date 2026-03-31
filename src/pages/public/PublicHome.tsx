import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { Button } from "../../components/ui/Button";

/**
 * Exibido em / quando VITE_PUBLIC_ORG_SLUG não está definido.
 */
export function PublicHome() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-brand-600" />
            <span className="font-bold text-slate-800">WM Deploy Hub</span>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Acesso da equipe</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-4 py-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Portal de instaladores
        </h1>
        <p className="mt-4 text-slate-600 leading-relaxed">
          Para baixar softwares liberados, use o endereço indicado pela sua organização
          (por exemplo o nome da empresa no final da URL). Se você é da equipe que publica
          atualizações, entre pela área de gestão.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/login">Entrar na área de gestão</Link>
          </Button>
        </div>
        <p className="mt-12 text-xs text-slate-400">
          Administradores: configure <code className="rounded bg-slate-100 px-1">VITE_PUBLIC_ORG_SLUG</code>{" "}
          no build para abrir o portal de uma organização diretamente na página inicial.
        </p>
      </main>
    </div>
  );
}
