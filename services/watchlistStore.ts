import type { WatchlistItem, WatchlistAlert } from '../types';

const WATCHLIST_ITEMS_KEY = 'helios_watchlist_items';
const WATCHLIST_ALERTS_KEY = 'helios_watchlist_alerts';

// --- Watchlist Items Management ---

export const getWatchlistItems = (): WatchlistItem[] => {
  try {
    const stored = localStorage.getItem(WATCHLIST_ITEMS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse watchlist items:", error);
    return [];
  }
};

export const addWatchlistItem = (itemData: Omit<WatchlistItem, 'id'>): WatchlistItem => {
  const items = getWatchlistItems();
  const newItem: WatchlistItem = {
    ...itemData,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
  const updatedItems = [newItem, ...items];
  localStorage.setItem(WATCHLIST_ITEMS_KEY, JSON.stringify(updatedItems));
  return newItem;
};

export const deleteWatchlistItem = (id: string): void => {
  let items = getWatchlistItems();
  items = items.filter(item => item.id !== id);
  localStorage.setItem(WATCHLIST_ITEMS_KEY, JSON.stringify(items));
};


// --- Watchlist Alerts Management ---

export const getWatchlistAlerts = (): WatchlistAlert[] => {
    try {
        const stored = localStorage.getItem(WATCHLIST_ALERTS_KEY);
        const alerts = stored ? JSON.parse(stored) : [];
        // Sort by timestamp descending
        return alerts.sort((a: WatchlistAlert, b: WatchlistAlert) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
        console.error("Failed to parse watchlist alerts:", error);
        return [];
    }
};

export const addWatchlistAlert = (alertData: Omit<WatchlistAlert, 'id' | 'timestamp'>): WatchlistAlert => {
    const alerts = getWatchlistAlerts();
    const newAlert: WatchlistAlert = {
        ...alertData,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
    };
    const updatedAlerts = [newAlert, ...alerts];
    localStorage.setItem(WATCHLIST_ALERTS_KEY, JSON.stringify(updatedAlerts));
    return newAlert;
};

export const clearWatchlistAlerts = (): void => {
    localStorage.removeItem(WATCHLIST_ALERTS_KEY);
};
