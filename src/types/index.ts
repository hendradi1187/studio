export type TicketStatus = "Open" | "In Progress" | "Pending" | "Resolved" | "Closed" | "Cancelled" | "Breached";
export type TicketPriority = "Critical" | "High" | "Medium" | "Low";

export interface Ticket {
  id: string; // Incident_Number
  title: string; // Summary
  owner: string; // Assignee
  assignedGroup: string; // Assigned_Group
  status: TicketStatus; // Status
  priority: TicketPriority; // Priority
  slaDeadline: string; // ISO date string from Target_Date
  createdAt: string; // ISO date string from Reported_Date
  closedDate?: string | null; // ISO date string from Closed_Date
  lastModifiedDate?: string | null; // ISO date string from Last_Modified_Date or similar
}

export interface KpiData {
  activeTickets: number;
  pendingTickets: number;
  breachedTickets: number;
  closedToday: number;
}

export interface PieChartDataItem {
  status: string; // Allow any string for status, including "Breached"
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
