"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SimulationStep } from "@/lib/algorithms";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TraceTableProps {
  steps: SimulationStep[];
  numFrames: number;
  onExplainStep: (step: SimulationStep) => void;
}

export function TraceTable({ steps, numFrames, onExplainStep }: TraceTableProps) {
  return (
    <div className="rounded-lg border border-muted bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-muted">
            <TableHead className="w-16">Step</TableHead>
            <TableHead className="w-24">Page</TableHead>
            <TableHead>Memory Frames</TableHead>
            <TableHead className="w-32 text-center">Result</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {steps.map((step) => (
            <TableRow key={step.index} className="border-muted/50 transition-colors hover:bg-muted/30">
              <TableCell className="font-code text-muted-foreground">{step.index + 1}</TableCell>
              <TableCell className="font-bold text-lg text-primary">{step.page}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {step.frames.map((frame, i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 flex items-center justify-center rounded border font-code text-sm transition-all duration-300 ${
                        frame === step.page
                          ? "border-primary bg-primary/10 text-primary font-bold scale-110"
                          : frame === null
                          ? "border-dashed border-muted text-muted-foreground"
                          : "border-muted text-foreground"
                      }`}
                    >
                      {frame ?? "-"}
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={step.isHit ? "default" : "secondary"}
                  className={`px-3 py-1 ${
                    step.isHit 
                    ? "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20" 
                    : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                  }`}
                >
                  {step.isHit ? "HIT" : "FAULT"}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => onExplainStep(step)}
                  title="AI Explain"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}