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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(THINGSPEAK_URL);
      if (!response.ok) throw new Error('Failed to fetch data');
      const json = await response.json();
      if (json.feeds && json.feeds.length > 0) {
        setData(json.feeds[0]);
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

  return { data, loading, error, refetch: fetchData };
}