import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Zap, Clock } from "lucide-react";

export function EducationalSection() {
  const algorithms = [
    {
      id: "FIFO",
      name: "First-In-First-Out",
      desc: "Simplest algorithm. It keeps track of all pages in a queue, and the oldest page is at the front. When a page needs to be replaced, the page at the front is selected.",
      logic: "Maintain a pointer or queue indicating the oldest page.",
      complexity: "O(n) per access",
      pros: "Simple to implement, low overhead.",
      cons: "Suffers from Bélády's Anomaly (more frames can lead to more faults)."
    },
    {
      id: "LRU",
      name: "Least Recently Used",
      desc: "Replaces the page that has not been used for the longest period of time. It assumes that pages used recently will be used again soon.",
      logic: "Track time of last access for each frame.",
      complexity: "O(n) per access (naive), O(1) with hash map + doubly linked list",
      pros: "Excellent performance, close to optimal in many cases.",
      cons: "Requires significant hardware support or complex software tracking."
    },
    {
      id: "LFU",
      name: "Least Frequently Used",
      desc: "Keeps track of how many times a page is used. The page with the smallest count is replaced when a fault occurs.",
      logic: "Maintain a frequency counter for each page.",
      complexity: "O(n) per access",
      pros: "Captures the relative 'importance' of pages over time.",
      cons: "Pages used heavily once but never again remain in memory too long."
    },
    {
      id: "MFU",
      name: "Most Frequently Used",
      desc: "Based on the argument that the page with the smallest count was probably just brought in and has yet to be used.",
      logic: "Maintain a frequency counter; replace page with highest count.",
      complexity: "O(n) per access",
      pros: "Alternative perspective on frequency-based replacement.",
      cons: "Rarely used in practice as it contradicts common spatial/temporal locality."
    }
  ];

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-headline text-primary mb-6 flex items-center gap-2">
        <BookOpen className="h-6 w-6" /> Theory & Fundamentals
      </h2>
      <Tabs defaultValue="FIFO" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 border border-muted">
          {algorithms.map((algo) => (
            <TabsTrigger key={algo.id} value={algo.id} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {algo.id}
            </TabsTrigger>
          ))}
        </TabsList>
        {algorithms.map((algo) => (
          <TabsContent key={algo.id} value={algo.id} className="mt-4">
            <Card className="bg-card border-muted border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="text-xl text-primary font-headline">{algo.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{algo.desc}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-3 rounded-md">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-secondary mb-1">
                      <Zap className="h-4 w-4" /> Operational Logic
                    </h4>
                    <p className="text-sm text-foreground">{algo.logic}</p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-secondary mb-1">
                      <Clock className="h-4 w-4" /> Complexity
                    </h4>
                    <p className="text-sm font-code text-foreground">{algo.complexity}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-bold text-green-500">Pros:</span> {algo.pros}
                  </div>
                  <div>
                    <span className="font-bold text-red-500">Cons:</span> {algo.cons}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}