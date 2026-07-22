"use client";

import { useMemo } from "react";
import { AlgorithmType, simulate } from "@/lib/algorithms";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Printer, Trophy, AlertTriangle, CheckCircle2 } from "lucide-react";

interface SummaryDashboardProps {
  pages: string[];
  numFrames: number;
  beladyData: { frames: number; faults: number }[];
}

const ALGO_COLORS: Record<string, string> = {
  FIFO: "#FBCC11",
  LRU:  "#A84722",
  LFU:  "#22c55e",
  MFU:  "#a855f7",
};

export function SummaryDashboard({ pages, numFrames, beladyData }: SummaryDashboardProps) {
  const algos: AlgorithmType[] = ["FIFO", "LRU", "LFU", "MFU"];

  const results = useMemo(() => {
    return algos.map(a => {
      const r = simulate(a, pages, numFrames);
      return { name: a, faults: r.faults, hits: r.hits, hitRatio: r.hitRatio, isBest: false };
    });
  }, [pages, numFrames]);

  const minFaults = Math.min(...results.map(r => r.faults));
  results.forEach(r => { r.isBest = r.faults === minFaults; });

  const beladyDetected = beladyData.some((d, i) => i > 0 && d.faults > beladyData[i - 1].faults);

  const exportCSV = () => {
    const header = "Algorithm,Page Faults,Page Hits,Hit Ratio\n";
    const rows = results.map(r => `${r.name},${r.faults},${r.hits},${r.hitRatio.toFixed(3)}`).join("\n");
    const meta = `\n\nReference String: "${pages.join(",")}"\nFrames: ${numFrames}`;
    const blob = new Blob([header + rows + meta], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement("a"), { href: url, download: "memlogic-report.csv" });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Algorithm Comparison Cards */}
      <div>
        <h3 className="text-lg font-headline font-semibold text-foreground mb-4">
          All Algorithms — {numFrames} Frames
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {results.map(r => (
            <Card key={r.name} className={`relative border-2 transition-all duration-300
              ${r.isBest
                ? "border-primary shadow-[0_0_24px_hsl(var(--primary)/0.4)]"
                : "border-muted"}`}>
              {r.isBest && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-primary text-primary-foreground gap-1 text-xs px-2">
                    <Trophy className="h-3 w-3" /> Best
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-2 pt-5">
                <CardTitle className={`text-center font-headline text-lg
                  ${r.isBest ? "text-primary" : "text-foreground"}`}>
                  {r.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-center pb-5">
                <div>
                  <div className="text-3xl font-bold text-red-500 font-code">{r.faults}</div>
                  <div className="text-xs text-muted-foreground">Page Faults</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500 font-code">{r.hits}</div>
                  <div className="text-xs text-muted-foreground">Page Hits</div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-primary font-code">
                    {(r.hitRatio * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Hit Ratio</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faults Bar Chart */}
        <Card className="bg-card border-muted">
          <CardHeader>
            <CardTitle className="text-base font-headline">Page Faults Comparison</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={results} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                />
                <Legend />
                <Bar dataKey="faults" name="Page Faults" radius={[6, 6, 0, 0]}>
                  {results.map((r, i) => (
                    <Cell key={i} fill={ALGO_COLORS[r.name] ?? "#888"} opacity={r.isBest ? 1 : 0.7} />
                  ))}
                </Bar>
                <Bar dataKey="hits" name="Page Hits" fill="hsl(var(--chart-3))" radius={[6, 6, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Belady's Anomaly Line Chart */}
        <Card className="bg-card border-muted">
          <CardHeader>
            <CardTitle className="text-base font-headline flex items-center gap-2 flex-wrap">
              Bélády&rsquo;s Anomaly — FIFO
              {beladyDetected
                ? <Badge variant="destructive" className="text-xs gap-1"><AlertTriangle className="h-3 w-3" />Anomaly!</Badge>
                : <Badge className="text-xs gap-1 bg-green-500/20 text-green-500 border-green-500/30"><CheckCircle2 className="h-3 w-3" />Not Detected</Badge>
              }
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={beladyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
                <XAxis dataKey="frames" stroke="hsl(var(--muted-foreground))" fontSize={12}
                  label={{ value: "# Frames", position: "insideBottom", offset: -4, fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12}
                  label={{ value: "Faults", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                />
                <Line type="monotone" dataKey="faults" name="Page Faults"
                  stroke="hsl(var(--primary))" strokeWidth={2.5}
                  dot={{ r: 5, fill: "hsl(var(--primary))", strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: "hsl(var(--secondary))", stroke: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-3 flex-wrap no-print">
        <Button onClick={exportCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Download CSV Report
        </Button>
        <Button onClick={() => window.print()} variant="outline" className="gap-2">
          <Printer className="h-4 w-4" /> Print Report
        </Button>
      </div>
    </div>
  );
}
