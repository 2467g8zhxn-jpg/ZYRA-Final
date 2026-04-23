// @ts-nocheck
"use client";

import DashboardLayout from "../dashboard/layout";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Plus,
  Camera,
  Loader2,
  Users,
  ClipboardList,
  Building2,
  Trash2,
  Settings2,
  CheckCircle2,
  X,
  Search
} from "lucide-react";
import Image from "next/image";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { aiReportDraftingAssistant } from "@/ai/flows/ai-report-drafting-assistant-flow";
import { useI18n } from "@/components/providers/i18n-provider";
import { useRouter } from "next/navigation";
import {
  projectsAPI,
  equiposAPI,
  clientsAPI,
  checklistsServicioAPI,
  materialesAPI,
  reportesAPI,
  employeesAPI
} from "@/lib/api-client";

export default function ProjectsPage() {
  const { profile, user, loading: isUserLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useI18n();
  const isAdmin = profile?.rol === 'admin';

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAiDrafting, setIsAiDrafting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // --- Admin Project Management State ---
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [managedProject, setManagedProject] = useState<any>(null);
  const [managedStatus, setManagedStatus] = useState("");
  const [managedProgress, setManagedProgress] = useState(0);
  const [managedTeamId, setManagedTeamId] = useState("no-team");
  const [managedUbicacion, setManagedUbicacion] = useState("");
  const [savingManage, setSavingManage] = useState(false);

  // --- Operator / Report State ---
  const [newProject, setNewProject] = useState({
    Pry_Nombre_Proyecto: "",
    clientId: "",
    serviceType: "Instalación",
    assignedTeamId: "no-team",
    addressType: "client" as "client" | "custom",
    customAddress: "",
    imageUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=2070&auto=format&fit=crop"
  });

  const [reportContent, setReportContent] = useState("");
  const [reportPhotos, setReportPhotos] = useState<{ name: string; dataUrl: string }[]>([]);
  const [opProjectMaterials, setOpProjectMaterials] = useState<any[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // --- SQL Data State ---
  const [checklistTemplates, setChecklistTemplates] = useState<any[]>([]);
  const [sqlProjects, setSqlProjects] = useState<any[]>([]);
  const [sqlTeams, setSqlTeams] = useState<any[]>([]);
  const [sqlClients, setSqlClients] = useState<any[]>([]);
  const [sqlReports, setSqlReports] = useState<any[]>([]);
  const [rejectedReportId, setRejectedReportId] = useState<number | null>(null);
  const [isApiLoading, setIsApiLoading] = useState(true);

  const loadSqlData = async () => {
    try {
      setIsApiLoading(true);
      const [pDataRaw, tDataRaw, clDataRaw, ctDataRaw, rDataRaw] = await Promise.all([
        projectsAPI.getAll(),
        equiposAPI.getAll(),
        clientsAPI.getAll(),
        checklistsServicioAPI.getAll(),
        reportesAPI.getAll()
      ]);

      setSqlProjects(Array.isArray(pDataRaw) ? pDataRaw : (pDataRaw as any)?.data || []);
      setSqlTeams(Array.isArray(tDataRaw) ? tDataRaw : (tDataRaw as any)?.data || []);
      setSqlClients(Array.isArray(clDataRaw) ? clDataRaw : (clDataRaw as any)?.data || []);
      setChecklistTemplates(Array.isArray(ctDataRaw) ? ctDataRaw : (ctDataRaw as any)?.data || []);
      setSqlReports(Array.isArray(rDataRaw) ? rDataRaw : (rDataRaw as any)?.data || []);
    } catch (e) {
      console.error("Error loading SQL data", e);
    } finally {
      setIsApiLoading(false);
    }
  };

  useEffect(() => {
    if (!isUserLoading && profile) {
      loadSqlData();
    }
  }, [isUserLoading, profile]);

  const filteredProjects = useMemo(() => {
    return sqlProjects.filter((p: any) => {
      const matchesSearch = searchTerm === "" ||
        p.Nombre_Proyecto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cliente?.Nombre?.toLowerCase().includes(searchTerm.toLowerCase());
      const isStatusMatch = statusFilter === "all" || p.Estado === statusFilter;
      return matchesSearch && isStatusMatch;
    });
  }, [sqlProjects, searchTerm, statusFilter]);

  // --- Handlers ---
  const handleCreateProject = async () => {
    if (!isAdmin || !user) return;
    setLoading(true);
    try {
      const payload = {
        Nombre_Proyecto: newProject.Pry_Nombre_Proyecto,
        ID_Cliente: parseInt(newProject.clientId),
        ID_Equipo: newProject.assignedTeamId === 'no-team' ? null : parseInt(newProject.assignedTeamId),
        Tipo_Servicio: newProject.serviceType,
        Ubicacion: newProject.addressType === 'client'
          ? sqlClients?.find(c => c.ID_Cliente.toString() === newProject.clientId)?.Direccion || ""
          : newProject.customAddress,
        Estado: "Pendiente",
        Progreso: 0,
        Imagen_Url: newProject.imageUrl,
        Fecha_Inicio: new Date().toISOString()
      };

      const createdProject = await projectsAPI.create(payload);

      // Auto-assign materials from template
      if (checklistTemplates.length > 0 && createdProject?.ID_Proyecto) {
        const serviceType = (newProject.serviceType || "").toLowerCase();
        const template = checklistTemplates.find(c =>
          (c.Nombre || "").toLowerCase().includes(serviceType) ||
          (c.servicio?.Tipo || "").toLowerCase() === serviceType
        ) || checklistTemplates[0];

        if (template?.materiales) {
          const initialMaterials = template.materiales.map((m: any) => ({
            ID_Material: m.ID_Material || m.id,
            name: m.Nombre_Material || m.name || "Material",
            quantity: m.Cantidad_Requerida || m.quantity || 1,
            done: false,
            takenQuantity: m.Cantidad_Requerida || m.quantity || 1,
            Stock_Disponible: m.Stock_Disponible || 0
          }));
          // En SQL, los materiales se manejan a través de Checklists
          // @ts-ignore
          await projectsAPI.update(createdProject.ID_Proyecto.toString(), {
            ID_Servicio: template.ID_Servicio || ID_Servicio,
            materiales: initialMaterials
          });
        }
      }

      toast({ title: t.common.success, description: "Proyecto creado y materiales asignados." });
      setIsCreateDialogOpen(false);
      loadSqlData();
    } catch (e: any) {
      if (e.message === 'OFFLINE_SAVED') {
        toast({ title: "Proyecto guardado localmente", description: "Se sincronizará cuando recuperes conexión." });
        setIsCreateDialogOpen(false);
        return;
      }
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (!isAdmin || !user) return;
    setLoading(true);
    try {
      await projectsAPI.delete(projectId.toString());
      toast({ title: t.common.success, description: t.common.delete });
      loadSqlData();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const openManageDialog = (project: any) => {
    setManagedProject(project);
    setManagedStatus(project.Estado || "Pendiente");
    setManagedProgress(project.Progreso || 0);
    setManagedTeamId(project.ID_Equipo?.toString() || "no-team");
    setManagedUbicacion(project.Ubicacion || "");
    setIsManageDialogOpen(true);
  };

  const handleSaveManagement = async () => {
    if (!user || !managedProject) return;
    setSavingManage(true);
    try {
      const payload: any = {
        Estado: managedStatus,
        Progreso: managedStatus === 'Finalizado' ? 100 : managedProgress,
        ID_Equipo: managedTeamId === 'no-team' ? null : parseInt(managedTeamId),
        Ubicacion: managedUbicacion || null,
        ...(managedStatus === 'Finalizado' && { Fecha_Fin: new Date().toISOString() })
      };
      await projectsAPI.update(managedProject.ID_Proyecto.toString(), payload);
      toast({ title: t.common.success });
      setIsManageDialogOpen(false);
      loadSqlData();
    } catch (e: any) {
      if (e.message === 'OFFLINE_SAVED') {
        toast({ title: "Cambios guardados localmente", description: "Se sincronizarán al recuperar señal." });
        setIsManageDialogOpen(false);
        return;
      }
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSavingManage(false);
    }
  };

  async function handleToggleOpMaterial(project: any, idx: number) {
    const currentMaterials = [...opProjectMaterials];
    if (currentMaterials[idx]) {
      const mat = currentMaterials[idx];
      mat.done = !mat.done;
      if (mat.done && (!mat.takenQuantity || mat.takenQuantity === 0)) {
        mat.takenQuantity = mat.quantity || 1;
      }
    }
    setOpProjectMaterials(currentMaterials);
    try {
      await projectsAPI.update(project.ID_Proyecto.toString(), { projectMaterials: currentMaterials });
    } catch (e) {
      console.error("Error sync", e);
    }
  }

  async function handleUpdateOpMaterialQuantity(project: any, idx: number, qty: number) {
    const currentMaterials = [...opProjectMaterials];
    if (currentMaterials[idx]) {
      currentMaterials[idx].takenQuantity = qty;
    }
    setOpProjectMaterials(currentMaterials);
    try {
      await projectsAPI.update(project.ID_Proyecto.toString(), { projectMaterials: currentMaterials });
    } catch (e) {
      console.error("Error sync", e);
    }
  }

  const handleStartDay = async (project: any) => {
    setLoading(true);
    try {
      const materialsToDeduct = opProjectMaterials || [];
      for (const m of materialsToDeduct) {
        if (m.ID_Material && m.done && (m.takenQuantity || m.quantity) > 0) {
          const qty = m.takenQuantity || m.quantity || 0;
          await materialesAPI.update(m.ID_Material.toString(), {
            Stock_Disponible: (m.Stock_Disponible || 0) - qty
          }).catch(console.warn);
        }
      }

      await projectsAPI.update(project.ID_Proyecto.toString(), {
        Estado: "EnProceso",
        stockDescontado: true,
        stockDescontadoAt: new Date().toISOString()
      });

      toast({ title: t.projects.day_started });
      setIsSheetOpen(false);
      loadSqlData();
    } catch (e: any) {
      if (e.message === 'OFFLINE_SAVED') {
        toast({ title: "Jornada iniciada (Offline)", description: "Los datos se sincronizarán al recuperar señal." });
        setIsSheetOpen(false);
        return;
      }
      toast({ variant: "destructive", title: "Error al iniciar jornada" });
    } finally {
      setLoading(false);
    }
  };

  const handleFinishDayAndReport = async (project: any) => {
    /* 
    if (reportPhotos.length === 0) {
      toast({ title: "Faltan Fotos", variant: "destructive" });
      return;
    }
    */
    setLoading(true);
    try {
      if (rejectedReportId) {
        // UPDATE existing rejected report
        const updatePayload: any = {
          Comentarios: reportContent || "Corrección de reporte",
          estado: "Pendiente"
        };
        if (reportPhotos.length > 0) {
          updatePayload.Evidencias_URL = reportPhotos[0].dataUrl;
        }
        await reportesAPI.update(rejectedReportId.toString(), updatePayload);

        await projectsAPI.update(project.ID_Proyecto.toString(), {
          Estado: "EnRevision"
        });
      } else {
        // CREATE new report
        // Buscar ID_Empleado real (SQL) antes de crear
        // Buscar ID_Empleado real (SQL) antes de crear
        // profile.empleadoId viene directo del login — es el ID numérico de SQL
        let sqlEmployeeId: number | null = profile?.empleadoId || null;
        if (!sqlEmployeeId) {
          try {
            const allEmps = await employeesAPI.getAll();
            const myEmp = allEmps.find((e: any) =>
              e.usuario?.Username?.toLowerCase() === (profile?.email || "").toLowerCase()
            );
            if (myEmp) sqlEmployeeId = myEmp.ID_Empleado;
          } catch (e) { console.warn("Error buscando ID SQL", e); }
        }

        const baseReportData = {
          ID_Proyecto: parseInt(project.ID_Proyecto.toString()),
          ID_Equipo: project.ID_Equipo ? parseInt(project.ID_Equipo.toString()) : null,
          Comentarios: reportContent || "Avance diario",
          estado: "Pendiente",
          Fecha_Reporte: new Date().toISOString(),
          Evidencias_URL: reportPhotos.length > 0 ? reportPhotos[0].dataUrl : "",
          ID_Empleado: sqlEmployeeId ? parseInt(sqlEmployeeId.toString()) : null
        };
        const createdReport = await reportesAPI.create(baseReportData);

        await projectsAPI.update(project.ID_Proyecto.toString(), {
          Estado: "EnRevision",
          Progreso: 50
        });

        // NOTA: Los puntos se otorgan automáticamente en el backend
        // cuando el Admin finaliza el proyecto (Estado = "Finalizado")
        // Ver: backend/src/routes/proyectos.ts

      }
      toast({ title: t.common.success });
      setIsSheetOpen(false);
      loadSqlData();
    } catch (e: any) {
      if (e.message === 'OFFLINE_SAVED') {
        toast({ title: "Reporte guardado localmente", description: "Se enviará automáticamente al recuperar señal." });
        setIsSheetOpen(false);
        return;
      }
      console.error("Error finalizing day:", e);
      toast({ variant: "destructive", title: "Error al enviar reporte", description: e.message || "Error desconocido" });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new (window as any).Image();
        img.src = ev.target?.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.3); // Aggressive compression (30% quality)
          setReportPhotos(prev => [...prev, { name: file.name, dataUrl }]);
        };
      };
      reader.readAsDataURL(file);
    });
  };

  if (isUserLoading || isApiLoading) {
    return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{isAdmin ? t.projects.title_admin : t.projects.title_op}</h2>
          {isAdmin && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild><Button className="bg-accent text-white font-bold"><Plus className="h-4 w-4 mr-2" /> {t.projects.new_project}</Button></DialogTrigger>
              <DialogContent className="sm:max-w-xl bg-card border-border">
                <DialogHeader><DialogTitle>{t.projects.new_project}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><Label className="text-xs font-bold text-muted-foreground uppercase">NOMBRE</Label><Input value={newProject.Pry_Nombre_Proyecto} onChange={(e) => setNewProject({ ...newProject, Pry_Nombre_Proyecto: e.target.value })} /></div>
                    <div className="space-y-1"><Label className="text-xs font-bold text-muted-foreground uppercase">CLIENTE</Label><Select value={newProject.clientId} onValueChange={(val) => setNewProject({ ...newProject, clientId: val })}><SelectTrigger><SelectValue placeholder="Selecciona Cliente" /></SelectTrigger><SelectContent>{sqlClients?.map(c => <SelectItem key={c.ID_Cliente} value={c.ID_Cliente.toString()}>{c.Nombre}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><Label className="text-xs font-bold text-muted-foreground uppercase">SERVICIO</Label><Select value={newProject.serviceType} onValueChange={(val) => setNewProject({ ...newProject, serviceType: val })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Instalación">Instalación</SelectItem><SelectItem value="Mantenimiento">Mantenimiento</SelectItem></SelectContent></Select></div>
                    <div className="space-y-1"><Label className="text-xs font-bold text-muted-foreground uppercase">EQUIPO (EQ)</Label><Select value={newProject.assignedTeamId} onValueChange={(val) => setNewProject({ ...newProject, assignedTeamId: val })}><SelectTrigger><SelectValue placeholder="SIN EQUIPO ASIGNADO" /></SelectTrigger><SelectContent><SelectItem value="no-team">SIN EQUIPO ASIGNADO</SelectItem>{sqlTeams?.map(t => <SelectItem key={t.ID_Equipo} value={t.ID_Equipo.toString()}>{t.Nombre_Equipo}</SelectItem>)}</SelectContent></Select></div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase">DIRECCIÓN DE OBRA</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant={newProject.addressType === "client" ? "default" : "outline"}
                        className={newProject.addressType === "client" ? "bg-accent text-white" : "border-border text-muted-foreground"}
                        onClick={() => setNewProject({ ...newProject, addressType: "client" })}
                      >
                        Del Cliente
                      </Button>
                      <Button
                        variant={newProject.addressType === "custom" ? "default" : "outline"}
                        className={newProject.addressType === "custom" ? "bg-accent text-white" : "border-border text-muted-foreground"}
                        onClick={() => setNewProject({ ...newProject, addressType: "custom" })}
                      >
                        Personalizada
                      </Button>
                    </div>
                    {newProject.addressType === "client" ? (
                      <Input
                        disabled
                        placeholder="Selecciona un cliente para autocompletar"
                        value={newProject.clientId ? sqlClients?.find((c: any) => c.ID_Cliente.toString() === newProject.clientId)?.Direccion || "Sin dirección registrada" : ""}
                        className="bg-card/50"
                      />
                    ) : (
                      <Input
                        placeholder="Escribe la dirección exacta"
                        value={newProject.customAddress}
                        onChange={(e) => setNewProject({ ...newProject, customAddress: e.target.value })}
                      />
                    )}
                  </div>
                </div>
                <DialogFooter><Button className="w-full bg-accent text-white" onClick={handleCreateProject} disabled={loading}>{t.common.create}</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isAdmin && (
          <div className="flex gap-4">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar..." /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="Pendiente">Pendiente</SelectItem><SelectItem value="EnProceso">En Proceso</SelectItem><SelectItem value="EnRevision">Revisión</SelectItem><SelectItem value="Finalizado">Finalizado</SelectItem></SelectContent></Select>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project: any) => {
            const projectReports = sqlReports.filter(r => r.ID_Proyecto === project.ID_Proyecto);
            const hasReports = projectReports.length > 0;
            const hasPendingReport = projectReports.some(r => r.estado === 'Pendiente');
            const hasRejectedReport = projectReports.some(r => r.estado === 'Rechazado');

            let displayStatus = project.Estado || 'Pendiente';

            // Flujo corregido con seguro de progreso
            if (displayStatus === 'Finalizado') {
              // Ya está terminado
            } else if (hasPendingReport) {
              displayStatus = 'EnRevision';
            } else if (hasRejectedReport) {
              displayStatus = 'Rechazado';
            } else if (displayStatus === 'EnProceso') {
              displayStatus = 'EnProceso';
            } else if (!hasReports) {
              displayStatus = 'Activo';
            }

            const isEnCurso = displayStatus === 'EnProceso' || displayStatus === 'Rechazado';
            const progressValue = displayStatus === 'Finalizado' ? 100 : (project.Progreso || 0);
            const assignedTeam = sqlTeams.find(t => t.ID_Equipo === project.ID_Equipo);

            return (
              <Card key={project.ID_Proyecto} className="bg-card border-border overflow-hidden flex flex-col">
                <div className="h-32 relative">
                  <Image src={project.Imagen_Url || "https://picsum.photos/seed/solar/800/450"} alt="" fill className="object-cover opacity-80" />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {displayStatus === 'Finalizado' && (
                      <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 font-bold tracking-wider">FINALIZADO</Badge>
                    )}
                    {isAdmin && (
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteProject(project.ID_Proyecto)}><Trash2 className="h-4 w-4" /></Button>
                    )}
                  </div>
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg font-bold truncate">{project.Nombre_Proyecto}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-1 space-y-2">
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {project.Ubicacion}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" /> {project.cliente?.Nombre}</div>
                  <div className="text-xs text-accent font-bold flex items-center gap-1"><Users className="h-3 w-3" /> {assignedTeam?.Nombre_Equipo || "Sin Equipo"}</div>
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="text-foreground">{progressValue}%</span>
                    </div>
                    <Progress value={progressValue} className="h-1.5 rounded-full" />
                  </div>
                </CardContent>
                <CardFooter className="p-0 border-t border-border">
                  {isAdmin ? (
                    <div className="grid grid-cols-2 w-full">
                      <Button variant="ghost" className="h-10 rounded-none border-r" onClick={() => openManageDialog(project)}><Settings2 className="h-4 w-4 mr-2" /> Gestionar</Button>
                      <Button variant="ghost" className="h-10 rounded-none" onClick={() => router.push(`/reports?projectId=${project.ID_Proyecto}`)}><ClipboardList className="h-4 w-4 mr-2" /> Reportes</Button>
                    </div>
                  ) : displayStatus === 'Finalizado' ? (
                    <div className="w-full h-12 flex items-center justify-center gap-2 bg-muted/40 text-muted-foreground text-sm font-bold border-t border-border">
                      <CheckCircle2 className="h-4 w-4" /> Proyecto Cerrado
                    </div>
                  ) : displayStatus === 'EnRevision' ? (
                    <Button disabled className="w-full h-10 rounded-none bg-yellow-600/50 text-white cursor-not-allowed">En Revisión</Button>
                  ) : (
                    <Sheet open={isSheetOpen && selectedProject?.ID_Proyecto === project.ID_Proyecto} onOpenChange={(o) => {
                      setIsSheetOpen(o);
                      if (o) {
                        setSelectedProject(project);
                        setRejectedReportId(null);
                        setReportContent("");
                        setReportPhotos([]);

                        if (project.Estado === 'Rechazado') {
                          // Find the rejected report
                          const rejectedReport = sqlReports.find((r: any) => r.ID_Proyecto === project.ID_Proyecto && r.estado === 'Rechazado');
                          if (rejectedReport) {
                            setRejectedReportId(rejectedReport.ID_Reporte);
                            setReportContent(rejectedReport.Comentarios || "");
                            if (rejectedReport.Evidencias_URL) {
                              setReportPhotos([{ name: "Evidencia Anterior", dataUrl: rejectedReport.Evidencias_URL }]);
                            }
                          }
                        }

                        let mRaw = project.projectMaterials || [];
                        let mats = Array.isArray(mRaw) ? mRaw : (typeof mRaw === 'string' ? JSON.parse(mRaw) : []);

                        // Si no hay reportes, reseteamos el checklist para empezar de cero
                        if (projectReports.length === 0) {
                          mats = mats.map((m: any) => ({ ...m, done: false }));
                        }

                        if (mats.length === 0) {
                          const type = (project.Tipo_Servicio || "").toLowerCase();
                          let template = checklistTemplates.find(c =>
                            (c.Nombre || "").toLowerCase().includes(type) || (c.servicio?.Tipo || "").toLowerCase() === type
                          ) || checklistTemplates[0];

                          if (template?.materiales) {
                            mats = template.materiales.map((m: any) => ({
                              ID_Material: m.ID_Material || m.id,
                              name: m.Nombre_Material || m.name || "Material",
                              quantity: m.Cantidad_Requerida || m.quantity || 1,
                              done: false, takenQuantity: m.Cantidad_Requerida || m.quantity || 1,
                              Stock_Disponible: m.Stock_Disponible || 100
                            }));
                          } else {
                            mats = [
                              { ID_Material: 1, name: "Paneles Solares", quantity: 6, done: false, takenQuantity: 6, Stock_Disponible: 100 },
                              { ID_Material: 2, name: "Microinversores", quantity: 12, done: false, takenQuantity: 12, Stock_Disponible: 100 }
                            ];
                          }
                          projectsAPI.update(project.ID_Proyecto.toString(), { projectMaterials: mats }).catch(console.error);
                        }
                        setOpProjectMaterials(mats);
                      }
                    }}>
                      <SheetTrigger asChild>
                        <Button className={cn("w-full h-10 rounded-none text-white",
                          displayStatus === 'Rechazado' ? "bg-red-500" :
                            (displayStatus === 'EnProceso' ? "bg-emerald-600" : "bg-accent")
                        )}>
                          {displayStatus === 'Rechazado' ? "Corregir Reporte" :
                            (displayStatus === 'EnProceso' ? "Reportar Avance" : "Iniciar Día")}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto w-full bg-card p-0">
                        <div className="max-w-xl mx-auto pb-10">
                          <SheetHeader className="p-6 border-b bg-muted/20"><SheetTitle>Reportar - {project.Nombre_Proyecto}</SheetTitle></SheetHeader>
                          <div className="p-6 space-y-6">
                            {!isEnCurso ? (
                              <div className="space-y-6">
                                <Label className="text-xs font-bold uppercase text-emerald-500">1. Lista de Materiales</Label>
                                <div className="grid gap-2">
                                  {opProjectMaterials.length > 0 ? opProjectMaterials.map((mat, idx) => {
                                    const isShort = (mat.takenQuantity || 0) < mat.quantity;
                                    return (
                                      <div key={idx} className={cn("flex flex-col p-3 rounded-lg border", isShort ? "bg-red-500/10 border-red-500/30" : "bg-muted/30")}>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <Checkbox checked={mat.done && !isShort} onCheckedChange={() => !isShort && handleToggleOpMaterial(project, idx)} disabled={isShort} />
                                            <div className="text-sm font-bold">{mat.name} <span className="text-[10px] text-muted-foreground block">Req: {mat.quantity}</span></div>
                                          </div>
                                          <Input type="number" className={cn("w-16 h-8 text-center", isShort && "border-red-500 text-red-500")} value={mat.takenQuantity === undefined ? 0 : mat.takenQuantity} onChange={(e) => handleUpdateOpMaterialQuantity(project, idx, parseInt(e.target.value) || 0)} />
                                        </div>
                                        {isShort && <span className="text-[10px] font-bold text-red-500 mt-2">La cantidad no puede ser menor a {mat.quantity}</span>}
                                      </div>
                                    );
                                  }) : <p className="text-center text-muted-foreground py-4">No hay materiales.</p>}
                                </div>
                                <Button
                                  onClick={() => handleStartDay(project)}
                                  className="w-full h-12 bg-accent text-white font-bold"
                                  disabled={loading || (opProjectMaterials.length > 0 && (!opProjectMaterials.every(m => m.done) || opProjectMaterials.some(m => (m.takenQuantity || 0) < m.quantity)))}
                                >
                                  {loading ? "Iniciando..." : "CONFIRMAR E INICIAR JORNADA"}
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-6">
                                <div className="space-y-2">
                                  <Label className="text-xs font-bold uppercase text-accent">Evidencia Fotográfica</Label>
                                  <div className="flex gap-2 flex-wrap">
                                    {reportPhotos.map((p, i) => <div key={i} className="w-20 h-20 relative rounded-lg overflow-hidden border"><Image src={p.dataUrl} fill alt="" className="object-cover" /></div>)}
                                    <button onClick={() => photoInputRef.current?.click()} className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/10"><Camera className="h-6 w-6 text-muted-foreground" /></button>
                                  </div>
                                  <input type="file" ref={photoInputRef} className="hidden" multiple onChange={handlePhotoUpload} />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-xs font-bold uppercase text-accent">Observaciones</Label>
                                  <Textarea value={reportContent} onChange={(e) => setReportContent(e.target.value)} placeholder="Notas de hoy..." />
                                </div>
                                <Button
                                  onClick={() => handleFinishDayAndReport(project)}
                                  disabled={loading}
                                  className={cn("w-full h-12 text-white font-bold", project.Estado === 'Rechazado' ? "bg-red-500 hover:bg-red-600" : "bg-emerald-600")}
                                >
                                  {loading ? "Enviando..." : (project.Estado === 'Rechazado' ? "REENVIAR REPORTE Y TERMINAR" : "ENVIAR REPORTE Y TERMINAR")}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader><DialogTitle>{managedProject?.Nombre_Proyecto}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-1"><Label className="text-xs font-bold text-muted-foreground">Estado</Label><Select value={managedStatus} onValueChange={setManagedStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Pendiente">Pendiente</SelectItem><SelectItem value="EnProceso">En Proceso</SelectItem><SelectItem value="EnRevision">Revisión</SelectItem><SelectItem value="Finalizado">Finalizado</SelectItem></SelectContent></Select></div>
              <div className="space-y-1"><Label className="text-xs font-bold text-muted-foreground">Equipo</Label><Select value={managedTeamId} onValueChange={setManagedTeamId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no-team">Sin Equipo</SelectItem>{sqlTeams?.map(t => <SelectItem key={t.ID_Equipo} value={t.ID_Equipo.toString()}>{t.Nombre_Equipo}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><Label className="text-xs font-bold text-muted-foreground">📍 Dirección de Obra</Label><Input placeholder="Ej. Av. Principal 123, Colonia..." value={managedUbicacion} onChange={(e) => setManagedUbicacion(e.target.value)} /></div>
            </div>
            <DialogFooter><Button onClick={handleSaveManagement} className="w-full bg-accent text-white font-bold">Guardar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
