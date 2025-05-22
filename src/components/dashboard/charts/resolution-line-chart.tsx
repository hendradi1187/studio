"use client";

import type { LineChartDataItem } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";

interface ResolutionLineChartProps {
  data: LineChartDataItem[];
}

const chartConfig = {
  resolved: {
    label: "Resolved Tickets",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ResolutionLineChart({ data }: ResolutionLineChartProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Tren Penyelesaian Tiket</CardTitle>
        <CardDescription>Number of tickets resolved over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 20,
                left: -20, // Adjusted for YAxis labels
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Line
                dataKey="resolved"
                type="monotone"
                stroke="var(--color-resolved)"
                strokeWidth={3}
                dot={{
                  fill: "var(--color-resolved)",
                  r: 5,
                }}
                activeDot={{
                  r: 7,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
