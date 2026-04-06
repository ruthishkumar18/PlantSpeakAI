import { Droplets, Sun, Snowflake, Activity, Bug, Heart, AlertTriangle } from 'lucide-react';

export const STRESS_LABELS: Record<number, { label: string; emoji: string; icon: any; color: string; advice: string }> = {
  0: { 
    label: 'Healthy', 
    emoji: '🌱', 
    icon: Heart, 
    color: 'text-green-500 bg-green-50 dark:bg-green-950/30',
    advice: 'Your plant is healthy. Keep up the good care!'
  },
  1: { 
    label: 'Water Stress', 
    emoji: '💧', 
    icon: Droplets, 
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
    advice: 'Water the plant immediately.'
  },
  2: { 
    label: 'Over Water', 
    emoji: '🌊', 
    icon: Droplets, 
    color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30',
    advice: 'Reduce watering frequency.'
  },
  3: { 
    label: 'Heat Stress', 
    emoji: '🔥', 
    icon: Sun, 
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30',
    advice: 'Move to a cooler, shaded place.'
  },
  4: { 
    label: 'Cold Stress', 
    emoji: '❄️', 
    icon: Snowflake, 
    color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30',
    advice: 'Keep in a warm indoor area.'
  },
  5: { 
    label: 'Mechanical Stress', 
    emoji: '⚠️', 
    icon: AlertTriangle, 
    color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
    advice: 'Protect from physical impact.'
  },
  6: { 
    label: 'Pest Attack', 
    emoji: '🐛', 
    icon: Bug, 
    color: 'text-red-500 bg-red-50 dark:bg-red-950/30',
    advice: 'Apply organic pesticide or neem oil.'
  }
};

export const THINGSPEAK_CHANNEL_ID = '3325119';
export const THINGSPEAK_READ_KEY = 'SMRS4S9PSXXYFIL2';
export const THINGSPEAK_URL = `https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_READ_KEY}`;
export const REFRESH_INTERVAL = 15000;
