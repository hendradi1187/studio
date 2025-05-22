"use client";

import type { PieChartDataItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";

interface StatusPieChartProps {
  data: PieChartDataItem[];
}

const chartConfig = {
  count: {
    label: "Tickets",
  },
  Open: { label: "Open", color: "hsl(var(--chart-1))" },
  "In Progress": { label: "In Progress", color: "hsl(var(--chart-2))" },
  Pending: { label: "Pending", color: "hsl(var(--chart-3))" },
  Resolved: { label: "Resolved", color: "hsl(var(--chart-4))" },
  Closed: { label: "Closed", color: "hsl(var(--chart-5))" },
  Breached: { label: "Breached", color: "hsl(var(--destructive))" },
} satisfies ChartConfig;


export function StatusPieChart({ data }: StatusPieChartProps) {
  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle>Distribusi Tiket by Status</CardTitle>
        <CardDescription>Current ticket status breakdown</CardDescription>
      </CardHeader>
      <CardContent className="flex aspect-square items-center justify-center pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[300px]">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={100}
              labelLine={false}
              label={({ percent, status }) => `${status}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry) => (
                <Cell key={`cell-${entry.status}`} fill={entry.fill || chartConfig[entry.status as keyof typeof chartConfig]?.color} />
              ))}
            </Pie>
             <ChartLegend content={<ChartLegendContent nameKey="status" />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
