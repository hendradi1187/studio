
"use client";

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { KpiSection } from '@/components/dashboard/kpi-section';
import { StatusPieChart } from '@/components/dashboard/charts/status-pie-chart';
import { TeamBarChart } from '@/components/dashboard/charts/team-bar-chart';
import { ResolutionLineChart } from '@/components/dashboard/charts/resolution-line-chart';
import { TicketTable } from '@/components/dashboard/ticket-table';
import { mockKpiData, mockTickets, mockPieChartData, mockBarChartData, mockLineChartData } from '@/lib/mock-data';
import type { KpiData, Ticket, PieChartDataItem, BarChartDataItem, LineChartDataItem } from '@/types';
import { useToast } from "@/hooks/use-toast";

export default function RemedyDashboardPage() {
  const [kpiData, setKpiData] = useState<KpiData>(mockKpiData);
  const [tickets, setTickets] = useState<Ticket[]>([]); // Initialize with empty array
  const [pieChartData, setPieChartData] = useState<PieChartDataItem[]>(mockPieChartData);
  const [barChartData, setBarChartData] = useState<BarChartDataItem[]>(mockBarChartData);
  const [lineChartData, setLineChartData] = useState<LineChartDataItem[]>(mockLineChartData);
  const { toast } = useToast();

  useEffect(() => {
    // Set initial data that might cause hydration issues on the client side
    setTickets(mockTickets);

    const intervalId = setInterval(() => {
      // Example: Slightly change KPI data to show refresh
      setKpiData(prevData => ({
        ...prevData,
        activeTickets: prevData.activeTickets + Math.floor(Math.random() * 5) - 2,
        pendingTickets: Math.max(0, prevData.pendingTickets + Math.floor(Math.random() * 3) - 1),
        breachedTickets: Math.max(0, prevData.breachedTickets + (Math.random() > 0.8 ? 1 : 0)),
        closedToday: prevData.closedToday + (Math.random() > 0.7 ? 1 : 0),
      }));

      // Potentially refresh other data too or re-fetch from an API in a real app
      // For this demo, we are not changing chart/table data on interval to keep it simple.

      toast({
        title: "Dashboard Refreshed",
        description: `Data updated at ${new Date().toLocaleTimeString()}`,
        variant: "default",
      });
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(intervalId);
  }, [toast]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8 space-y-6">
      <DashboardHeader />
      
      <KpiSection data={kpiData} />
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <StatusPieChart data={pieChartData} />
        </div>
        <div className="lg:col-span-3">
          <TeamBarChart data={barChartData} />
        </div>
      </div>
      
      <div>
        <ResolutionLineChart data={lineChartData} />
      </div>
      
      <div>
        <TicketTable initialTickets={tickets} />
      </div>
    </div>
  );
}
