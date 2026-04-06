"use client"

import React, { useState, useEffect } from 'react';
import { useThingSpeak } from '@/hooks/useThingSpeak';
import { StressStatusCard } from '@/components/StressStatusCard';
import { ChatbotFloating } from '@/components/ChatbotFloating';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { STRESS_LABELS, REFRESH_INTERVAL } from '@/lib/constants';
import { 
  Leaf, 
  Activity, 
  TrendingDown, 
  BarChart3, 
  Download,
  LineChart as LineChartIcon,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function Home() {
  const { data, history, loading, error } = useThingSpeak();
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
  const [activeLang, setActiveLang] = useState('en');

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : REFRESH_INTERVAL / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const exportCSV = () => {
    if (!history.length) return;
    const headers = ['Timestamp', 'Value (Raw)', 'Diff', 'Avg', 'Stress Label'];
    const rows = history.map(feed => [
      feed.created_at,
      feed.field1,
      feed.field2,
      feed.field3,
      STRESS_LABELS[parseInt(feed.field4)]?.label || 'Unknown'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `plantspeak_data_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const metrics = [
    { label: 'RAW VALUE', value: data?.field1, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'DIFFERENCE', value: data?.field2, icon: TrendingDown, color: 'text-pink-500', bg: 'bg-pink-50' },
    { label: 'AVERAGE', value: data?.field3, icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

  const languages = [
    { id: 'en', label: 'English' },
    { id: 'ta', label: 'Tamil' },
    { id: 'hi', label: 'Hindi' },
  ];

  const chartData = history.map(h => ({
    time: new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    raw: parseFloat(h.field1) || 0,
    avg: parseFloat(h.field3) || 0,
  }));

  const chartConfig = {
    raw: { label: "Raw Value", color: "hsl(var(--primary))" },
    avg: { label: "Average", color: "hsl(var(--secondary))" },
  };

  const currentStress = data ? (STRESS_LABELS[parseInt(data.field4)] || STRESS_LABELS[0]) : STRESS_LABELS[0];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="w-full bg-primary text-primary-foreground py-3 px-6 flex items-center justify-between shadow-lg sticky top-0 z-50">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 fill-current" />
            <h1 className="text-xl font-black tracking-tight leading-none">PlantSpeakAI</h1>
          </div>
          <p className="text-[10px] font-medium opacity-80 uppercase tracking-tighter ml-8">Bio-Electric Health Monitor</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={exportCSV}
            className="hidden sm:flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full text-[10px] font-bold uppercase"
          >
            <Download className="h-3 w-3" />
            Export CSV
          </Button>
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            <div className={cn("h-2 w-2 rounded-full animate-pulse", error ? "bg-red-400" : "bg-green-400")} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{error ? "Offline" : "Live"}</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center gap-3 text-destructive text-sm font-bold">
            <AlertCircle className="h-5 w-5" />
            {error}. Retrying automatically...
          </div>
        )}

        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="flex items-center gap-2 bg-white/50 dark:bg-zinc-800/50 p-1 rounded-full border">
            {languages.map((lang) => (
              <Button
                key={lang.id}
                variant={activeLang === lang.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveLang(lang.id)}
                className={cn(
                  "rounded-full px-6",
                  activeLang === lang.id ? "bg-primary text-white shadow-md" : "text-muted-foreground"
                )}
              >
                <span className="text-sm font-bold">{lang.label}</span>
              </Button>
            ))}
          </div>

          <div className="w-full max-w-2xl space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-primary uppercase tracking-widest">
              <span>Sensor Sync Status</span>
              <span>Next update in {countdown}s</span>
            </div>
            <Progress value={(countdown / (REFRESH_INTERVAL / 1000)) * 100} className="h-1.5" />
          </div>
        </div>

        <section className="mb-10">
          <div className="section-header">
            <Activity className="h-4 w-4" />
            Real-Time Metrics
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, i) => (
              <Card key={i} className="dashboard-card overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn("p-2 rounded-xl", m.bg)}>
                      <m.icon className={cn("h-5 w-5", m.color)} />
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{m.label}</span>
                  </div>
                  {loading && !data ? (
                    <Skeleton className="h-10 w-24" />
                  ) : (
                    <div className="text-3xl font-black tabular-nums tracking-tighter">
                      {data ? Number(m.value).toFixed(2) : '0.00'}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            <Card className="dashboard-card border-none shadow-sm bg-white dark:bg-zinc-900/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("p-2 rounded-xl", currentStress.color.split(' ')[1])}>
                    <ShieldAlert className={cn("h-5 w-5", currentStress.color.split(' ')[0])} />
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">STRESS TYPE</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black tracking-tight flex items-center gap-2">
                    {currentStress.emoji} {currentStress.label}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    Detected {data ? new Date(data.created_at).toLocaleTimeString() : '--'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-10">
          <div className="section-header">
            <LineChartIcon className="h-4 w-4" />
            Bio-Electrical Signal Trend
          </div>
          <Card className="dashboard-card border-none shadow-md overflow-hidden bg-white dark:bg-zinc-900">
            <CardContent className="p-6">
              <div className="h-[350px] w-full">
                {loading && history.length === 0 ? (
                  <Skeleton className="h-full w-full rounded-2xl" />
                ) : (
                  <ChartContainer config={chartConfig} className="h-full w-full">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRaw" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-raw)" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="var(--color-raw)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="raw" stroke="var(--color-raw)" strokeWidth={3} fill="url(#colorRaw)" />
                      <Area type="monotone" dataKey="avg" stroke="var(--color-avg)" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                    </AreaChart>
                  </ChartContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-20">
          <div className="section-header">
            <Leaf className="h-4 w-4" />
            AI Care Advisor & Checklist
          </div>
          <StressStatusCard stressLabel={parseInt(data?.field4 || '0')} />
        </section>
      </main>

      <ChatbotFloating />
      <Toaster />
    </div>
  );
}
