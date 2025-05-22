import type { KpiData, Ticket, PieChartDataItem, BarChartDataItem, LineChartDataItem, TicketStatus, TicketPriority } from '@/types';
import { subDays, formatISO } from 'date-fns';

export const mockKpiData: KpiData = {
  activeTickets: 120,
  pendingTickets: 45,
  breachedTickets: 8,
  closedToday: 23,
};

const generateRandomDate = (start: Date, end: Date): string => {
  return formatISO(new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())));
};

const statuses: TicketStatus[] = ["Open", "In Progress", "Pending", "Resolved", "Closed", "Breached"];
const priorities: TicketPriority[] = ["Critical", "High", "Medium", "Low"];
const owners: string[] = ["Alice Smith", "Bob Johnson", "Charlie Brown", "Diana Prince", "Edward Norton"];
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
  const slaDeadline = generateRandomDate(now, subDays(now, -7)); // SLA in the next 7 days or past

  return {
    id: `BMC-${1000 + i}`,
    title: titles[i % titles.length] + (i > 20 ? ` - Urgent Case ${i}` : ''),
    owner: owners[i % owners.length],
    status: statuses[i % statuses.length],
    priority: priorities[i % priorities.length],
    slaDeadline,
    createdAt,
  };
});

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
  { date: "Mon", resolved: 15 },
  { date: "Tue", resolved: 20 },
  { date: "Wed", resolved: 18 },
  { date: "Thu", resolved: 25 },
  { date: "Fri", resolved: 22 },
  { date: "Sat", resolved: 10 },
  { date: "Sun", resolved: 8 },
];
