import type { ActivityEvent } from '../types';

const ACTIVITY_LOG_KEY = 'helios_activity_log';

/**
 * Retrieves the list of activities from localStorage.
 * @returns {ActivityEvent[]} An array of activity events.
 */
export const getActivities = (): ActivityEvent[] => {
  try {
    const storedActivities = localStorage.getItem(ACTIVITY_LOG_KEY);
    if (storedActivities) {
      return JSON.parse(storedActivities);
    }
  } catch (error) {
    console.error("Failed to parse activities from localStorage:", error);
    // In case of parsing error, clear the corrupted data
    localStorage.removeItem(ACTIVITY_LOG_KEY);
  }
  return [];
};

/**
 * Adds a new activity to the log in localStorage.
 * @param {Omit<ActivityEvent, 'id' | 'timestamp'>} newActivity - The new activity event to add.
 */
export const addActivity = (newActivityData: Omit<ActivityEvent, 'id' | 'timestamp'>): void => {
  try {
    const activities = getActivities();
    const event: ActivityEvent = {
      ...newActivityData,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
    };
    
    // Add the new event to the beginning of the array
    const updatedActivities = [event, ...activities];

    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(updatedActivities));
  } catch (error) {
    console.error("Failed to save activity to localStorage:", error);
  }
};
