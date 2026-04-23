import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  iconClassName?: string;
  progress?: number;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  className, 
  iconClassName,
  progress 
}: StatCardProps) {
  return (
    <Card className={cn("bg-card border-white/5 overflow-hidden group hover:border-accent/50 transition-all", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2 rounded-lg bg-accent/10 transition-colors group-hover:bg-accent/20", iconClassName)}>
            <Icon className="h-5 w-5 text-accent" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl font-bold tracking-tight text-white">{value}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {progress !== undefined && (
          <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
