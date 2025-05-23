import type { KpiData } from "@/types";
import { KpiCard } from "./kpi-card";
import { ListChecks, AlertTriangle, CheckCircle, Activity } from "lucide-react";

interface KpiSectionProps {
  data: KpiData;
  isLoading?: boolean;
}

export function KpiSection({ data, isLoading }: KpiSectionProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard 
        title="Total Tiket Aktif" 
        value={data.activeTickets} 
        icon={Activity} 
        description="Tickets currently open or in progress"
        className="bg-primary/5"
        isLoading={isLoading}
      />
      <KpiCard 
        title="Tiket Pending" 
        value={data.pendingTickets} 
        icon={ListChecks} 
        description="Tickets awaiting user or external action"
        className="bg-secondary"
        isLoading={isLoading}
      />
      <KpiCard 
        title="Tiket Breach (SLA Terlewat)" 
        value={data.breachedTickets} 
        icon={AlertTriangle} 
        description="Tickets that have missed their SLA"
        className="bg-destructive/10 border-destructive text-destructive-foreground"
        isLoading={isLoading}
      />
      <KpiCard 
        title="Tiket Closed Hari Ini" 
        value={data.closedToday} 
        icon={CheckCircle} 
        description="Tickets resolved and closed today"
        className="bg-green-500/10 border-green-600"
        isLoading={isLoading}
      />
    </section>
  );
}
