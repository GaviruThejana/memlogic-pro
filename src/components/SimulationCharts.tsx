"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ComparisonData {
  name: string;
  faults: number;
  hits: number;
}

interface BeladyData {
  frames: number;
  faults: number;
}

interface SimulationChartsProps {
  comparisonData: ComparisonData[];
  beladyData: BeladyData[];
  activeAlgorithm: string;
}

export function SimulationCharts({ comparisonData, beladyData, activeAlgorithm }: SimulationChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <Card className="bg-card border-muted">
        <CardHeader>
          <CardTitle className="text-lg font-headline text-primary">Algorithm Comparison</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0E0C0B", borderColor: "#201715" }}
                itemStyle={{ color: "#FBCC11" }}
              />
              <Legend />
              <Bar dataKey="faults" fill="#A84722" radius={[4, 4, 0, 0]} name="Page Faults" />
              <Bar dataKey="hits" fill="#FBCC11" radius={[4, 4, 0, 0]} name="Page Hits" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-card border-muted">
        <CardHeader>
          <CardTitle className="text-lg font-headline text-primary">Bélády&apos;s Anomaly Analysis</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={beladyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#201715" vertical={false} />
              <XAxis dataKey="frames" stroke="#888888" fontSize={12} label={{ value: 'Number of Frames', position: 'insideBottom', offset: -5 }} />
              <YAxis stroke="#888888" fontSize={12} label={{ value: 'Page Faults', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0E0C0B", borderColor: "#201715" }}
                itemStyle={{ color: "#FBCC11" }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line
                type="monotone"
                dataKey="faults"
                stroke="#FBCC11"
                strokeWidth={2}
                dot={{ r: 4, fill: "#FBCC11", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#A84722", stroke: "#FBCC11" }}
                name={`${activeAlgorithm} Faults`}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}