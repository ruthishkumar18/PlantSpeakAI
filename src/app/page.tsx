
"use client"

import React from 'react';
import { useThingSpeak } from '@/hooks/useThingSpeak';
import { StressStatusCard } from '@/components/StressStatusCard';
import { ChatbotFloating } from '@/components/ChatbotFloating';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  RefreshCcw, 
  Leaf, 
  Activity, 
  Layers, 
  BarChart3, 
  Clock, 
  Download 
} from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function Home() {
  const { data, history, loading } = useThingSpeak();

  const metrics = [
    { label: 'Raw Value', value: data?.field1, icon: Activity, color: 'text-emerald-500', unit: 'bits' },
    { label: 'Difference', value: data?.field2, icon: Layers, color: 'text-orange-500', unit: 'Δ' },
    { label: 'Average', value: data?.field3, icon: BarChart3, color: 'text-blue-500', unit: 'avg' },
  ];

  const exportToCSV = () => {
    if (!history.length) return;
    
    const headers = ['Timestamp', 'Raw Value', 'Difference', 'Average', 'Stress Label'];
    const rows = history.map(feed => [
      new Date(feed.created_at).toLocaleString(),
      feed.field1,
      feed.field2,
      feed.field3,
      feed.field4
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `plant_data_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = history.map(h => ({
    time: new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    value: parseFloat(h.field1) || 0,
    avg: parseFloat(h.field3) || 0
  }));

  return (
    <div className="min-h-screen pb-20 transition-colors duration-500 bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-xl text-primary-foreground">
              <Leaf className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">PlantSpeakAI</h1>
          </div>
          <div className="flex items-center gap-2">
            {loading && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground mr-2">
                <RefreshCcw className="h-3 w-3 animate-spin" />
                Updating...
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportToCSV}
              className="gap-2 border-primary text-primary hover:bg-primary/10"
              disabled={!history.length}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-primary">Plant Dashboard</h2>
                <p className="text-muted-foreground text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last update: {data ? new Date(data.created_at).toLocaleTimeString() : 'Connecting...'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metrics.map((m, i) => (
                <Card key={i} className="border-2 transition-transform hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground uppercase">{m.label}</CardTitle>
                    <m.icon className={cn("h-4 w-4", m.color)} />
                  </CardHeader>
                  <CardContent>
                    {loading && !data ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold tabular-nums">
                          {data ? Number(m.value).toFixed(2) : '0.00'}
                        </span>
                        <span className="text-xs text-muted-foreground">{m.unit}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-2 overflow-hidden bg-card shadow-lg">
               <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Live Bio-electrical Signal Visualization
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[450px] w-full p-4">
                {loading && !history.length ? (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                    <RefreshCcw className="h-8 w-8 animate-spin text-primary opacity-20" />
                    <p className="text-sm text-muted-foreground">Initializing signal stream...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
                      <XAxis 
                        dataKey="time" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: 'currentColor', opacity: 0.7 }}
                        dy={10}
                      />
                      <YAxis 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: 'currentColor', opacity: 0.7 }}
                        domain={['auto', 'auto']}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          borderRadius: 'var(--radius)',
                          fontSize: '12px',
                          color: 'hsl(var(--card-foreground))',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend verticalAlign="top" height={36}/>
                      <Line 
                        name="Raw Signal"
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'white' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        animationDuration={1500}
                        isAnimationActive={true}
                      />
                      <Line 
                        name="Average Trend"
                        type="monotone" 
                        dataKey="avg" 
                        stroke="hsl(var(--secondary))" 
                        strokeWidth={2} 
                        strokeDasharray="5 5"
                        dot={false}
                        animationDuration={1500}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4 h-full">
             {loading && !data ? (
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
