import type { ProspectBookData } from '../types';

const PROSPECT_BOOK_STORE_KEY = 'helios_prospect_books_store';
const PROSPECT_BOOKS_UPDATED_EVENT = 'prospect-books-updated';

type ProspectBookStore = {
    [prospectName: string]: ProspectBookData;
};

/**
 * Retrieves all prospect books from localStorage.
 * @returns {ProspectBookStore} An object where keys are prospect names.
 */
const getProspectBookStore = (): ProspectBookStore => {
    try {
        const stored = localStorage.getItem(PROSPECT_BOOK_STORE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error("Failed to parse prospect books from localStorage:", error);
        localStorage.removeItem(PROSPECT_BOOK_STORE_KEY);
    }
    return {};
};

/**
 * Saves the entire prospect book store to localStorage.
 * @param {ProspectBookStore} store - The prospect book store object.
 */
const saveProspectBookStore = (store: ProspectBookStore): void => {
    try {
        localStorage.setItem(PROSPECT_BOOK_STORE_KEY, JSON.stringify(store));
        window.dispatchEvent(new Event(PROSPECT_BOOKS_UPDATED_EVENT));
    } catch (error) {
        console.error("Failed to save prospect books to localStorage:", error);
    }
};

/**
 * Retrieves a list of all prospect books, sorted by most recently updated.
 * @returns {ProspectBookData[]} An array of prospect books.
 */
export const getProspectBooks = (): ProspectBookData[] => {
    const store = getProspectBookStore();
    return Object.values(store).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

/**
 * Retrieves a single prospect book by its name.
 * @param {string} prospectName - The name of the prospect.
 * @returns {ProspectBookData | null} The prospect book or null if not found.
 */
export const getProspectBookByName = (prospectName: string): ProspectBookData | null => {
    const store = getProspectBookStore();
    return store[prospectName.toLowerCase()] || null;
};

/**
 * Creates a new prospect book or updates an existing one.
 * @param {string} prospectName - The name of the prospect.
 * @param {Omit<ProspectBookData, 'prospectName' | 'createdAt' | 'updatedAt'>} bookData - The data for the book.
 * @returns {ProspectBookData} The created or updated prospect book.
 */
export const createOrUpdateProspectBook = (
    prospectName: string,
    bookData: Omit<ProspectBookData, 'prospectName' | 'createdAt' | 'updatedAt' | 'id' | 'savedAt'>
): ProspectBookData => {
    const store = getProspectBookStore();
    const key = prospectName.toLowerCase();
    const existingBook = store[key];

    const now = new Date().toISOString();

    const newBookData: ProspectBookData = {
        ...bookData,
        prospectName: prospectName,
        createdAt: existingBook ? existingBook.createdAt : now,
        updatedAt: now,
        notes: existingBook ? existingBook.notes : '',
    };
    
    store[key] = newBookData;
    saveProspectBookStore(store);
    return newBookData;
};

/**
 * Deletes a prospect book from the store.
 * @param {string} prospectName - The name of the prospect to delete.
 */
export const deleteProspectBook = (prospectName: string): void => {
    const store = getProspectBookStore();
    delete store[prospectName.toLowerCase()];
    saveProspectBookStore(store);
};