"use client";

import { useState, useEffect } from "react";
import { SimulationStep, AlgorithmType } from "@/lib/algorithms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Play, Square, Brain, Info } from "lucide-react";

interface StepVisualizerProps {
  steps: SimulationStep[];
  numFrames: number;
  currentStep: number;
  onStepChange: (step: number) => void;
  isAutoPlay: boolean;
  onAutoPlayToggle: () => void;
  pages: string[];
  onExplainStep: (step: SimulationStep) => void;
}

export function StepVisualizer({
  steps, numFrames, currentStep, onStepChange,
  isAutoPlay, onAutoPlayToggle, pages, onExplainStep,
}: StepVisualizerProps) {
  const [glowFrameIdx, setGlowFrameIdx] = useState<number | null>(null);
  const step = steps[currentStep];
  const prevStep = currentStep > 0 ? steps[currentStep - 1] : null;

  useEffect(() => {
    if (!step || step.isHit) { setGlowFrameIdx(null); return; }
    let idx = -1;
    if (prevStep) {
      idx = step.frames.findIndex((f, i) => f !== prevStep.frames[i]);
    } else {
      idx = step.frames.findIndex(f => f !== null);
    }
    if (idx !== -1) {
      setGlowFrameIdx(idx);
      const t = setTimeout(() => setGlowFrameIdx(null), 1500);
      return () => clearTimeout(t);
    } else {
      setGlowFrameIdx(null);
    }
  }, [currentStep]);

  if (!step) return null;

  const total = steps.length;
  const faultsSoFar = steps.slice(0, currentStep + 1).filter(s => !s.isHit).length;
  const hitsSoFar = currentStep + 1 - faultsSoFar;
  const efficiency = ((hitsSoFar / (currentStep + 1)) * 100).toFixed(1);
  const faultProb = ((faultsSoFar / (currentStep + 1)) * 100).toFixed(1);
  const progress = ((currentStep + 1) / total) * 100;

  return (
    <div className="space-y-5 fade-in-up">
      {/* Live Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Faults So Far", value: faultsSoFar, color: "text-red-500" },
          { label: "Hits So Far",   value: hitsSoFar,   color: "text-green-500" },
          { label: "Efficiency %",  value: `${efficiency}%`, color: "text-primary" },
          { label: "Fault Prob.",   value: `${faultProb}%`,  color: "text-secondary" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-muted/30 rounded-lg p-3 text-center border border-muted/60">
            <div className="text-xs text-muted-foreground mb-1">{label}</div>
            <div className={`text-2xl font-bold font-code ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Step {currentStep + 1} of {total}</span>
          <span>{progress.toFixed(0)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 justify-center flex-wrap">
        <Button variant="outline" size="icon" disabled={currentStep === 0}
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button variant={isAutoPlay ? "destructive" : "default"}
          className="gap-2 min-w-[130px]" onClick={onAutoPlayToggle}>
          {isAutoPlay
            ? <><Square className="h-4 w-4" />Stop</>
            : <><Play  className="h-4 w-4" />Auto-Play</>}
        </Button>
        <Button variant="outline" size="icon" disabled={currentStep >= total - 1}
          onClick={() => onStepChange(Math.min(total - 1, currentStep + 1))}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Reference String Timeline */}
      <div className="rounded-xl border border-muted p-4 bg-card overflow-x-auto">
        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-3">
          Reference String Timeline
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {pages.map((page, i) => {
            const s = steps[i];
            const isCurrent = i === currentStep;
            const isPast = i < currentStep;
            return (
              <button key={i} onClick={() => onStepChange(i)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg font-code text-sm font-bold
                  transition-all duration-200 cursor-pointer border
                  ${isCurrent
                    ? "bg-primary text-primary-foreground scale-125 shadow-[0_0_14px_hsl(var(--primary)/0.7)] border-primary z-10"
                    : isPast
                      ? s.isHit
                        ? "bg-green-500/20 text-green-500 border-green-500/30"
                        : "bg-red-500/20 text-red-500 border-red-500/30"
                      : "bg-muted/30 text-muted-foreground border-muted"}
                `}>
                {page}
              </button>
            );
          })}
        </div>
      </div>

      {/* RAM Slots */}
      <div className="rounded-xl border border-muted p-6 bg-card">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
            Memory Frames (RAM)
          </p>
          <Badge className={`px-4 py-1 text-sm font-bold ${
            step.isHit
              ? "bg-green-500/10 text-green-400 border border-green-500/30"
              : "bg-red-500/10 text-red-400 border border-red-500/30"
          }`}>
            {step.isHit ? "✓ PAGE HIT" : "✗ PAGE FAULT"}
          </Badge>
        </div>
        <div className="flex justify-center gap-4 flex-wrap">
          {step.frames.map((frame, i) => {
            const isGlowing = glowFrameIdx === i;
            const isActive  = frame === step.page;
            const isEmpty   = frame === null;
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="text-xs text-muted-foreground font-code">F{i}</div>
                <div className={`
                  w-20 h-20 flex items-center justify-center rounded-xl
                  font-code text-2xl font-bold border-2 transition-all duration-500
                  ${isGlowing
                    ? "ram-glow border-primary bg-primary/20 text-primary"
                    : isActive
                      ? "border-primary/60 bg-primary/10 text-primary"
                      : isEmpty
                        ? "border-dashed border-muted/60 text-muted-foreground/30"
                        : "border-muted bg-muted/20 text-foreground"}
                `}>
                  {frame ?? "—"}
                </div>
                {isGlowing && (
                  <span className="text-[10px] text-primary font-semibold animate-pulse">LOADED</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Logic Reasoner */}
      <Card className="border-secondary/30 bg-secondary/5">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-secondary mb-1">Logic Reasoner</p>
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-bold text-primary">Page {step.page}</span>{" "}
                {step.isHit
                  ? "was already in memory — this is a PAGE HIT. No frames were modified."
                  : step.replacedPage
                    ? <>caused a PAGE FAULT. <span className="text-muted-foreground italic">{step.reason}</span> Page <span className="font-bold text-red-400">&ldquo;{step.replacedPage}&rdquo;</span> was evicted to make room.</>
                    : <>caused a PAGE FAULT. <span className="text-muted-foreground italic">{step.reason}</span></>
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1.5"
          onClick={() => onExplainStep(step)}>
          <Info className="h-3.5 w-3.5" /> AI Explain This Step
        </Button>
      </div>
    </div>
  );
}
