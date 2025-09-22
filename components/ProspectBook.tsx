import React, { useState, useEffect, useMemo } from 'react';
import { getProspectBooks, updateProspectBook } from '../services/prospectBookStore';
import { ProspectBookData, ReportData, SavedReportData, User, Comment } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import ReportView from './ReportView';
import { SaveIcon } from './icons/SaveIcon';
import { PencilIcon } from './icons/PencilIcon';
import { ShareIcon } from './icons/ShareIcon';
import { PlusIcon } from './icons/PlusIcon';
import { ShareModal } from './ShareModal';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import CommentsSidebar from './CommentsSidebar';

interface ProspectBookProps {
  initialProspectName?: string;
  onStartPlaybook: (report: ReportData) => void;
}

// Mocked data for current user and other user for the share demo
const MOCK_CURRENT_USER: User = { id: 'user-1', name: 'You', avatarUrl: 'https://picsum.photos/seed/user-1/40/40' };
const MOCK_TEAMMATE: User = { id: 'user-2', name: 'David Evans', avatarUrl: 'https://picsum.photos/seed/user-2/40/40' };
const MOCK_SALES_MANAGER: User = { id: 'user-3', name: 'Alicia Chen', avatarUrl: 'https://picsum.photos/seed/user-3/40/40' };
const AVAILABLE_TEAMMATES = [MOCK_TEAMMATE, MOCK_SALES_MANAGER, { ...MOCK_CURRENT_USER, name: 'Alex Miller' }]; // Add current user with real name for mentions


const ProspectBook: React.FC<ProspectBookProps> = ({ initialProspectName, onStartPlaybook }) => {
    const [books, setBooks] = useState<ProspectBookData[]>([]);
    const [activeBook, setActiveBook] = useState<ProspectBookData | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedBook, setEditedBook] = useState<ProspectBookData | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isCommentsSidebarOpen, setIsCommentsSidebarOpen] = useState(false);

    // Effect to load and subscribe to book data
    useEffect(() => {
        const syncBooks = () => setBooks(getProspectBooks());
        syncBooks();
        window.addEventListener('prospect-books-updated', syncBooks);
        return () => window.removeEventListener('prospect-books-updated', syncBooks);
    }, []);

    // Effect to manage the active book
    useEffect(() => {
        if (!books.length) {
            setActiveBook(null);
            return;
        }

        let nextActiveBook: ProspectBookData | null = null;

        if (initialProspectName) {
            nextActiveBook = books.find(b => b.prospectName.toLowerCase() === initialProspectName.toLowerCase()) || null;
        } else if (activeBook) {
            // Reselect the active book from the (potentially updated) list to get fresh data
            nextActiveBook = books.find(b => b.prospectName.toLowerCase() === activeBook.prospectName.toLowerCase()) || null;
        }
        
        // If we still don't have an active book (e.g., on initial load or if active was deleted), select the first one.
        if (!nextActiveBook) {
            nextActiveBook = books[0];
        }
        
        if(activeBook?.prospectName !== nextActiveBook?.prospectName || activeBook?.updatedAt !== nextActiveBook?.updatedAt) {
             setActiveBook(nextActiveBook);
        }

    }, [initialProspectName, books, activeBook]);

    const filteredBooks = useMemo(() => {
        return books.filter(book => book.prospectName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [books, searchTerm]);

    const handleSelectBook = (book: ProspectBookData) => {
        setActiveBook(book);
        setIsEditMode(false); // Always exit edit mode when switching books
    };

    const handleEnterEditMode = () => {
        if (!activeBook) return;
        setEditedBook({ ...activeBook });
        setIsEditMode(true);
    };

    const handleCancelEdit = () => {
        setEditedBook(null);
        setIsEditMode(false);
    };

    const handleSaveEdit = () => {
        if (!editedBook) return;
        
        updateProspectBook(editedBook.prospectName, editedBook);

        setIsEditMode(false);
        setEditedBook(null);
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!editedBook) return;
        const { name, value } = e.target;
        setEditedBook({ ...editedBook, [name]: value });
    }
    
    const handleShareUpdate = (newSharedWith: { user: User; role: 'viewer' | 'editor' }[]) => {
        if (!activeBook) return;
        updateProspectBook(activeBook.prospectName, { sharedWith: newSharedWith });
        // The useEffect listening to 'prospect-books-updated' will handle the UI refresh.
    };
    
    const handleAddComment = (commentText: string) => {
        if (!activeBook || !commentText.trim()) return;

        const newComment: Comment = {
            id: `${Date.now()}`,
            author: MOCK_CURRENT_USER,
            content: commentText,
            createdAt: new Date().toISOString(),
        };

        const updatedComments = [...(activeBook.comments || []), newComment];
        updateProspectBook(activeBook.prospectName, { comments: updatedComments });
    };

    const bookUsers = useMemo(() => {
        if (!activeBook) return [];
        const sharedUsers = activeBook.sharedWith?.map(s => s.user) || [];
        return [MOCK_CURRENT_USER, ...sharedUsers];
    }, [activeBook]);
    
    const renderContent = () => {
        const bookToDisplay = isEditMode ? editedBook : activeBook;

        if (!bookToDisplay) {
            return (
                <div className="text-center p-12 bg-white rounded-lg shadow-md h-full flex flex-col justify-center">
                    <h3 className="text-xl font-semibold text-slate-700">No Prospect Book Selected</h3>
                    <p className="text-slate-500 mt-2">
                        {books.length > 0 ? 'Select a book from the list to view its details.' : 'Generate a prospect profile to create your first book.'}
                    </p>
                </div>
            )
        }
        
        if (!isEditMode) {
            const reportViewData: SavedReportData = {
                ...bookToDisplay,
                id: bookToDisplay.prospectName,
                savedAt: bookToDisplay.updatedAt,
            };
            return <ReportView report={reportViewData} onStartPlaybook={onStartPlaybook} />
        }
        
        return (
            <div className="bg-white p-8 rounded-lg shadow-lg animate-fade-in">
                <h2 className="text-3xl font-bold text-slate-800 mb-6">{bookToDisplay.title}</h2>
                <div>
                     <h3 className="text-2xl font-bold text-slate-700 mb-4 border-b pb-2">Internal Notes</h3>
                     <textarea 
                        name="notes"
                        value={editedBook?.notes || ''}
                        onChange={handleInputChange}
                        rows={8}
                        placeholder="Add internal notes, call logs, or other intelligence here... Use @ to mention teammates."
                        className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                     />
                </div>
                <div className="mt-8">
                     <h3 className="text-2xl font-bold text-slate-700 mb-4 border-b pb-2">Executive Summary</h3>
                     <textarea 
                        name="executiveSummary"
                        value={editedBook?.executiveSummary || ''}
                        onChange={handleInputChange}
                        rows={8}
                        className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                     />
                </div>
                 <div className="mt-8">
                    <h3 className="text-2xl font-bold text-slate-700 mb-4 border-b pb-2">Main Report Content</h3>
                    <textarea 
                        name="content"
                        value={editedBook?.content || ''}
                        onChange={handleInputChange}
                        rows={20}
                        className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                     />
                </div>
            </div>
        )
    };

    return (
        <>
            {activeBook && (
                <ShareModal
                    book={activeBook}
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    onUpdateSharing={handleShareUpdate}
                    availableTeammates={AVAILABLE_TEAMMATES}
                    currentUser={MOCK_CURRENT_USER}
                />
            )}
            {activeBook && (
                <CommentsSidebar
                    book={activeBook}
                    currentUser={MOCK_CURRENT_USER}
                    availableTeammates={AVAILABLE_TEAMMATES}
                    isOpen={isCommentsSidebarOpen}
                    onClose={() => setIsCommentsSidebarOpen(false)}
                    onAddComment={handleAddComment}
                />
            )}
            <div className="flex gap-8 h-full">
                {/* --- Left Sidebar: Book List --- */}
                <div className="w-1/4 flex-shrink-0 bg-white p-4 rounded-lg shadow-md flex flex-col">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">Prospect Books</h2>
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Search books..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-8 border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                        />
                        <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                    <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                        {filteredBooks.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center mt-8">No books found.</p>
                        ) : (
                            <ul className="space-y-2">
                                {filteredBooks.map(book => (
                                    <li key={book.prospectName}>
                                        <button
                                            onClick={() => handleSelectBook(book)}
                                            className={`w-full text-left p-3 rounded-md transition-colors ${activeBook?.prospectName === book.prospectName ? 'bg-sky-500 text-white' : 'hover:bg-slate-100'}`}
                                        >
                                            <p className="font-semibold truncate">{book.prospectName}</p>
                                            <p className={`text-xs ${activeBook?.prospectName === book.prospectName ? 'text-sky-200' : 'text-slate-500'}`}>
                                                Updated {new Date(book.updatedAt).toLocaleDateString()}
                                            </p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* --- Right Main Panel: Content --- */}
                <div className="flex-1 overflow-y-auto">
                    {activeBook && (
                        <div className="mb-4 flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="flex -space-x-2">
                                    {bookUsers.map(user => (
                                        <img key={user.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white" src={user.avatarUrl} alt={user.name} title={user.name} />
                                    ))}
                                </div>
                                <button onClick={() => setIsShareModalOpen(true)} className="ml-2 p-2 rounded-full hover:bg-slate-200 transition-colors">
                                    <PlusIcon className="h-5 w-5 text-slate-600" />
                                </button>
                            </div>
                            <div className="space-x-2">
                            {isEditMode ? (
                                <>
                                    <button onClick={handleCancelEdit} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-md font-semibold hover:bg-slate-300 transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleSaveEdit} className="flex items-center justify-center bg-sky-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-600 transition-colors">
                                        <SaveIcon className="h-5 w-5 mr-2" /> Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                <button onClick={() => setIsCommentsSidebarOpen(true)} className="flex items-center justify-center bg-slate-100 text-slate-700 px-4 py-2 rounded-md font-semibold hover:bg-slate-200 transition-colors">
                                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" /> Comments
                                </button>
                                <button onClick={() => setIsShareModalOpen(true)} className="flex items-center justify-center bg-slate-100 text-slate-700 px-4 py-2 rounded-md font-semibold hover:bg-slate-200 transition-colors">
                                    <ShareIcon className="h-5 w-5 mr-2" /> Share
                                </button>
                                <button onClick={handleEnterEditMode} className="flex items-center justify-center bg-slate-700 text-white px-4 py-2 rounded-md font-semibold hover:bg-slate-800 transition-colors">
                                    <PencilIcon className="h-5 w-5 mr-2" /> Edit Book
                                </button>
                                </>
                            )}
                            </div>
                        </div>
                    )}
                    {renderContent()}
                </div>
            </div>
        </>
    );
};

export default ProspectBook;