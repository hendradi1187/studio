export type TicketStatus = "Open" | "In Progress" | "Pending" | "Resolved" | "Closed" | "Breached";
export type TicketPriority = "Critical" | "High" | "Medium" | "Low";

export interface Ticket {
  id: string;
  title: string;
  owner: string;
  status: TicketStatus;
  priority: TicketPriority;
  slaDeadline: string; // ISO date string
  createdAt: string; // ISO date string
}

export interface KpiData {
  activeTickets: number;
  pendingTickets: number;
  breachedTickets: number;
  closedToday: number;
}

export interface PieChartDataItem {
  status: TicketStatus;
  count: number;
  fill?: string; // Optional fill color for chart segments
}

export interface BarChartDataItem {
  team: string;
  count: number;
  fill?: string; // Optional fill color for bars
}

export interface LineChartDataItem {
  date: string; // e.g., "Jan", "Feb" or "Day 1", "Day 2"
  resolved: number;
}
