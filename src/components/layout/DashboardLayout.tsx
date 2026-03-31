import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderIcon, 
  LogOut, 
  Menu,
  X,
  Package
} from "lucide-react";
import { cn } from "../../lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  onLogout: () => void;
  userName: string;
}

export function DashboardLayout({ children, onLogout, userName }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projetos", href: "/dashboard/projects", icon: FolderIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-40 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-slate-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white pb-4 pt-5 shadow-xl">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Package className="h-8 w-8 text-brand-600" />
              <span className="font-bold text-xl text-slate-800">WM Hub</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-slate-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-5 h-0 flex-1 overflow-y-auto">
            <nav className="space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href) && 
                                (item.href === "/dashboard" ? location.pathname === "/dashboard" : true);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      "group flex items-center rounded-md px-2 py-2 text-base font-medium"
                    )}
                  >
                    <item.icon className={cn(isActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-500", "mr-4 h-6 w-6")} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-slate-200 bg-white pt-5 pb-4">
          <div className="flex items-center flex-shrink-0 px-4 gap-3">
             <div className="bg-brand-100 p-1.5 rounded-lg">
                <Package className="h-6 w-6 text-brand-600" />
             </div>
             <span className="font-bold text-xl tracking-tight text-slate-900">WM Deploy</span>
          </div>
          <div className="mt-8 flex flex-1 flex-col">
            <nav className="flex-1 space-y-1 px-3">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href) && 
                                (item.href === "/dashboard" ? location.pathname === "/dashboard" : true);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      isActive ? "bg-brand-50 text-brand-700 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                    )}
                  >
                    <item.icon className={cn(isActive ? "text-brand-600" : "text-slate-400 group-hover:text-slate-500", "mr-3 h-5 w-5 flex-shrink-0")} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-slate-200 p-4">
            <div className="group block w-full flex-shrink-0">
              <div className="flex items-center">
                <div className="inline-block h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold uppercase">
                   {userName.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-700">{userName}</p>
                </div>
                <button onClick={onLogout} className="ml-auto text-slate-400 hover:text-red-500 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow-sm lg:hidden border-b border-slate-200">
          <button
            type="button"
            className="border-r border-slate-200 px-4 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4">
             <div className="flex flex-1 items-center">
                <span className="font-semibold text-lg text-slate-800">WM Deploy Hub</span>
             </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
