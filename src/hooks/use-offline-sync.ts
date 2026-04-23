"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

interface OfflineRequest {
  id: string;
  type: 'PROJECT_CREATE' | 'REPORT_CREATE' | 'PROJECT_UPDATE' | 'MATERIAL_UPDATE';
  payload: any;
  timestamp: number;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Conexión restablecida",
        description: "Sincronizando datos pendientes...",
      });
      syncData();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Modo Offline",
        description: "Los cambios se guardarán localmente y se sincronizarán al recuperar señal.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueRequest = useCallback((type: OfflineRequest['type'], payload: any) => {
    const queue: OfflineRequest[] = JSON.parse(localStorage.getItem('zyra_offline_queue') || '[]');
    const newRequest: OfflineRequest = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      payload,
      timestamp: Date.now(),
    };
    queue.push(newRequest);
    localStorage.setItem('zyra_offline_queue', JSON.stringify(queue));
    return newRequest.id;
  }, []);

  const syncData = async () => {
    const queue: OfflineRequest[] = JSON.parse(localStorage.getItem('zyra_offline_queue') || '[]');
    if (queue.length === 0) return;

    // Note: Actual sync logic will depend on the API client.
    // For now, we'll expose the queue so the pages can handle it or we can add central logic here.
    console.log("Syncing queue:", queue);
  };

  return { isOnline, queueRequest, syncData };
}
