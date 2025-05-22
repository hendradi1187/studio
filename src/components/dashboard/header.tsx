
"use client";

import { useState, useEffect } from 'react';
import { RemedyEyeLogo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Clock, Filter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

export function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateDisplay, setCurrentDateDisplay] = useState<string>('Loading date...'); // Placeholder for date
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDateDisplay(now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };

    updateDateTime(); // Set initial date and time on client mount
    const timer = setInterval(updateDateTime, 1000); // Update every second

    return () => clearInterval(timer);
  }, []); // Empty dependency array ensures this runs once on mount and cleans up

  return (
    <header className="flex flex-col md:flex-row items-center justify-between p-4 bg-card shadow-md rounded-lg">
      <div className="flex items-center space-x-3 mb-4 md:mb-0">
        <RemedyEyeLogo />
        <h1 className="text-2xl font-bold text-primary hidden sm:block">Dashboard</h1>
      </div>
      <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
        <div className="flex items-center space-x-2 p-2 bg-secondary rounded-md">
          <Clock className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-secondary-foreground">{currentDateDisplay}</span>
          <span className="text-sm font-bold text-primary">{currentTime}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className="w-[200px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange ? format(dateRange, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateRange}
                onSelect={setDateRange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select defaultValue="all-types">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Ticket Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-types">All Types</SelectItem>
              <SelectItem value="incident">Incident</SelectItem>
              <SelectItem value="service-request">Service Request</SelectItem>
              <SelectItem value="problem">Problem</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-teams">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Support Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-teams">All Teams</SelectItem>
              <SelectItem value="network-ops">Network Ops</SelectItem>
              <SelectItem value="server-admin">Server Admin</SelectItem>
              <SelectItem value="desktop-support">Desktop Support</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all-priorities">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-priorities">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
