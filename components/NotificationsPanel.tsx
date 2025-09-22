import React from 'react';
import { Notification } from '../types';
import { ShareIcon } from './icons/ShareIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';

interface NotificationsPanelProps {
    isOpen: boolean;
    notifications: Notification[];
    onClose: () => void;
    onMarkAllRead: () => void;
    onNotificationClick: (notification: Notification) => void;
}

const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const NotificationIcon: React.FC<{ type: 'SHARE' | 'MENTION' }> = ({ type }) => {
    if (type === 'SHARE') {
        return <ShareIcon className="h-5 w-5 text-sky-600" />;
    }
    return <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-600" />;
};

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ isOpen, notifications, onClose, onMarkAllRead, onNotificationClick }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute left-full top-0 ml-2 w-80 h-full flex flex-col z-10 animate-fade-in-fast">
             <div className="bg-white rounded-lg shadow-2xl border border-slate-200 h-full flex flex-col my-2">
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold text-slate-800">Notifications</h2>
                    <button onClick={onMarkAllRead} className="text-xs font-semibold text-sky-600 hover:underline">
                        Mark all as read
                    </button>
                </header>
                <div className="flex-grow overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-500">
                            <p>No new notifications.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-200">
                            {notifications.map(notification => (
                                <li key={notification.id}>
                                    <button
                                        onClick={() => onNotificationClick(notification)}
                                        className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${!notification.isRead ? 'bg-sky-50' : 'bg-white'}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`flex-shrink-0 rounded-full p-2 ${notification.type === 'SHARE' ? 'bg-sky-100' : 'bg-green-100'}`}>
                                                <NotificationIcon type={notification.type} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-slate-700">
                                                    <span className="font-semibold">{notification.actor.name}</span> {notification.message}
                                                </p>
                                                <p className="text-xs text-slate-400 mt-1">
                                                    {formatTimestamp(notification.createdAt)}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="w-2.5 h-2.5 bg-sky-500 rounded-full mt-1 flex-shrink-0" title="Unread"></div>
                                            )}
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPanel;