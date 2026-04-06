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
      // Fetch 20 results for history/charting using the API key from constants
      const response = await fetch(`${THINGSPEAK_URL}&results=20`);
      if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);
      
      const json = await response.json();
      if (json.feeds && json.feeds.length > 0) {
        setData(json.feeds[json.feeds.length - 1]);
        setHistory(json.feeds);
        setError(null);
      }
    } catch (err) {
      console.error('ThingSpeak Fetch Error:', err);
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
