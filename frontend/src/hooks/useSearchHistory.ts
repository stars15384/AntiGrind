import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'antigrind_search_history';
const MAX_HISTORY_ITEMS = 10;

interface SearchHistoryItem {
  keyword: string;
  timestamp: number;
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);

  const addToHistory = useCallback((keyword: string) => {
    if (!keyword.trim()) return;

    const newItem: SearchHistoryItem = {
      keyword: keyword.trim(),
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      const filtered = prev.filter(
        (item) => item.keyword.toLowerCase() !== newItem.keyword.toLowerCase()
      );
      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save search history:', error);
      }

      return updated;
    });
  }, []);

  const removeFromHistory = useCallback((keyword: string) => {
    setHistory((prev) => {
      const updated = prev.filter(
        (item) => item.keyword !== keyword
      );

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to update search history:', error);
      }

      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}

export default useSearchHistory;
