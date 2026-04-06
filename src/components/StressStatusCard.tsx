"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STRESS_LABELS } from '@/lib/constants';
import { careAdvisorAdviceGeneration } from '@/ai/flows/care-advisor-advice-generation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Bot, CheckCircle2, Info } from 'lucide-react';

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

    if (stressLabel !== 0) {
      toast({
        title: "Plant Stress Detected!",
        description: `Condition: ${status.label}`,
        variant: "destructive",
      });
    }
  }, [stressLabel, status.label, status.advice, toast]);

  const checklist = [
    { label: "Check environmental sensors", done: true },
    { label: "Verify soil moisture levels", done: true },
    { label: "Observe leaf patterns", done: false },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      {/* Visual Status */}
      <Card className="dashboard-card border-2 border-primary/20 overflow-hidden bg-white">
        <CardContent className="p-8 h-full flex flex-col items-center justify-center text-center">
          <div className={cn("p-6 rounded-full mb-6", status.color)}>
            <status.icon className="h-16 w-16" />
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-primary">
            {status.label}
          </h2>
          <Badge variant="secondary" className="mt-4 px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-widest opacity-60">
            Code {stressLabel}
          </Badge>
          <p className="mt-4 text-4xl">{status.emoji}</p>
        </CardContent>
      </Card>

      {/* AI Care Advisor */}
      <Card className="dashboard-card border-2 border-primary/5 bg-white">
        <CardContent className="p-8 space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-black text-primary uppercase tracking-widest">AI Care Advisor</h3>
              <p className="text-[10px] text-muted-foreground font-bold">Personalized plant recommendations</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 relative">
            <div className="flex gap-3">
              <status.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                {loading ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-2 bg-primary/20 rounded w-full" />
                    <div className="h-2 bg-primary/20 rounded w-4/5" />
                  </div>
                ) : (
                  <p className="text-xs font-bold leading-relaxed text-zinc-700">
                    {aiAdvice || status.advice}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 transition-all hover:bg-zinc-100">
                <CheckCircle2 className={cn("h-4 w-4", item.done ? "text-green-500" : "text-zinc-300")} />
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}