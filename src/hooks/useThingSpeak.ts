import { useState, useEffect, useCallback } from 'react';
import { THINGSPEAK_URL, REFRESH_INTERVAL } from '@/lib/constants';

export interface PlantData {
  field1: string; // Raw Value
  field2: string; // Difference
  field3: string; // Average
  field4: string; // Stress Label
  created_at: string;
}

export function useThingSpeak() {
  const [data, setData] = useState<PlantData | null>(null);
  const [history, setHistory] = useState<PlantData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch more results for history/charting
      const response = await fetch(`${THINGSPEAK_URL.split('?')[0]}.json?results=20`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const json = await response.json();
      if (json.feeds && json.feeds.length > 0) {
        setData(json.feeds[json.feeds.length - 1]);
        setHistory(json.feeds);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
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
