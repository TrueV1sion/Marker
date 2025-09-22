import type { Notification } from '../types';

const NOTIFICATION_STORE_KEY = 'helios_notification_store';
const NOTIFICATIONS_UPDATED_EVENT = 'notifications-updated';

/**
 * Retrieves the list of notifications from localStorage, sorted by date.
 * @returns {Notification[]} An array of notifications.
 */
export const getNotifications = (): Notification[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORE_KEY);
    const notifications = stored ? JSON.parse(stored) : [];
    return notifications.sort((a: Notification, b: Notification) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Failed to parse notifications from localStorage:", error);
    localStorage.removeItem(NOTIFICATION_STORE_KEY);
    return [];
  }
};

/**
 * Saves the entire notification list to localStorage and dispatches an update event.
 * @param {Notification[]} notifications - The array of notifications to save.
 */
const saveNotifications = (notifications: Notification[]): void => {
    try {
        localStorage.setItem(NOTIFICATION_STORE_KEY, JSON.stringify(notifications));
        window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
    } catch (error) {
        console.error("Failed to save notifications to localStorage:", error);
    }
}

/**
 * Adds a new notification to the store.
 * @param {Omit<Notification, 'id' | 'createdAt' | 'isRead'>} notificationData - The data for the new notification.
 */
export const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): void => {
  const notifications = getNotifications();
  const newNotification: Notification = {
    ...notificationData,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    isRead: false,
  };
  
  const updatedNotifications = [newNotification, ...notifications];
  saveNotifications(updatedNotifications);
};

/**
 * Marks a single notification as read.
 * @param {string} id - The ID of the notification to mark as read.
 */
export const markAsRead = (id: string): void => {
    const notifications = getNotifications();
    const updatedNotifications = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    saveNotifications(updatedNotifications);
};

/**
 * Marks all notifications as read.
 */
export const markAllAsRead = (): void => {
    const notifications = getNotifications();
    const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
    saveNotifications(updatedNotifications);
}