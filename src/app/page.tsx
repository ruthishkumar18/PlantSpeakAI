"use client"

import React from 'react';
import { useThingSpeak } from '@/hooks/useThingSpeak';
import { StressStatusCard } from '@/components/StressStatusCard';
import { ChatbotFloating } from '@/components/ChatbotFloating';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCcw, Leaf, Activity, Layers, BarChart3, Clock } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

export default function Home() {
  const { data, loading, error } = useThingSpeak();

  const metrics = [
    { label: 'Raw Value', value: data?.field1, icon: Activity, color: 'text-emerald-500', unit: 'bits' },
    { label: 'Difference', value: data?.field2, icon: Layers, color: 'text-orange-500', unit: 'Δ' },
    { label: 'Average', value: data?.field3, icon: BarChart3, color: 'text-blue-500', unit: 'avg' },
  ];

  return (
    <div className="min-h-screen pb-20 transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-xl text-primary-foreground">
              <Leaf className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">PlantSpeakAI</h1>
          </div>
          <div className="flex items-center gap-4">
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RefreshCcw className="h-3 w-3 animate-spin" />
                Updating...
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Dashboard Section */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Real-time Status Banner */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Plant Dashboard</h2>
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last update: {data ? new Date(data.created_at).toLocaleTimeString() : 'Connecting...'}
                </p>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metrics.map((m, i) => (
                <Card key={i} className="border-2 transition-transform hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">{m.label}</CardTitle>
                    <m.icon className={cn("h-4 w-4", m.color)} />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold tabular-nums">
                          {Number(m.value).toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground">{m.unit}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Visualizer Placeholder / Stress Info Card */}
            <Card className="border-2 overflow-hidden">
               <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Bio-electrical Signal Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center bg-muted/10 relative">
                {/* Visual indicator of "life" / signals */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-20">
                   <div className="w-[80%] h-[1px] bg-primary relative animate-pulse">
                      <div className="absolute top-0 left-0 h-10 w-20 bg-primary/20 blur-xl animate-[ping_3s_infinite]"></div>
                   </div>
                </div>
                <div className="text-center z-10">
                  <p className="text-sm text-muted-foreground max-w-md">
                    Live data is being processed from bio-electrical sensors connected via ESP32. 
                    PlantSpeakAI translates these signals into the health status shown on the right.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar Section */}
          <div className="lg:col-span-4">
             {loading ? (
               <Skeleton className="h-[500px] w-full" />
             ) : (
               <StressStatusCard stressLabel={parseInt(data?.field4 || '0')} />
             )}
          </div>

        </div>
      </main>

      <ChatbotFloating />
      <Toaster />
    </div>
  );
}