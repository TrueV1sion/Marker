import type { ProductGap } from '../types';

const GAP_STORE_KEY = 'helios_gap_store';

/**
 * Retrieves the list of saved product gaps from localStorage.
 * @returns {ProductGap[]} An array of saved gaps.
 */
export const getSavedGaps = (): ProductGap[] => {
  try {
    const storedGaps = localStorage.getItem(GAP_STORE_KEY);
    if (storedGaps) {
      return JSON.parse(storedGaps);
    }
  } catch (error) {
    console.error("Failed to parse product gaps from localStorage:", error);
    localStorage.removeItem(GAP_STORE_KEY);
  }
  return [];
};

/**
 * Saves a new product gap to the store in localStorage.
 * @param {Omit<ProductGap, 'id' | 'savedAt'>} gapData - The gap to save.
 */
export const saveGap = (gapData: Omit<ProductGap, 'id' | 'savedAt'>): void => {
  try {
    const gaps = getSavedGaps();
    const newGap: ProductGap = {
      ...gapData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      savedAt: new Date().toISOString(),
    };
    
    const updatedGaps = [newGap, ...gaps];
    localStorage.setItem(GAP_STORE_KEY, JSON.stringify(updatedGaps));
  } catch (error) {
    console.error("Failed to save product gap to localStorage:", error);
  }
};

/**
 * Deletes a product gap from the store in localStorage by its ID.
 * @param {string} id - The ID of the gap to delete.
 * @returns {ProductGap[]} The updated list of gaps.
 */
export const deleteGap = (id: string): ProductGap[] => {
    try {
        const gaps = getSavedGaps();
        const updatedGaps = gaps.filter(gap => gap.id !== id);
        localStorage.setItem(GAP_STORE_KEY, JSON.stringify(updatedGaps));
        return updatedGaps;
    } catch (error) {
        console.error("Failed to delete product gap from localStorage:", error);
        return getSavedGaps();
    }
};