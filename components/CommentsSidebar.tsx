import React, { useState, useEffect, useRef } from 'react';
import { ProspectBookData, User, Comment, ModuleType } from '../types';
import { addNotification } from '../services/notificationStore';
import { SendIcon } from './icons/SendIcon';
import { XIcon } from './icons/XIcon';

interface CommentsSidebarProps {
    book: ProspectBookData;
    currentUser: User;
    availableTeammates: User[];
    isOpen: boolean;
    onClose: () => void;
    onAddComment: (commentText: string) => void;
}

const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return `now`;
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CommentsSidebar: React.FC<CommentsSidebarProps> = ({ book, currentUser, availableTeammates, isOpen, onClose, onAddComment }) => {
    const [newComment, setNewComment] = useState('');
    const commentsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [book.comments]);
    
    const findMentions = (text: string): User[] => {
        const mentionRegex = /@(\w+(\s+\w+)*)/g;
        let match;
        const mentionedNames: string[] = [];
        while ((match = mentionRegex.exec(text)) !== null) {
            mentionedNames.push(match[1].toLowerCase());
        }

        if (mentionedNames.length === 0) return [];
        
        return availableTeammates.filter(user => mentionedNames.includes(user.name.toLowerCase()));
    };

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        onAddComment(newComment);
        
        const mentionedUsers = findMentions(newComment);
        mentionedUsers.forEach(user => {
            // Don't notify user for mentioning themselves
            if (user.id === currentUser.id) return;
            
            addNotification({
                type: 'MENTION',
                actor: currentUser,
                message: `mentioned you in "${book.prospectName}".`,
                linkTo: { module: ModuleType.PROSPECT_BOOK, prospectName: book.prospectName }
            });
        });
        
        setNewComment('');
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddComment();
        }
    }

    return (
        <div className={`fixed top-0 right-0 h-full bg-white shadow-2xl z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} w-full max-w-md flex flex-col`}>
            {/* Header */}
            <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800">Comments</h2>
                <button onClick={onClose} aria-label="Close comments sidebar">
                    <XIcon className="h-6 w-6 text-slate-500" />
                </button>
            </header>

            {/* Comments List */}
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="space-y-6">
                    {(book.comments || []).map((comment) => (
                        <div key={comment.id} className="flex items-start gap-3">
                            <img src={comment.author.avatarUrl} alt={comment.author.name} className="h-8 w-8 rounded-full flex-shrink-0" />
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <p className="font-semibold text-sm text-slate-800">{comment.author.name}</p>
                                    <p className="text-xs text-slate-400">{formatTimestamp(comment.createdAt)}</p>
                                </div>
                                <div className="bg-slate-100 p-3 rounded-lg mt-1">
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={commentsEndRef} />
                </div>
            </div>

            {/* Input Form */}
            <footer className="flex-shrink-0 p-4 border-t border-slate-200 bg-slate-50">
                <div className="flex items-start gap-3">
                     <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-8 w-8 rounded-full flex-shrink-0" />
                     <div className="relative flex-grow">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Add a comment... use @ to mention"
                            rows={2}
                            className="w-full p-2 pr-12 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition resize-none"
                        />
                         <button 
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="absolute right-2 bottom-2 bg-sky-500 text-white p-2 rounded-md hover:bg-sky-600 disabled:bg-slate-300 transition-colors"
                            aria-label="Send comment"
                        >
                            <SendIcon className="h-4 w-4" />
                        </button>
                     </div>
                </div>
            </footer>
        </div>
    );
};

export default CommentsSidebar;