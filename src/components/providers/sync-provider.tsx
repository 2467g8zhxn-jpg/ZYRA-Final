"use client";

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  projectsAPI, 
  reportesAPI, 
  materialesAPI, 
  equiposAPI 
} from '@/lib/api-client';

interface OfflineRequest {
  id: string;
  endpoint: string;
  method: string;
  body: any;
  timestamp: number;
}

interface SyncContextType {
  isOnline: boolean;
  syncQueue: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = React.useState(typeof window !== 'undefined' ? navigator.onLine : true);

  const syncQueue = useCallback(async () => {
    const queue: OfflineRequest[] = JSON.parse(localStorage.getItem('zyra_offline_queue') || '[]');
    if (queue.length === 0) return;

    toast({
      title: "Sincronizando...",
      description: `Enviando ${queue.length} cambios pendientes.`,
    });

    const newQueue: OfflineRequest[] = [];

    for (const req of queue) {
      try {
        // Simple mapping based on endpoint patterns
        if (req.endpoint.includes('/proyectos')) {
          if (req.method === 'POST') await projectsAPI.create(req.body);
          if (req.method === 'PUT') {
             const id = req.endpoint.split('/').pop();
             await projectsAPI.update(id!, req.body);
          }
        } else if (req.endpoint.includes('/reports')) {
          if (req.method === 'POST') await reportesAPI.create(req.body);
        } else if (req.endpoint.includes('/materiales')) {
          if (req.method === 'PUT') {
             const id = req.endpoint.split('/').pop();
             await materialesAPI.update(id!, req.body);
          }
        }
        // Add more mappings as needed
      } catch (error) {
        console.error("Failed to sync request:", req, error);
        newQueue.push(req); // Keep in queue if failed
      }
    }

    localStorage.setItem('zyra_offline_queue', JSON.stringify(newQueue));

    if (newQueue.length === 0) {
      toast({
        title: "Sincronización completada",
        description: "Todos los datos están al día.",
      });
    } else {
      toast({
        title: "Sincronización parcial",
        description: `Quedan ${newQueue.length} elementos pendientes por error.`,
        variant: "destructive"
      });
    }
  }, [toast]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueue]);

  return (
    <SyncContext.Provider value={{ isOnline, syncQueue }}>
      {children}
    </SyncContext.Provider>
  );
}

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) throw new Error("useSync must be used within SyncProvider");
  return context;
};
