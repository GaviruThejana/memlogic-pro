import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  highlight?: boolean;
  variant?: "default" | "success" | "danger";
}

export function MetricCard({ title, value, icon: Icon, description, highlight, variant = "default" }: MetricCardProps) {
  return (
    <Card className={cn(
      "border transition-all duration-300",
      highlight
        ? "border-primary shadow-[0_0_16px_hsl(var(--primary)/0.35)] bg-primary/5"
        : "border-muted bg-card hover:border-primary/40",
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn("h-4 w-4",
          variant === "success" ? "text-green-500" :
          variant === "danger"  ? "text-red-500"  : "text-primary"
        )} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold font-code",
          variant === "success" ? "text-green-500" :
          variant === "danger"  ? "text-red-500"  : "text-foreground"
        )}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}