import { useState, useEffect, useCallback } from 'react';
import { THINGSPEAK_URL, REFRESH_INTERVAL } from '@/lib/constants';

export interface PlantData {
  field1: string; // value (Raw)
  field2: string; // diff (Difference)
  field3: string; // avg (Average)
  field4: string; // label (Stress Label)
  created_at: string;
}

export function useThingSpeak() {
  const [data, setData] = useState<PlantData | null>(null);
  const [history, setHistory] = useState<PlantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Use a timeout to prevent hanging fetches
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${THINGSPEAK_URL}&results=20`, { 
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(id);

      if (!response.ok) throw new Error(`API returned ${response.status}`);
      
      const json = await response.json();
      if (json.feeds && json.feeds.length > 0) {
        const latest = json.feeds[json.feeds.length - 1];
        if (latest.field1 !== null) {
          setData(latest);
          setHistory(json.feeds);
          setError(null);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out');
      } else {
        console.error('ThingSpeak Fetch Error:', err);
        setError('Unable to reach sensor network');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, history, loading, error, refetch: fetchData };
}
