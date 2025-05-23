
"use client";

import { useState, useEffect, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { KpiSection } from '@/components/dashboard/kpi-section';
import { StatusPieChart } from '@/components/dashboard/charts/status-pie-chart';
import { TeamBarChart } from '@/components/dashboard/charts/team-bar-chart';
import { ResolutionLineChart } from '@/components/dashboard/charts/resolution-line-chart';
import { TicketTable } from '@/components/dashboard/ticket-table';
import { mockTickets, mockPieChartData, mockBarChartData, mockLineChartData } from '@/lib/mock-data';
import type { KpiData, Ticket, PieChartDataItem, BarChartDataItem, LineChartDataItem } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { getRemedyKpiData } from '@/ai/flows/remedy-kpi-flow'; // Import the new flow

const initialKpiData: KpiData = {
  activeTickets: 0,
  pendingTickets: 0,
  breachedTickets: 0,
  closedToday: 0,
};

export default function RemedyDashboardPage() {
  const [kpiData, setKpiData] = useState<KpiData>(initialKpiData);
  const [isLoadingKpi, setIsLoadingKpi] = useState<boolean>(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pieChartData, setPieChartData] = useState<PieChartDataItem[]>(mockPieChartData);
  const [barChartData, setBarChartData] = useState<BarChartDataItem[]>(mockBarChartData);
  const [lineChartData, setLineChartData] = useState<LineChartDataItem[]>(mockLineChartData);
  const { toast } = useToast();

  const fetchKpiData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setIsLoadingKpi(true);
    }
    try {
      const data = await getRemedyKpiData();
      setKpiData(data);
    } catch (error) {
      console.error("Failed to fetch KPI data:", error);
      toast({
        title: "Error Fetching KPIs",
        description: "Could not load KPI data from the service. Displaying stale data or zeros.",
        variant: "destructive",
      });
      // Optionally, set to a default error state or keep previous data
      // setKpiData(initialKpiData); 
    } finally {
      if (isInitialLoad) {
        setIsLoadingKpi(false);
      }
    }
  }, [toast]);

  useEffect(() => {
    // Set initial data that might cause hydration issues on the client side
    setTickets(mockTickets);
    
    // Fetch KPI data on initial load
    fetchKpiData(true);

    const intervalId = setInterval(() => {
      fetchKpiData(false); // Refresh KPI data
      // Potentially refresh other data too or re-fetch from an API in a real app
      toast({
        title: "Dashboard Refreshed",
        description: `Data updated at ${new Date().toLocaleTimeString()}`,
        variant: "default",
      });
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(intervalId);
  }, [fetchKpiData, toast]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8 space-y-6">
      <DashboardHeader />
      
      <KpiSection data={kpiData} isLoading={isLoadingKpi} />
      
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
