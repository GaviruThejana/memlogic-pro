"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  AlgorithmType, simulate, runBeladyAnomaly, SimulationStep,
} from "@/lib/algorithms";
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarHeader,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarInset, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input }          from "@/components/ui/input";
import { Label }          from "@/components/ui/label";

import { Button }         from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricCard }        from "@/components/MetricCard";
import { TraceTable }        from "@/components/TraceTable";
import { EducationalSection }from "@/components/EducationalSection";
import { AiAnalysisDialog }  from "@/components/AiAnalysisDialog";
import { StepVisualizer }    from "@/components/StepVisualizer";
import { SummaryDashboard }  from "@/components/SummaryDashboard";
import { useToast }          from "@/hooks/use-toast";
import { Toaster }           from "@/components/ui/toaster";
import {
  Cpu, RefreshCcw, Activity, Percent, CheckCircle2, Settings2,
  Sun, Moon, Table2, Layers, BookOpen, LayoutDashboard, AlertCircle,
} from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: "Standard",      value: "7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1", frames: 3 },
  { label: "Bélády's Case", value: "1,2,3,4,1,2,5,1,2,3,4,5",                 frames: 3 },
  { label: "Simple 5-page", value: "0,1,2,3,0,4,0,3,1,4",                      frames: 4 },
];

function validatePages(raw: string): string[] | null {
  const pages = raw.split(",").map(p => p.trim()).filter(Boolean);
  if (!pages.length) return null;
  if (pages.some(p => !/^\d+$/.test(p))) return null;
  return pages;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function MemLogicPro() {
  // Core state
  const [refStringRaw, setRefStringRaw] = useState("7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1");
  const [numFrames, setNumFrames]       = useState(3);
  const [algorithm, setAlgorithm]       = useState<AlgorithmType>("FIFO");
  // Step-by-step
  const [currentStep, setCurrentStep]   = useState(0);
  const [isAutoPlay, setIsAutoPlay]     = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(false);
  // UI
  const [isDark, setIsDark]             = useState(true);
  const [activeTab, setActiveTab]       = useState("simulator");
  // AI Dialog
  const [selectedStep, setSelectedStep] = useState<SimulationStep | null>(null);
  const [isAiOpen, setIsAiOpen]         = useState(false);

  const { toast } = useToast();
  const autoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepsLenRef     = useRef(0);

  // ── Dark mode sync ──────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // ── Reset step on config change ─────────────────────────────────────────────
  useEffect(() => {
    setCurrentStep(0);
    setIsAutoPlay(false);
    setIsTableVisible(false);
  }, [refStringRaw, numFrames, algorithm]);

  // ── Validated pages ─────────────────────────────────────────────────────────
  const validPages = useMemo(() => validatePages(refStringRaw), [refStringRaw]);

  // ── Simulation result ───────────────────────────────────────────────────────
  const result = useMemo(() => {
    if (!validPages) return null;
    return simulate(algorithm, validPages, numFrames);
  }, [validPages, numFrames, algorithm]);

  stepsLenRef.current = result?.steps.length ?? 0;

  // ── Belady's anomaly data (FIFO only) ───────────────────────────────────────
  const beladyData = useMemo(() => {
    if (!validPages) return [];
    return runBeladyAnomaly("FIFO", validPages);
  }, [validPages]);

  // ── Auto-play ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isAutoPlay) {
      autoIntervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= stepsLenRef.current - 1) {
            setIsAutoPlay(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1100);
    } else {
      if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
    }
    return () => { if (autoIntervalRef.current) clearInterval(autoIntervalRef.current); };
  }, [isAutoPlay]);

  // ── Input change with validation feedback ───────────────────────────────────
  const handleInputChange = (raw: string) => {
    setRefStringRaw(raw);
    const pages = raw.split(",").map(p => p.trim()).filter(Boolean);
    if (pages.length && pages.some(p => !/^\d+$/.test(p))) {
      toast({
        title:       "Invalid Reference String",
        description: "Please enter numeric values only (e.g., 7, 0, 1, 2).",
        variant:     "destructive",
      });
    }
  };

  const handlePreset = (preset: typeof PRESETS[0]) => {
    setRefStringRaw(preset.value);
    setNumFrames(preset.frames);
    setAlgorithm("FIFO");
  };

  const handleApplyScenario = (changes: { referenceString?: string; numFrames?: number; algorithm?: AlgorithmType }) => {
    if (changes.referenceString) setRefStringRaw(changes.referenceString);
    if (changes.numFrames)       setNumFrames(changes.numFrames);
    if (changes.algorithm)       setAlgorithm(changes.algorithm);
  };

  const handleReset = () => {
    setRefStringRaw("7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1");
    setNumFrames(3);
    setAlgorithm("FIFO");
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">

        {/* ── Sidebar ── */}
        <Sidebar className="border-r border-muted bg-sidebar">
          <SidebarHeader className="p-4 flex items-center justify-between border-b border-muted">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Cpu className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-headline font-bold text-primary tracking-tight">MemLogic Pro</h1>
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">Simulator Core v2.0</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsDark(d => !d)}
              title="Toggle theme">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </SidebarHeader>

          <SidebarContent className="p-3 space-y-4">
            {/* Presets */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-primary font-bold">Quick Presets</SidebarGroupLabel>
              <SidebarGroupContent className="flex flex-col gap-1.5">
                {PRESETS.map(p => (
                  <Button key={p.label} variant="outline" size="sm"
                    className="w-full text-xs justify-start gap-2 border-muted hover:border-primary hover:text-primary"
                    onClick={() => handlePreset(p)}>
                    {p.label}
                  </Button>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Reference String */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-primary font-bold">Reference String</SidebarGroupLabel>
              <SidebarGroupContent className="space-y-1.5">
                <Input
                  value={refStringRaw}
                  onChange={e => handleInputChange(e.target.value)}
                  placeholder="e.g. 7,0,1,2,0,3"
                  className={`font-code text-xs ${!validPages && refStringRaw ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {!validPages && refStringRaw && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Numeric values only, comma-separated
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground">Separate pages with commas</p>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Frames */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-primary font-bold">Frames</SidebarGroupLabel>
              <SidebarGroupContent className="px-1">
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={numFrames}
                  onChange={e => {
                    const v = Math.min(10, Math.max(1, Number(e.target.value)));
                    if (!isNaN(v)) setNumFrames(v);
                  }}
                  className="font-code text-sm w-full"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Enter a value between 1 and 10</p>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Algorithm */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-primary font-bold">Algorithm</SidebarGroupLabel>
              <SidebarGroupContent>
                <RadioGroup value={algorithm} onValueChange={v => setAlgorithm(v as AlgorithmType)}
                  className="grid gap-1.5">
                  {(["FIFO", "LRU", "LFU", "MFU"] as AlgorithmType[]).map(alg => (
                    <div key={alg}
                      className={`flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer transition-all
                        ${algorithm === alg
                          ? "border-primary bg-primary/10"
                          : "border-muted hover:border-primary/40 hover:bg-muted/30"}`}>
                      <RadioGroupItem value={alg} id={`algo-${alg}`} className="border-primary" />
                      <Label htmlFor={`algo-${alg}`} className="flex-1 text-sm font-medium cursor-pointer">
                        {alg}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Reset */}
            <div className="px-1">
              <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                variant="ghost" onClick={handleReset}>
                <RefreshCcw className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* ── Main Content ── */}
        <SidebarInset className="flex-1 flex flex-col overflow-y-auto">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-muted bg-background/80 px-5 backdrop-blur-md no-print">
            <SidebarTrigger />
            <div className="h-4 w-px bg-muted" />
            <h2 className="text-base font-headline font-semibold text-foreground">
              Simulation Dashboard
              <span className="mx-2 text-primary">/</span>
              <span className="text-muted-foreground font-normal">{algorithm} · {numFrames} Frames</span>
            </h2>
          </header>

          <main className="flex-1 p-5 max-w-7xl mx-auto w-full">
            {!validPages ? (
              /* ── Error State ── */
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-xl font-headline text-foreground">Invalid Reference String</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                  Please enter a valid numeric reference string (e.g., <code className="font-code text-primary">7, 0, 1, 2</code>).
                  Use the preset buttons in the sidebar to get started quickly.
                </p>
              </div>
            ) : !result ? null : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-muted/40 border border-muted no-print">
                  <TabsTrigger value="simulator"  className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Layers className="h-4 w-4" />Simulator
                  </TabsTrigger>
                  <TabsTrigger value="comparison" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <LayoutDashboard className="h-4 w-4" />Comparison
                  </TabsTrigger>
                  <TabsTrigger value="theory"     className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <BookOpen className="h-4 w-4" />Theory
                  </TabsTrigger>
                </TabsList>

                {/* ── Simulator Tab ── */}
                <TabsContent value="simulator" className="space-y-6">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <MetricCard title="Page Faults"     value={result.faults}
                      icon={Activity}    description="Total cache misses"   variant="danger" />
                    <MetricCard title="Page Hits"       value={result.hits}
                      icon={CheckCircle2} description="Total cache hits"    variant="success" />
                    <MetricCard title="Hit Ratio"       value={result.hitRatio.toFixed(3)}
                      icon={Percent}     description="Efficiency of memory" highlight={result.hitRatio > 0.5} />
                    <MetricCard title="Fault Rate"      value={`${result.faultPercentage.toFixed(1)}%`}
                      icon={Settings2}   description="Missed lookup %" />
                  </div>

                  {/* Step Visualizer */}
                  <StepVisualizer
                    steps={result.steps}
                    numFrames={numFrames}
                    currentStep={currentStep}
                    onStepChange={setCurrentStep}
                    isAutoPlay={isAutoPlay}
                    onAutoPlayToggle={() => setIsAutoPlay(p => !p)}
                    pages={validPages}
                    onExplainStep={step => { setSelectedStep(step); setIsAiOpen(true); }}
                  />

                  {/* Trace Table toggle */}
                  <div>
                    <Button variant="outline" size="sm" className="gap-2 mb-3 no-print"
                      onClick={() => setIsTableVisible(v => !v)}>
                      <Table2 className="h-4 w-4" />
                      {isTableVisible ? "Hide" : "Show"} Full Trace Table
                    </Button>
                    {isTableVisible && (
                      <TraceTable steps={result.steps} numFrames={numFrames}
                        onExplainStep={step => { setSelectedStep(step); setIsAiOpen(true); }} />
                    )}
                  </div>
                </TabsContent>

                {/* ── Comparison Tab ── */}
                <TabsContent value="comparison" className="space-y-6">
                  <SummaryDashboard
                    pages={validPages}
                    numFrames={numFrames}
                    beladyData={beladyData}
                  />
                </TabsContent>

                {/* ── Theory Tab ── */}
                <TabsContent value="theory">
                  <EducationalSection />
                </TabsContent>
              </Tabs>
            )}
          </main>

          {/* Footer */}
          <footer className="border-t border-muted p-6 text-center text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground tracking-wide">
              Gaviru Thejana
            </p>
            <p>Computer Department, University of Jaffna</p>
            <p className="text-muted-foreground/60 mt-1">©MemLogic Pro | Advanced OS Page Replacement Simulator</p>
          </footer>
        </SidebarInset>
      </div>

      {/* AI Dialog */}
      {selectedStep && (
        <AiAnalysisDialog
          step={selectedStep}
          algorithm={algorithm}
          numFrames={numFrames}
          referenceString={refStringRaw}
          open={isAiOpen}
          onOpenChange={setIsAiOpen}
          onApplyScenario={handleApplyScenario}
        />
      )}
      <Toaster />
    </SidebarProvider>
  );
}