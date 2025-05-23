import type { Ticket, PieChartDataItem, BarChartDataItem, LineChartDataItem, TicketStatus } from '@/types';
import { parseISO, isPast, format, startOfDay, subDays, eachDayOfInterval, isEqual } from 'date-fns';

// Using chart colors from globals.css (via CSS variables is ideal, but here we hardcode for simplicity in transformation)
// In a real app, these could be fetched from the theme or passed in.
const chartColors = {
  chart1: "hsl(var(--chart-1))",
  chart2: "hsl(var(--chart-2))",
  chart3: "hsl(var(--chart-3))",
  chart4: "hsl(var(--chart-4))",
  chart5: "hsl(var(--chart-5))",
  destructive: "hsl(var(--destructive))",
};

export function transformTicketsToPieData(tickets: Ticket[]): PieChartDataItem[] {
  const statusCounts: { [key: string]: number } = {};

  tickets.forEach(ticket => {
    let effectiveStatus: string = ticket.status;

    // Determine if ticket is breached
    if (ticket.slaDeadline && isPast(parseISO(ticket.slaDeadline)) && ticket.status !== "Closed" && ticket.status !== "Resolved" && ticket.status !== "Cancelled") {
      effectiveStatus = "Breached";
    }
    
    statusCounts[effectiveStatus] = (statusCounts[effectiveStatus] || 0) + 1;
  });

  const pieData: PieChartDataItem[] = Object.entries(statusCounts).map(([status, count], index) => {
    let color = chartColors.chart1; // Default color
    switch (status) {
      case "Open": color = chartColors.chart1; break;
      case "In Progress": color = chartColors.chart2; break;
      case "Pending": color = chartColors.chart3; break;
      case "Resolved": color = chartColors.chart4; break;
      case "Closed": color = chartColors.chart5; break;
      case "Breached": color = chartColors.destructive; break;
      case "Cancelled": color = "hsl(var(--muted))"; break; // Example for another status
      default: color = chartColors[`chart${(index % 5) + 1}` as keyof typeof chartColors] || chartColors.chart1; // Cycle through available chart colors
    }
    return {
      status: status,
      count: count,
      fill: color,
    };
  });

  return pieData;
}

export function transformTicketsToBarData(tickets: Ticket[]): BarChartDataItem[] {
  const teamCounts: { [key: string]: number } = {};

  tickets.forEach(ticket => {
    const team = ticket.assignedGroup || "Unassigned"; // Use assignedGroup
    teamCounts[team] = (teamCounts[team] || 0) + 1;
  });
  
  return Object.entries(teamCounts)
    .map(([team, count], index) => ({
      team: team,
      count: count,
      fill: chartColors[`chart${(index % 5) + 1}` as keyof typeof chartColors] || chartColors.chart1,
    }))
    .sort((a, b) => b.count - a.count) // Sort by count descending
    .slice(0, 10); // Take top 10 teams or fewer
}

export function transformTicketsToLineData(tickets: Ticket[], days: number = 7): LineChartDataItem[] {
  const lineData: LineChartDataItem[] = [];
  const today = startOfDay(new Date());
  const lastXDays = eachDayOfInterval({
    start: subDays(today, days - 1),
    end: today,
  });

  // Initialize counts for each day
  const dailyResolvedCounts: { [key: string]: number } = {};
  lastXDays.forEach(day => {
    dailyResolvedCounts[format(day, 'yyyy-MM-dd')] = 0;
  });

  tickets.forEach(ticket => {
    if ((ticket.status === "Resolved" || ticket.status === "Closed") && ticket.closedDate) {
      try {
        const closedDay = startOfDay(parseISO(ticket.closedDate));
        const formattedClosedDay = format(closedDay, 'yyyy-MM-dd');
        if (dailyResolvedCounts.hasOwnProperty(formattedClosedDay)) {
          dailyResolvedCounts[formattedClosedDay]++;
        }
      } catch (e) {
        console.warn(`Invalid closedDate format for ticket ${ticket.id}: ${ticket.closedDate}`);
      }
    }
  });
  
  lastXDays.forEach(day => {
    lineData.push({
      date: format(day, 'MMM d'), // e.g., "Jan 23"
      resolved: dailyResolvedCounts[format(day, 'yyyy-MM-dd')] || 0,
    });
  });

  return lineData;
}
