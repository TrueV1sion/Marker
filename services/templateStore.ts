
import type { ReportTemplate } from '../types';
import { SEED_TEMPLATES } from './seedTemplates';

const TEMPLATE_STORE_KEY = 'helios_template_store';
const SEED_TEMPLATES_INITIALIZED_KEY = 'helios_seed_templates_initialized';


/**
 * Retrieves the list of saved templates from localStorage.
 * @returns {ReportTemplate[]} An array of saved templates.
 */
export const getTemplates = (): ReportTemplate[] => {
  try {
    const storedTemplates = localStorage.getItem(TEMPLATE_STORE_KEY);
    if (storedTemplates) {
      return JSON.parse(storedTemplates);
    }
  } catch (error) {
    console.error("Failed to parse templates from localStorage:", error);
    localStorage.removeItem(TEMPLATE_STORE_KEY);
  }
  return [];
};

/**
 * Retrieves all templates, ensuring default seed templates are present.
 * @returns {ReportTemplate[]} An array of all templates.
 */
export const getSeededTemplates = (): ReportTemplate[] => {
    const hasInitialized = localStorage.getItem(SEED_TEMPLATES_INITIALIZED_KEY);
    let allTemplates = getTemplates();

    if (!hasInitialized) {
        const seedTemplatesWithIds: ReportTemplate[] = SEED_TEMPLATES.map(t => ({
            ...t,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
        }));
        
        // Filter out any potential duplicates by name, just in case
        const existingDefaultNames = new Set(allTemplates.filter(t => t.isDefault).map(t => t.name));
        const newSeeds = seedTemplatesWithIds.filter(t => !existingDefaultNames.has(t.name));

        allTemplates = [...newSeeds, ...allTemplates];
        localStorage.setItem(TEMPLATE_STORE_KEY, JSON.stringify(allTemplates));
        localStorage.setItem(SEED_TEMPLATES_INITIALIZED_KEY, 'true');
    }

    // Sort to show default templates first, then custom ones by creation date
    return allTemplates.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};


/**
 * Saves a new template to the store in localStorage.
 * @param {Omit<ReportTemplate, 'id' | 'createdAt'>} templateData - The template to save.
 * @returns {ReportTemplate} The saved template object with id and createdAt timestamp.
 */
export const saveTemplate = (templateData: Omit<ReportTemplate, 'id' | 'createdAt' | 'isDefault' | 'job' | 'icon'>): ReportTemplate => {
  const newTemplate: ReportTemplate = {
    ...templateData,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    isDefault: false,
  };

  try {
    const templates = getTemplates();
    const updatedTemplates = [newTemplate, ...templates];
    localStorage.setItem(TEMPLATE_STORE_KEY, JSON.stringify(updatedTemplates));
  } catch (error) {
    console.error("Failed to save template to localStorage:", error);
  }
  return newTemplate;
};

/**
 * Deletes a template from the store in localStorage by its ID.
 * @param {string} id - The ID of the template to delete.
 * @returns {ReportTemplate[]} The updated list of templates.
 */
export const deleteTemplate = (id: string): ReportTemplate[] => {
    try {
        const templates = getTemplates();
        const updatedTemplates = templates.filter(template => template.id !== id);
        localStorage.setItem(TEMPLATE_STORE_KEY, JSON.stringify(updatedTemplates));
        return updatedTemplates;
    } catch (error) {
        console.error("Failed to delete template from localStorage:", error);
        return getTemplates();
    }
};
