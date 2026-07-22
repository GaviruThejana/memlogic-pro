"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BrainCircuit, RefreshCw, Lightbulb } from "lucide-react";
import { explainPageFault, AiPageFaultExplanationOutput, AiPageFaultExplanationInput } from "@/ai/flows/ai-page-fault-explanation";
import { SimulationStep, AlgorithmType } from "@/lib/algorithms";

interface AiAnalysisDialogProps {
  step: SimulationStep | null;
  algorithm: AlgorithmType;
  referenceString: string;
  numFrames: number;
  onApplyScenario: (changes: any) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiAnalysisDialog({
  step,
  algorithm,
  referenceString,
  numFrames,
  onApplyScenario,
  open,
  onOpenChange
}: AiAnalysisDialogProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AiPageFaultExplanationOutput | null>(null);

  const fetchAnalysis = async () => {
    if (!step) return;
    setLoading(true);
    try {
      const input: AiPageFaultExplanationInput = {
        algorithm,
        referenceString,
        numFrames,
        currentAccessIndex: step.index,
        pageAccessed: step.page,
        isHit: step.isHit,
        framesBefore: step.index > 0 ? [] : [], // We'd need actual before state if strict, but flow is flexible
        framesAfter: step.frames.map(f => f ?? ""),
        pageReplaced: step.replacedPage ?? undefined,
        replacementReason: step.reason,
      };
      
      // Attempting to mock 'framesBefore' for better context
      // This is simplified for this UI version
      const result = await explainPageFault(input);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    if (open && step && !analysis) {
      fetchAnalysis();
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-muted max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary font-headline text-2xl">
            <BrainCircuit className="h-6 w-6" /> AI Scenario Insight
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Analysis of Step {step ? step.index + 1 : ""}: Page {step?.page} ({step?.isHit ? "Hit" : "Fault"})
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm font-medium animate-pulse">Consulting the logic core...</p>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            <section className="bg-muted/20 p-4 rounded-lg border border-muted">
              <h4 className="text-sm font-bold text-secondary flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4" /> Explanation
              </h4>
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {analysis.explanation}
              </p>
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-bold text-secondary">Suggested Scenarios to Explore</h4>
              <div className="grid gap-3">
                {analysis.suggestedScenarios.map((scenario, i) => (
                  <div key={i} className="bg-muted/10 p-4 rounded-lg border border-muted hover:border-primary/30 transition-all">
                    <p className="text-sm font-medium mb-3">{scenario.description}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-primary/40 hover:bg-primary hover:text-primary-foreground"
                      onClick={() => {
                        onApplyScenario(scenario.changes);
                        onOpenChange(false);
                      }}
                    >
                      Apply Scenario
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="text-center py-6">
            <Button onClick={fetchAnalysis}>Generate Analysis</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}