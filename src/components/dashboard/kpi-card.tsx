import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  isLoading?: boolean;
}

export function KpiCard({ title, value, icon: Icon, description, className, isLoading }: KpiCardProps) {
  return (
    <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-accent" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20 my-1" /> 
        ) : (
          <div className="text-3xl font-bold text-primary">{value}</div>
        )}
        {description && (
          isLoading ? (
            <Skeleton className="h-4 w-4/5 mt-2" />
          ) : (
            <p className="text-xs text-muted-foreground pt-1">{description}</p>
          )
        )}
      </CardContent>
    </Card>
  );
}
