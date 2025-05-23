import type { KpiData, Ticket, PieChartDataItem, BarChartDataItem, LineChartDataItem, TicketStatus, TicketPriority } from '@/types';
import { subDays, formatISO, addDays } from 'date-fns';

// This file is kept for reference or fallback testing but is not used for live data display.

export const mockKpiData: KpiData = {
  activeTickets: 120,
  pendingTickets: 45,
  breachedTickets: 8,
  closedToday: 23,
};

const generateRandomDate = (start: Date, end: Date): string => {
  return formatISO(new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())));
};

const statuses: TicketStatus[] = ["Open", "In Progress", "Pending", "Resolved", "Closed", "Breached", "Cancelled"];
const priorities: TicketPriority[] = ["Critical", "High", "Medium", "Low"];
const owners: string[] = ["Alice Smith", "Bob Johnson", "Charlie Brown", "Diana Prince", "Edward Norton"];
const assignedGroups: string[] = ["Network Ops", "Server Admin", "Desktop Support", "App Support", "Security Team"];
const titles: string[] = [
  "Network outage in Building A",
  "Email server slow",
  "Printer not working on 3rd floor",
  "Software license renewal",
  "VPN access issue for remote user",
  "Password reset request",
  "Application deployment failure",
  "Database connection error",
  "Security vulnerability patch",
  "New user account setup",
];

export const mockTickets: Ticket[] = Array.from({ length: 50 }, (_, i) => {
  const now = new Date();
  const createdAt = generateRandomDate(subDays(now, 30), now);
  let slaDeadlineDate = addDays(parseISO(createdAt), Math.floor(Math.random() * 10) + 1); // SLA 1-10 days after creation
  // Make some SLAs in the past
  if (i % 5 === 0) {
    slaDeadlineDate = subDays(now, Math.floor(Math.random() * 5));
  }
  const slaDeadline = formatISO(slaDeadlineDate);
  
  const status = statuses[i % statuses.length];
  let closedDate: string | null = null;
  if (status === "Closed" || status === "Resolved") {
    closedDate = generateRandomDate(parseISO(createdAt), now);
  }


  return {
    id: `BMC-${1000 + i}`,
    title: titles[i % titles.length] + (i > 20 ? ` - Urgent Case ${i}` : ''),
    owner: owners[i % owners.length],
    assignedGroup: assignedGroups[i % assignedGroups.length],
    status: status,
    priority: priorities[i % priorities.length],
    slaDeadline,
    createdAt,
    closedDate,
    lastModifiedDate: generateRandomDate(parseISO(createdAt), now),
  };
});

// Mock chart data generators, assuming they might still be useful for isolated component testing.
export const mockPieChartData: PieChartDataItem[] = [
  { status: "Open", count: 30, fill: "hsl(var(--chart-1))" },
  { status: "In Progress", count: 50, fill: "hsl(var(--chart-2))" },
  { status: "Pending", count: 25, fill: "hsl(var(--chart-3))" },
  { status: "Resolved", count: 10, fill: "hsl(var(--chart-4))" },
  { status: "Breached", count: 5, fill: "hsl(var(--destructive))" },
];

export const mockBarChartData: BarChartDataItem[] = [
  { team: "Network Ops", count: 25, fill: "hsl(var(--chart-1))" },
  { team: "Server Admin", count: 40, fill: "hsl(var(--chart-2))" },
  { team: "Desktop Support", count: 30, fill: "hsl(var(--chart-3))" },
  { team: "App Support", count: 15, fill: "hsl(var(--chart-4))" },
  { team: "Security Team", count: 10, fill: "hsl(var(--chart-5))" },
];

export const mockLineChartData: LineChartDataItem[] = [
  { date: format(subDays(new Date(), 6), "MMM d"), resolved: 15 },
  { date: format(subDays(new Date(), 5), "MMM d"), resolved: 20 },
  { date: format(subDays(new Date(), 4), "MMM d"), resolved: 18 },
  { date: format(subDays(new Date(), 3), "MMM d"), resolved: 25 },
  { date: format(subDays(new Date(), 2), "MMM d"), resolved: 22 },
  { date: format(subDays(new Date(), 1), "MMM d"), resolved: 10 },
  { date: format(new Date(), "MMM d"), resolved: 8 },
];
