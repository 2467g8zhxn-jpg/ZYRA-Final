
// @ts-nocheck
"use client";

import { useState, useMemo, useRef, Suspense, useEffect } from "react";
import {
  Briefcase,
  Check,
  X,
  Clock,
  MapPin,
  Building2,
  Hash,
  Search,
  ArrowLeft,
  Zap,
  Wrench,
  AlertCircle,
  FileText,
  Plus,
  Users,
  CalendarDays,
  ImagePlus,
  Trash2,
  Loader2,
  Download,
  Eye,
  Camera,
  Edit3
} from "lucide-react";
import DashboardLayout from "../dashboard/layout";
import { format, isValid } from "date-fns";
import { es, enUS, zhCN } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { recordAction } from "@/lib/gamification";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/components/providers/i18n-provider";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
// @ts-nocheck
import { projectsAPI, reportesAPI, equiposAPI } from "@/lib/api-client";

function ReportsContent() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAdmin = profile?.rol === 'admin';

  const projectIdParam = searchParams.get("projectId");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  
  // Edit State
  const [editMode, setEditMode] = useState(false);
  const [editComentarios, setEditComentarios] = useState("");
  const [editPhoto, setEditPhoto] = useState<{name: string, dataUrl: string} | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const [sqlReports, setSqlReports] = useState<any[]>([]);
  const [sqlProjects, setSqlProjects] = useState<any[]>([]);
  const [sqlTeams, setSqlTeams] = useState<any[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(true);

  const loadSqlData = async () => {
    try {
      setIsApiLoading(true);
      const [rData, pData, tData] = await Promise.all([
        reportesAPI.getAll(),
        projectsAPI.getAll(),
        equiposAPI.getAll()
      ]);
      setSqlReports(Array.isArray(rData) ? rData : []);
      setSqlProjects(Array.isArray(pData) ? pData : []);
      setSqlTeams(Array.isArray(tData) ? tData : []);
    } catch (e) {
      console.error("Error loading SQL reports data", e);
    } finally {
      setIsApiLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      loadSqlData();
    }
  }, [profile]);

  // Filtrado de reportes
  const filteredReports = useMemo(() => {
    let reports = sqlReports || [];

    // Filtrar por proyecto si viene de la URL
    if (projectIdParam) {
      reports = reports.filter(r => r.ID_Proyecto === parseInt(projectIdParam));
    }

    return reports.filter(report => {
      const content = report.Comentarios || "";
      const author = report.proyecto?.cliente?.Nombre || "S/A"; // Or employee name if available
      const project = report.proyecto?.Nombre_Proyecto || "";
      const matchesSearch = content.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           project.toLowerCase().includes(searchTerm.toLowerCase());
      const currentStatus = report.estado || "Pendiente";
      const matchesFilter = activeFilter === "Todos" || currentStatus === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [sqlReports, searchTerm, activeFilter, projectIdParam]);

  const selectedReport = useMemo(() => sqlReports?.find(r => r.ID_Reporte === parseInt(selectedReportId || "0")), [sqlReports, selectedReportId]);
  const linkedProject = useMemo(() => selectedReport?.proyecto, [selectedReport]);
  const linkedTeam = useMemo(() => selectedReport?.equipo, [selectedReport]);

  // Resumen del proyecto si se filtra por uno solo
  const currentProject = useMemo(() => sqlProjects?.find(p => p.ID_Proyecto === parseInt(projectIdParam || "0")), [sqlProjects, projectIdParam]);

  const handleUpdateStatus = async (reportId: string, newStatus: "Aprobado" | "Rechazado") => {
    if (!isAdmin) return;
    setProcessingId(reportId);
    try {
      await reportesAPI.update(reportId, { estado: newStatus });

      // Buscar el reporte en la lista para tener los datos frescos (ID_Proyecto, ID_Empleado)
      const report = sqlReports.find(r => r.ID_Reporte.toString() === reportId.toString());

      if (newStatus === "Aprobado" && report && report.ID_Proyecto) {
         try {
            await projectsAPI.update(report.ID_Proyecto.toString(), {
              Estado: "Finalizado",
              Progreso: 100,
              Fecha_Fin: new Date().toISOString()
            });

            // Dar medallas/puntos al empleado que hizo el reporte
            let targetEmployeeId = report.ID_Empleado;
            
            // Si el reporte no tiene empleado (reportes antiguos), buscamos al primer técnico del equipo
            if (!targetEmployeeId && report.ID_Equipo) {
               try {
                  const teamData = await usersAPI.getAll(); // En este proyecto, parece que los técnicos se listan aquí o en empleados
                  const allEmps = await employeesAPI.getAll();
                  const teamEmp = allEmps.find((e: any) => e.ID_Equipo === report.ID_Equipo);
                  if (teamEmp) targetEmployeeId = teamEmp.ID_Empleado;
               } catch (e) { console.warn("No se pudo autodetectar empleado", e); }
            }

            if (targetEmployeeId) {
              await recordAction(targetEmployeeId.toString(), "PROJECT_COMPLETED");
            }
         } catch(e) {
            console.error("Error updating project / gamification:", e);
         }
      } else if (newStatus === "Rechazado" && report && report.ID_Proyecto) {
         try {
            await projectsAPI.update(selectedReport.ID_Proyecto.toString(), {
              Estado: "Rechazado"
            });
         } catch(e) {
            console.error("Error updating project status:", e);
         }
      }

      toast({ title: t.common.success });
      setSelectedReportId(null);
      loadSqlData();
    } catch (e: any) {
      toast({ variant: "destructive", title: t.common.error });
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    if (selectedReportId && selectedReport) {
      setEditMode(false);
      setEditComentarios(selectedReport.Comentarios || "");
      setEditPhoto(null);
    }
  }, [selectedReportId, selectedReport]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setEditPhoto({ name: file.name, dataUrl: event.target.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResubmitReport = async () => {
    if (!selectedReportId) return;
    setProcessingId(selectedReportId);
    try {
      const payload: any = {
        Comentarios: editComentarios,
        estado: "Pendiente"
      };
      if (editPhoto) {
        payload.Evidencias_URL = editPhoto.dataUrl;
      }
      await reportesAPI.update(selectedReportId, payload);
      toast({ title: t.common.success, description: "Reporte reenviado exitosamente." });
      setEditMode(false);
      setSelectedReportId(null);
      loadSqlData();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteReport = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se abra el detalle
    if (!isAdmin) return;
    if (!confirm("¿Estás seguro de que deseas eliminar este reporte?")) return;

    setProcessingId(reportId);
    try {
      // Obtener datos del reporte antes de borrarlo para saber de qué proyecto es
      const reportToDelete = sqlReports.find(r => r.ID_Reporte.toString() === reportId.toString());

      await reportesAPI.delete(reportId);
      
      // Si el reporte pertenecía a un proyecto, regresamos el proyecto a "Activo" para que puedan volver a Iniciar Día
      if (reportToDelete && reportToDelete.ID_Proyecto) {
         await projectsAPI.update(reportToDelete.ID_Proyecto.toString(), {
           Estado: "Activo"
         });
      }

      toast({ title: t.common.success, description: "Reporte eliminado y proyecto reiniciado." });
      loadSqlData();
    } catch (e: any) {
      toast({ variant: "destructive", title: t.common.error });
    } finally {
      setProcessingId(null);
    }
  };

  const getLocale = () => {
    if (language === 'en') return enUS;
    if (language === 'zh') return zhCN;
    return es;
  };

  const formatDate = (dateStr: any, pattern: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return isValid(date) ? format(date, pattern, { locale: getLocale() }) : "-";
  };

  const clearProjectFilter = () => {
    router.push('/reports');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-body">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight text-foreground font-headline flex items-center gap-3">
            {projectIdParam && (
              <Button variant="ghost" size="icon" onClick={clearProjectFilter} className="h-10 w-10 rounded-full hover:bg-muted">
                <ArrowLeft className="h-6 w-6 text-accent" />
              </Button>
            )}
            {isAdmin ? t.reports.title_admin : t.reports.title_op}
          </h2>
          <p className="text-muted-foreground">{isAdmin ? t.reports.subtitle_admin : t.reports.subtitle_op}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4">
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full lg:w-auto">
          <TabsList className="bg-muted border border-border p-1">
            {["Todos", "Pendiente", "Aprobado", "Rechazado"].map((tab) => (
              <TabsTrigger key={tab} value={tab} className="text-xs font-semibold px-4">
                {tab === 'Todos' ? t.reports.all : tab === 'Pendiente' ? t.reports.pending : tab === 'Aprobado' ? t.reports.approved : t.reports.rejected}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t.common.search}
            className="pl-10 bg-muted/50 border-border h-10 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isApiLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
          {filteredReports.map((report) => (
            <div
              key={report.ID_Reporte}
              onClick={() => setSelectedReportId(report.ID_Reporte.toString())}
              className="bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-accent/40 transition-all flex flex-col shadow-xl group"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image src={report.Evidencias_URL || "https://picsum.photos/seed/solar-report/800/600"} alt="" fill className="object-cover" />
                <div className="absolute top-3 right-3">
                  <Badge className={cn("font-bold text-[10px]", report.estado === "Aprobado" ? "bg-emerald-500" : report.estado === "Rechazado" ? "bg-red-500" : "bg-yellow-500")}>
                    {(report.estado || "Pendiente").toUpperCase()}
                  </Badge>
                </div>
                {isAdmin && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute bottom-3 right-3 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => handleDeleteReport(report.ID_Reporte.toString(), e)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-accent">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider truncate">{report.proyecto?.Nombre_Proyecto}</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{report.Comentarios || "-"}</p>
                </div>
                {report.equipo?.Nombre_Equipo && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span className="text-[10px] font-medium truncate">{report.equipo.Nombre_Equipo}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-4 border-t border-border">
                  <span className="font-bold text-foreground/70 truncate">SQL Report</span>
                  <span>{formatDate(report.Fecha_Reporte, "d/M/yyyy")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <FileText className="h-16 w-16 text-muted-foreground/20 mb-4" />
          <h3 className="text-lg font-bold text-foreground uppercase tracking-tighter">{t.common.no_results}</h3>
          <p className="text-sm text-muted-foreground mt-2">No se encontraron reportes que coincidan con los filtros aplicados.</p>
        </div>
      )}

      {/* ====== VIEW REPORT DETAIL DIALOG ====== */}
      <Dialog open={!!selectedReportId} onOpenChange={(open) => !open && setSelectedReportId(null)}>
        <DialogContent className="w-[95vw] bg-card border-border text-foreground sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-accent flex items-center gap-2">
                  <Briefcase className="h-6 w-6" /> {selectedReport.proyecto?.Nombre_Proyecto || "Auditoría de Reporte"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">{t.reports.audit_detail}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Project + Team Info Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-3">
                    <h4 className="text-[10px] font-bold uppercase text-accent tracking-widest">Datos del Proyecto</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-3.5 w-3.5 text-accent" />
                        <span className="font-semibold text-foreground">{selectedReport.proyecto?.Nombre_Proyecto || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-accent" />
                        <span>{selectedReport.proyecto?.Ubicacion || "-"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5 text-accent" />
                        <span>{formatDate(selectedReport.Fecha_Reporte, "PPP")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-xl border border-border space-y-3">
                    <h4 className="text-[10px] font-bold uppercase text-accent tracking-widest">Equipo Responsable</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-3.5 w-3.5 text-accent" />
                        <span className="font-semibold text-foreground">{selectedReport.equipo?.Nombre_Equipo || "Sin equipo"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Wrench className="h-3.5 w-3.5 text-accent" />
                        <span>Tipo: {selectedReport.equipo?.Tipo || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Hash className="h-3.5 w-3.5 text-accent" />
                        <span>ID Reporte: {selectedReport.ID_Reporte}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Report Content */}
                <div className="bg-muted/30 p-4 rounded-xl border border-border">
                  <h4 className="text-xs font-bold uppercase text-accent mb-3">{t.reports.description}</h4>
                  {editMode ? (
                    <Textarea 
                      value={editComentarios} 
                      onChange={(e) => setEditComentarios(e.target.value)} 
                      className="min-h-[100px]"
                    />
                  ) : (
                    <p className="text-sm leading-relaxed">{selectedReport.Comentarios || "-"}</p>
                  )}
                </div>

                {/* Potentially multiple photos or single URL */}
                <div className="space-y-2">
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-border shadow-inner">
                    <Image src={editPhoto?.dataUrl || selectedReport.Evidencias_URL || "https://picsum.photos/seed/solar-report/800/600"} alt="" fill className="object-cover" />
                  </div>
                  {editMode && (
                    <div className="flex justify-end">
                      <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                      <Button variant="outline" size="sm" onClick={() => photoInputRef.current?.click()}>
                        <Camera className="h-4 w-4 mr-2" /> Cambiar Foto
                      </Button>
                    </div>
                  )}
                </div>

                {/* Metadata footer */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
                  <Badge variant="outline" className="text-[9px] font-bold">Proyecto: {selectedReport.proyecto?.Nombre_Proyecto}</Badge>
                  <Badge variant="outline" className="text-[9px] font-bold">Fecha: {formatDate(selectedReport.Fecha_Reporte, "PPP")}</Badge>
                  <Badge variant="outline" className={cn("text-[9px] font-bold", selectedReport.estado === "Aprobado" ? "border-emerald-500/50 text-emerald-500" : selectedReport.estado === "Rechazado" ? "border-red-500/50 text-red-500" : "border-yellow-500/50 text-yellow-500")}>
                    {(selectedReport.estado || "Pendiente").toUpperCase()}
                  </Badge>
                </div>

                {/* Admin Approve/Reject */}
                {isAdmin && (selectedReport.estado === "Pendiente" || !selectedReport.status) && (
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 font-bold" onClick={() => handleUpdateStatus(selectedReport.ID_Reporte.toString(), "Aprobado")}>{t.reports.approve_btn}</Button>
                    <Button variant="destructive" className="flex-1 font-bold" onClick={() => handleUpdateStatus(selectedReport.ID_Reporte.toString(), "Rechazado")}>{t.reports.reject_btn}</Button>
                  </div>
                )}

                {/* Operator Edit/Resubmit for Rejected Reports */}
                {!isAdmin && selectedReport.estado === "Rechazado" && (
                  <div className="pt-4 border-t border-border flex flex-col gap-3">
                    {editMode ? (
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setEditMode(false)}>Cancelar</Button>
                        <Button className="flex-1 bg-accent hover:bg-accent/90 text-white font-bold" onClick={handleResubmitReport} disabled={processingId === selectedReportId}>
                          {processingId === selectedReportId ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                          Reenviar Reporte
                        </Button>
                      </div>
                    ) : (
                      <Button className="w-full bg-accent hover:bg-accent/90 text-white font-bold" onClick={() => setEditMode(true)}>
                        <Edit3 className="h-4 w-4 mr-2" /> Corregir Reporte
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div></div>}>
        <ReportsContent />
      </Suspense>
    </DashboardLayout>
  );
}
