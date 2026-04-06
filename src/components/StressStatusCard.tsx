"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STRESS_LABELS } from '@/lib/constants';
import { careAdvisorAdviceGeneration } from '@/ai/flows/care-advisor-advice-generation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface StressStatusCardProps {
  stressLabel: number;
}

export function StressStatusCard({ stressLabel }: StressStatusCardProps) {
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const status = STRESS_LABELS[stressLabel] || STRESS_LABELS[0];

  useEffect(() => {
    async function getAdvice() {
      setLoading(true);
      try {
        const result = await careAdvisorAdviceGeneration({ stressLabel });
        setAiAdvice(result.recommendation);
      } catch (err) {
        setAiAdvice(status.advice);
      } finally {
        setLoading(false);
      }
    }
    getAdvice();

    // Alerts
    if (stressLabel !== 0) {
      toast({
        title: "Plant Stress Detected!",
        description: `Condition: ${status.label}`,
        variant: "destructive",
      });
      if (stressLabel === 1) {
        setTimeout(() => {
          toast({
            title: "Action Taken",
            description: "Pump Activated to water the plant.",
            variant: "default",
          });
        }, 1000);
      }
    }
  }, [stressLabel, status.label, status.advice, toast]);

  return (
    <Card className="h-full overflow-hidden border-2 transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Condition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-muted/20">
          <div className={cn("p-4 rounded-full mb-4", status.color)}>
            <status.icon className="h-12 w-12" />
          </div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            {status.label} {status.emoji}
          </h2>
          <Badge variant="outline" className="mt-2 text-xs opacity-70">
            Label ID: {stressLabel}
          </Badge>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1">
            <span className="h-1.5 w-1.5 bg-primary rounded-full"></span>
            AI Care Advisor
          </h4>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 relative overflow-hidden">
            {loading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-primary/10 rounded w-full"></div>
                <div className="h-3 bg-primary/10 rounded w-4/5"></div>
              </div>
            ) : (
              <p className="text-sm font-medium leading-relaxed">
                {aiAdvice}
              </p>
            )}
            <div className="absolute top-0 right-0 p-1">
              <div className="h-1 w-1 bg-primary/20 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}