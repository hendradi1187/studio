"use client";

import type { Ticket, TicketPriority, TicketStatus } from "@/types";
import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  Download,
  CircleDot,
  Loader2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowUpCircle,
  ArrowRightCircle,
  ArrowDownCircle,
  ShieldAlert,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface TicketTableProps {
  initialTickets: Ticket[];
}

type SortKey = keyof Ticket | "";
type SortOrder = "asc" | "desc";

const PriorityIcon: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
  switch (priority) {
    case "Critical":
      return <AlertOctagon className="h-5 w-5 text-red-600" />;
    case "High":
      return <ArrowUpCircle className="h-5 w-5 text-orange-500" />;
    case "Medium":
      return <ArrowRightCircle className="h-5 w-5 text-yellow-500" />;
    case "Low":
      return <ArrowDownCircle className="h-5 w-5 text-green-500" />;
    default:
      return null;
  }
};

const StatusIcon: React.FC<{ status: TicketStatus }> = ({ status }) => {
  switch (status) {
    case "Open":
      return <CircleDot className="h-5 w-5 text-blue-500" />;
    case "In Progress":
      return <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />;
    case "Pending":
      return <Clock className="h-5 w-5 text-yellow-600" />;
    case "Resolved":
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case "Closed":
      return <CheckCircle2 className="h-5 w-5 text-gray-500" />;
    case "Breached":
      return <ShieldAlert className="h-5 w-5 text-red-700" />;
    default:
      return null;
  }
};


export function TicketTable({ initialTickets }: TicketTableProps) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedAndFilteredTickets = useMemo(() => {
    let filtered = tickets.filter((ticket) =>
      Object.values(ticket).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (sortKey) {
      filtered.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [tickets, searchTerm, sortKey, sortOrder]);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return "Invalid Date";
    }
  };
  
  // Placeholder for export functionality
  const handleExport = () => {
    alert("Export to Excel functionality is not implemented in this demo.");
  };

  return (
    <div className="p-4 md:p-6 bg-card shadow-lg rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <Input
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm text-base"
        />
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {[
                { key: "id", label: "ID Tiket" },
                { key: "title", label: "Judul" },
                { key: "owner", label: "Pemilik" },
                { key: "status", label: "Status" },
                { key: "priority", label: "Priority" },
                { key: "slaDeadline", label: "SLA Deadline" },
                { key: "createdAt", label: "Waktu Dibuat" },
              ].map((col) => (
                <TableHead key={col.key} onClick={() => handleSort(col.key as SortKey)} className="cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center">
                    {col.label}
                    {sortKey === col.key && <ArrowUpDown className="ml-2 h-4 w-4" />}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredTickets.map((ticket) => (
              <TableRow key={ticket.id} className="hover:bg-muted/20">
                <TableCell className="font-medium">{ticket.id}</TableCell>
                <TableCell className="max-w-xs truncate">{ticket.title}</TableCell>
                <TableCell>{ticket.owner}</TableCell>
                <TableCell>
                  <Badge variant={ticket.status === 'Breached' ? 'destructive' : 'secondary'} className="flex items-center gap-1.5 whitespace-nowrap">
                    <StatusIcon status={ticket.status} />
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-1.5">
                    <PriorityIcon priority={ticket.priority} />
                    {ticket.priority}
                   </div>
                </TableCell>
                <TableCell>{formatDate(ticket.slaDeadline)}</TableCell>
                <TableCell>{formatDate(ticket.createdAt)}</TableCell>
              </TableRow>
            ))}
            {sortedAndFilteredTickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
