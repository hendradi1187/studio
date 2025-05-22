"use client";

import type { BarChartDataItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";

interface TeamBarChartProps {
  data: BarChartDataItem[];
}

const chartConfig = {
  count: {
    label: "Tickets",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function TeamBarChart({ data }: TeamBarChartProps) {
  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle>Jumlah Tiket per Tim Support</CardTitle>
        <CardDescription>Ticket workload distribution across support groups</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="team" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="count" radius={8} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
