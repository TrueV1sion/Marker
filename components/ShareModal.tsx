import React, { useState } from 'react';
import { ProspectBookData, User } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { XIcon } from './icons/XIcon';
import { UsersIcon } from './icons/UsersIcon';

type SharedUser = { user: User; role: 'viewer' | 'editor' };

interface ShareModalProps {
    book: ProspectBookData;
    isOpen: boolean;
    onClose: () => void;
    onUpdateSharing: (newSharedWith: SharedUser[]) => void;
    availableTeammates: User[];
    currentUser: User;
}

export const ShareModal: React.FC<ShareModalProps> = ({ book, isOpen, onClose, onUpdateSharing, availableTeammates, currentUser }) => {
    const [sharedWith, setSharedWith] = useState<SharedUser[]>(book.sharedWith || []);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<'viewer' | 'editor'>('viewer');

    if (!isOpen) return null;

    const filteredTeammates = availableTeammates.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !sharedWith.some(s => s.user.id === t.id)
    );

    const handleAddUser = (user: User) => {
        const newSharedList = [...sharedWith, { user, role: selectedRole }];
        setSharedWith(newSharedList);
        onUpdateSharing(newSharedList);
        setSearchQuery('');
    };

    const handleRemoveUser = (userId: string) => {
        const newSharedList = sharedWith.filter(s => s.user.id !== userId);
        setSharedWith(newSharedList);
        onUpdateSharing(newSharedList);
    };

    const handleRoleChange = (userId: string, newRole: 'viewer' | 'editor') => {
        const newSharedList = sharedWith.map(s => s.user.id === userId ? { ...s, role: newRole } : s);
        setSharedWith(newSharedList);
        onUpdateSharing(newSharedList);
    };


    return (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b">
                    <h2 id="share-modal-title" className="text-xl font-bold text-slate-800">Share "{book.prospectName}"</h2>
                    <button onClick={onClose} aria-label="Close modal"><XIcon className="h-6 w-6 text-slate-500" /></button>
                </header>
                <div className="p-6">
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Add people or teams..."
                            className="flex-grow p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                        />
                         <div className="relative">
                            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as 'viewer' | 'editor')} className="p-2 border border-slate-300 rounded-md appearance-none pr-8 focus:ring-2 focus:ring-sky-500 focus:outline-none transition h-full">
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                            </select>
                            <ChevronDownIcon className="h-5 w-5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    {searchQuery && (
                        <div className="border border-slate-200 rounded-md mt-2 max-h-40 overflow-y-auto bg-slate-50">
                            {filteredTeammates.length > 0 ? filteredTeammates.map(t => (
                                <button key={t.id} onClick={() => handleAddUser(t)} className="flex items-center gap-3 p-2 w-full text-left hover:bg-slate-100">
                                    <img src={t.avatarUrl} alt={t.name} className="h-8 w-8 rounded-full"/>
                                    <span>{t.name}</span>
                                </button>
                            )) : <p className="p-2 text-sm text-slate-500">No teammates found.</p>}
                        </div>
                    )}
                    
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-slate-700 mb-2 flex items-center gap-2"><UsersIcon className="h-5 w-5"/> People with access</h3>
                        <div className="space-y-2">
                             {/* Current User (Owner) */}
                            <div className="flex justify-between items-center p-2">
                                <div className="flex items-center gap-3">
                                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-8 w-8 rounded-full"/>
                                    <div>
                                        <p className="font-semibold">{currentUser.name} (you)</p>
                                        <p className="text-sm text-slate-500">Workspace Owner</p>
                                    </div>
                                </div>
                                <span className="text-sm text-slate-500">Owner</span>
                            </div>
                            {/* Shared Users */}
                            {sharedWith.map(({ user, role }) => (
                                <div key={user.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-md">
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full"/>
                                        <p className="font-semibold">{user.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select value={role} onChange={(e) => handleRoleChange(user.id, e.target.value as 'viewer' | 'editor')} className="p-1 border border-slate-300 rounded-md text-sm bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none">
                                            <option value="viewer">Viewer</option>
                                            <option value="editor">Editor</option>
                                        </select>
                                        <button onClick={() => handleRemoveUser(user.id)} className="text-slate-400 hover:text-red-500" aria-label={`Remove ${user.name}`}><XIcon className="h-4 w-4"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
