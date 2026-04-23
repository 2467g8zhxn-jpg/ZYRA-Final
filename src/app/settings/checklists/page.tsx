// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../dashboard/layout";
import { checklistsServicioAPI, materialesAPI } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Trash2, Edit2, Save, X, ClipboardList, Package, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ChecklistsSettingsPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await checklistsServicioAPI.getAll();
      setTemplates(data as any);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar plantillas"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ClipboardList className="h-8 w-8 text-accent" /> Plantillas de Checklist
            </h2>
            <p className="text-muted-foreground mt-1">Configura los materiales requeridos para cada tipo de servicio.</p>
          </div>
          <Button className="bg-accent hover:bg-accent/90 text-white font-bold gap-2">
            <Plus className="h-4 w-4" /> Nueva Plantilla
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.ID_Checklist_Servicio} className="border-border bg-card hover:border-accent/30 transition-all cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg flex justify-between items-start">
                    <span>{template.Nombre}</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase">
                      <Package className="h-3 w-3" /> Materiales en plantilla:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {template.detalles?.length > 0 ? (
                        template.detalles.slice(0, 3).map((d: any) => (
                          <span key={d.ID_Checklist_Servicio_Detalle} className="px-2 py-1 bg-muted rounded text-[10px] font-medium border border-border">
                            {d.material?.Nombre_Material} (x{d.Cantidad_Requerida})
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Sin materiales</span>
                      )}
                      {template.detalles?.length > 3 && <span className="text-[10px] text-accent">+{template.detalles.length - 3} más</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
