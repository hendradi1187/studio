
"use client";

import { useState, useEffect, useCallback } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { KpiSection } from '@/components/dashboard/kpi-section';
import { StatusPieChart } from '@/components/dashboard/charts/status-pie-chart';
import { TeamBarChart } from '@/components/dashboard/charts/team-bar-chart';
import { ResolutionLineChart } from '@/components/dashboard/charts/resolution-line-chart';
import { TicketTable } from '@/components/dashboard/ticket-table';
import type { KpiData, Ticket, PieChartDataItem, BarChartDataItem, LineChartDataItem } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { getRemedyKpiData } from '@/ai/flows/remedy-kpi-flow';
import { getRemedyTicketList, type GetRemedyTicketListInput } from '@/ai/flows/get-remedy-ticket-list-flow';
import { transformTicketsToPieData, transformTicketsToBarData, transformTicketsToLineData } from '@/lib/data-transformer';
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";


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
  const [isLoadingTickets, setIsLoadingTickets] = useState<boolean>(true);

  const [pieChartData, setPieChartData] = useState<PieChartDataItem[]>([]);
  const [isLoadingPieChart, setIsLoadingPieChart] = useState<boolean>(true);

  const [barChartData, setBarChartData] = useState<BarChartDataItem[]>([]);
  const [isLoadingBarChart, setIsLoadingBarChart] = useState<boolean>(true);
  
  const [lineChartData, setLineChartData] = useState<LineChartDataItem[]>([]);
  const [isLoadingLineChart, setIsLoadingLineChart] = useState<boolean>(true);

  const { toast } = useToast();

  const fetchAllData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      setIsLoadingKpi(true);
      setIsLoadingTickets(true);
      setIsLoadingPieChart(true);
      setIsLoadingBarChart(true);
      setIsLoadingLineChart(true);
    }

    try {
      // Fetch KPI Data
      const kpiResult = await getRemedyKpiData();
      setKpiData(kpiResult);
      setIsLoadingKpi(false);

      // Fetch Ticket List
      // Qualification: Fetch tickets that are not Closed or Cancelled for general display
      // For line chart, we might need a different set or more advanced filtering.
      // Let's fetch a broader set for now: last 30 days of modified tickets, not closed/cancelled
      // Or simply all non-closed/non-cancelled tickets
      const ticketListInput: GetRemedyTicketListInput = {
        qualification: "'Status' != \"Closed\" AND 'Status' != \"Cancelled\"", // Fetch active tickets
        maxLimit: "200", // Limit for performance
      };
      const fetchedTickets = await getRemedyTicketList(ticketListInput);
      setTickets(fetchedTickets);
      setIsLoadingTickets(false);

      // Transform data for charts
      setPieChartData(transformTicketsToPieData(fetchedTickets));
      setIsLoadingPieChart(false);
      
      setBarChartData(transformTicketsToBarData(fetchedTickets));
      setIsLoadingBarChart(false);

      // For Line Chart, fetch tickets specifically relevant for resolution trends (e.g. closed in last X days)
      // Or, if `fetchedTickets` is broad enough (e.g. contains recently closed tickets), use that.
      // A more robust approach would be a separate query for closed tickets in a date range.
      const closedTicketsInput: GetRemedyTicketListInput = {
         qualification: "('Status' = \"Closed\" OR 'Status' = \"Resolved\") AND 'Last Modified Date' >= LAST_DAY(TODAY() - 30)", // Example: Closed/Resolved in last 30 days based on Last Modified Date
         maxLimit: "500", // Potentially many closed tickets
      };
      const closedTickets = await getRemedyTicketList(closedTicketsInput);
      setLineChartData(transformTicketsToLineData(closedTickets, 30)); // Show 30 days trend
      setIsLoadingLineChart(false);

    } catch (error) {
      console.error("Failed to fetch live data:", error);
      toast({
        title: "Error Fetching Live Data",
        description: "Could not load all data from the Remedy service. Some data may be stale or unavailable.",
        variant: "destructive",
      });
      // Set loading states to false even on error to stop spinners
      setIsLoadingKpi(false);
      setIsLoadingTickets(false);
      setIsLoadingPieChart(false);
      setIsLoadingBarChart(false);
      setIsLoadingLineChart(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAllData(true); // Fetch all data on initial load

    const intervalId = setInterval(() => {
      toast({
        title: "Refreshing Dashboard...",
        description: `Attempting to update data at ${new Date().toLocaleTimeString()}`,
      });
      fetchAllData(false); // Refresh data periodically
    }, 300000); // Refresh every 5 minutes (300,000 ms)

    return () => clearInterval(intervalId);
  }, [fetchAllData, toast]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-4 md:p-6 lg:p-8 space-y-6">
      <DashboardHeader />
      
      <KpiSection data={kpiData} isLoading={isLoadingKpi} />
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          {isLoadingPieChart ? (
            <Card className="shadow-lg h-full">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="flex items-center justify-center aspect-square">
                <Skeleton className="h-[250px] w-[250px] rounded-full" />
              </CardContent>
            </Card>
          ) : (
            <StatusPieChart data={pieChartData} />
          )}
        </div>
        <div className="lg:col-span-3">
          {isLoadingBarChart ? (
             <Card className="shadow-lg h-full">
               <CardHeader>
                 <Skeleton className="h-6 w-3/4" />
                 <Skeleton className="h-4 w-1/2" />
               </CardHeader>
               <CardContent className="h-[300px]">
                 <Skeleton className="h-full w-full" />
               </CardContent>
             </Card>
          ) : (
            <TeamBarChart data={barChartData} />
          )}
        </div>
      </div>
      
      <div>
        {isLoadingLineChart ? (
          <Card className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="h-[300px]">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        ) : (
          <ResolutionLineChart data={lineChartData} />
        )}
      </div>
      
      <div>
        {isLoadingTickets ? (
          <div className="p-4 md:p-6 bg-card shadow-lg rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-10 w-1/4" />
            </div>
            <Skeleton className="h-64 w-full" /> {/* Placeholder for table content */}
          </div>
        ) : (
          <TicketTable initialTickets={tickets} />
        )}
      </div>
    </div>
  );
}
