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
  Clock,
  Download
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

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
    { id: 'en', label: 'English', icon: '🌐' },
    { id: 'ta', label: 'Tamil', icon: '🇮🇳' },
    { id: 'hi', label: 'Hindi', icon: '🇮🇳' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Top Header */}
      <header className="w-full bg-primary text-primary-foreground py-3 px-6 flex items-center justify-between shadow-lg">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 fill-current" />
            <h1 className="text-xl font-black tracking-tight leading-none">PlantSpeakAI</h1>
          </div>
          <p className="text-[10px] font-medium opacity-80 uppercase tracking-tighter ml-8">Bio-Electric Plant Health Monitor</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={exportCSV}
            className="hidden sm:flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest"
          >
            <Download className="h-3 w-3" />
            Export
          </Button>
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Live</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Language & Auto-Refresh */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="flex items-center gap-2 bg-white/50 dark:bg-zinc-800/50 p-1 rounded-full border">
            {languages.map((lang) => (
              <Button
                key={lang.id}
                variant={activeLang === lang.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveLang(lang.id)}
                className={cn(
                  "rounded-full gap-2 transition-all px-6",
                  activeLang === lang.id ? "bg-primary text-white shadow-md" : "text-muted-foreground"
                )}
              >
                <span className="text-sm font-bold">{lang.label}</span>
              </Button>
            ))}
          </div>

          <div className="w-full max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
              <input type="checkbox" checked readOnly className="h-3 w-3 rounded border-primary text-primary" />
              Auto-refresh in {countdown}s
            </div>
            <Progress value={(countdown / (REFRESH_INTERVAL / 1000)) * 100} className="h-1.5" />
          </div>
        </div>

        {/* Live Sensor Data Section */}
        <section className="mb-10">
          <div className="section-header">
            <Activity className="h-4 w-4" />
            Live Sensor Data
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, i) => (
              <Card key={i} className="dashboard-card overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn("p-2 rounded-xl", m.bg)}>
                      <m.icon className={cn("h-5 w-5", m.color)} />
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{m.label}</span>
                  </div>
                  {loading && !data ? (
                    <Skeleton className="h-12 w-32" />
                  ) : (
                    <div className="text-4xl font-black tabular-nums tracking-tighter">
                      {data ? Number(m.value).toFixed(2) : '0.00'}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            <Card className="dashboard-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-zinc-100">
                    <Clock className="h-5 w-5 text-zinc-500" />
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Last Updated</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-muted-foreground tabular-nums">
                    {data ? new Date(data.created_at).toLocaleTimeString() : '--:--:--'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Status & Advisor Section */}
        <section className="mb-10">
          <div className="section-header">
            <Leaf className="h-4 w-4" />
            Plant Status & AI Advisor
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-12">
              {loading && !data ? (
                <Skeleton className="h-[400px] w-full rounded-[2rem]" />
              ) : (
                <StressStatusCard stressLabel={parseInt(data?.field4 || '0')} />
              )}
            </div>
          </div>
        </section>

        {/* Stress Reference Section */}
        <section className="mb-20">
          <div className="section-header">
            <BarChart3 className="h-4 w-4" />
            Stress Reference
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(STRESS_LABELS).map(([id, label]) => (
              <div 
                key={id} 
                className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-full border shadow-sm text-[10px] font-black uppercase tracking-widest"
              >
                <div className={cn("h-2 w-2 rounded-full", label.color.split(' ')[0])} />
                <span className="opacity-60 text-base">{label.emoji}</span>
                {label.label}
              </div>
            ))}
          </div>
        </section>
      </main>

      <ChatbotFloating />
      <Toaster />
    </div>
  );
}