"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  ClipboardList,
  Building2,
  Package,
  UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useI18n } from "@/components/providers/i18n-provider";

export function BottomNav() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const { t } = useI18n();
  const isAdmin = profile?.rol === 'admin';

  const navItems = isAdmin ? [
    { title: t.nav.dashboard, icon: LayoutDashboard, href: "/dashboard" },
    { title: t.nav.projects, icon: Briefcase, href: "/projects" },
    { title: t.nav.clients, icon: Building2, href: "/clients" },
    { title: t.nav.teams, icon: Users, href: "/team" },
    { title: t.nav.employees, icon: UserCircle, href: "/employees" },
    { title: t.nav.reports, icon: ClipboardList, href: "/reports" },
    { title: t.nav.materials, icon: Package, href: "/materials" },
  ] : [
    { title: t.nav.dashboard, icon: LayoutDashboard, href: "/dashboard" },
    { title: t.nav.projects, icon: Briefcase, href: "/projects" },
    { title: t.nav.teams, icon: Users, href: "/team" },
    { title: t.nav.reports, icon: ClipboardList, href: "/reports" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-white/10 pb-safe shadow-2xl">
      <nav className="flex items-center h-[72px] px-2 overflow-x-auto overflow-y-hidden snap-x hide-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex-none flex flex-col items-center justify-center gap-1.5 min-w-[72px] sm:min-w-[80px] h-full transition-all relative snap-center",
                isActive ? "text-accent" : "text-muted-foreground hover:text-white"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive ? "bg-accent/20" : "bg-transparent"
              )}>
                <item.icon className={cn("h-[22px] w-[22px]", isActive && "scale-110")} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest truncate max-w-[64px] text-center">
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>
      {/* Estilo para ocultar la barra de scroll en navegadores webkit */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
