
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Briefcase, 
  Users, 
  Building2, 
  ClipboardList, 
  ArrowRight,
  Loader2,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  projectsAPI, 
  clientsAPI, 
  employeesAPI, 
  reportsAPI 
} from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/providers/i18n-provider";

export function GlobalSearch() {
  const router = useRouter();
  const { profile } = useAuth();
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = profile?.rol === 'admin';

  const [sqlData, setSqlData] = useState<{
    projects: any[],
    clients: any[],
    employees: any[],
    reports: any[]
  }>({
    projects: [],
    clients: [],
    employees: [],
    reports: []
  });
  const [isApiLoading, setIsApiLoading] = useState(false);

  useEffect(() => {
    const loadSearchData = async () => {
      if (!profile || !isOpen) return;
      try {
        setIsApiLoading(true);
        // If admin, load everything. If not, only what's allowed.
        const [pData, clData, eData, rData] = await Promise.all([
          isAdmin ? projectsAPI.getAll() : Promise.resolve([]),
          isAdmin ? clientsAPI.getAll() : Promise.resolve([]),
          isAdmin ? employeesAPI.getAll() : Promise.resolve([]),
          reportsAPI.getAll()
        ]);

        setSqlData({
          projects: Array.isArray(pData) ? pData : [],
          clients: Array.isArray(clData) ? clData : [],
          employees: Array.isArray(eData) ? eData : [],
          reports: Array.isArray(rData) ? rData : []
        });
      } catch (e) {
        console.error("Error loading search data from SQL", e);
      } finally {
        setIsApiLoading(false);
      }
    };

    loadSearchData();
  }, [profile, isAdmin, isOpen]);

  const { projects, clients, employees, reports } = sqlData;
  const isLoading = isApiLoading;

  const results = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return null;

    const term = searchTerm.toLowerCase();

    return {
      projects: projects?.filter(p => 
        p.Pry_Nombre_Proyecto?.toLowerCase().includes(term) ||
        p.ubicacion?.toLowerCase().includes(term) ||
        p.clientName?.toLowerCase().includes(term)
      ).slice(0, 4) || [],
      
      clients: clients?.filter(c => 
        c.Cl_Nombre?.toLowerCase().includes(term) || 
        c.Cl_RazonSocial?.toLowerCase().includes(term) ||
        c.Cl_Correo?.toLowerCase().includes(term)
      ).slice(0, 4) || [],
      
      employees: employees?.filter(e => 
        (e.nombre || e.Emp_Nombre)?.toLowerCase().includes(term) || 
        (e.email || e.emailAcceso)?.toLowerCase().includes(term) ||
        e.id?.toLowerCase().includes(term)
      ).slice(0, 4) || [],
      
      reports: reports?.filter(r => 
        r.content?.toLowerCase().includes(term) || 
        r.projectName?.toLowerCase().includes(term) ||
        r.authorName?.toLowerCase().includes(term)
      ).slice(0, 4) || []
    };
  }, [searchTerm, projects, clients, employees, reports]);

  const hasResults = results && (
    results.projects.length > 0 || 
    results.clients.length > 0 || 
    results.employees.length > 0 || 
    results.reports.length > 0
  );

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative w-full max-w-md md:ml-4">
      <Popover open={isOpen && searchTerm.length >= 2} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
            <Input
              placeholder={t.common.search}
              className="pl-10 h-10 bg-muted/50 border-border focus:ring-accent w-full md:w-[300px] lg:w-[400px] transition-all rounded-full"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[300px] md:w-[450px] p-0 bg-card border-border shadow-2xl overflow-hidden rounded-2xl" 
          align="start"
          sideOffset={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
            {isLoading && (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            )}

            {!isLoading && !hasResults && (
              <div className="p-12 text-center">
                <Search className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-tighter">
                  {t.common.no_results}
                </p>
              </div>
            )}

            {!isLoading && hasResults && (
              <div className="divide-y divide-border">
                {results.projects.length > 0 && (
                  <div className="p-2">
                    <h4 className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Briefcase className="h-3 w-3 text-accent" /> {t.nav.projects}
                    </h4>
                    {results.projects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleNavigate(`/projects`)}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-accent/10 transition-all flex items-center justify-between group"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground truncate">{p.Pry_Nombre_Proyecto}</span>
                          <span className="text-[10px] text-muted-foreground truncate uppercase">{p.ubicacion}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-accent opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </button>
                    ))}
                  </div>
                )}

                {results.clients.length > 0 && isAdmin && (
                  <div className="p-2">
                    <h4 className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Building2 className="h-3 w-3 text-emerald-500" /> {t.nav.clients}
                    </h4>
                    {results.clients.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleNavigate(`/clients`)}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-500/10 transition-all flex items-center justify-between group"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-foreground truncate">{c.Cl_Nombre}</span>
                          <span className="text-[10px] text-muted-foreground truncate uppercase">{c.Cl_RazonSocial}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </button>
                    ))}
                  </div>
                )}

                {results.employees.length > 0 && isAdmin && (
                  <div className="p-2">
                    <h4 className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Users className="h-3 w-3 text-blue-500" /> {t.nav.employees}
                    </h4>
                    {results.employees.map(e => (
                      <button
                        key={e.id}
                        onClick={() => handleNavigate(`/employees`)}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-blue-500/10 transition-all flex items-center justify-between group"
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-bold text-foreground">{e.nombre || e.Emp_Nombre}</span>
                          <span className="text-[10px] text-muted-foreground truncate uppercase">{e.email || e.emailAcceso}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </button>
                    ))}
                  </div>
                )}

                {results.reports.length > 0 && (
                  <div className="p-2">
                    <h4 className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <ClipboardList className="h-3 w-3 text-orange-500" /> {t.nav.reports}
                    </h4>
                    {results.reports.map(r => (
                      <button
                        key={r.id}
                        onClick={() => handleNavigate(`/reports`)}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-orange-500/10 transition-all flex items-center justify-between group"
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] font-black text-accent uppercase tracking-tighter mb-0.5">{r.projectName}</span>
                          <span className="text-sm font-bold text-foreground truncate max-w-[300px]">{r.content}</span>
                          <span className="text-[9px] text-muted-foreground uppercase">{r.authorName}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
