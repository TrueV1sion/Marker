import type { ReportData, SavedReportData } from '../types';

const REPORT_STORE_KEY = 'helios_report_store';

/**
 * Retrieves the list of saved reports from localStorage.
 * @returns {SavedReportData[]} An array of saved reports.
 */
export const getSavedReports = (): SavedReportData[] => {
  try {
    const storedReports = localStorage.getItem(REPORT_STORE_KEY);
    if (storedReports) {
      return JSON.parse(storedReports);
    }
  } catch (error) {
    console.error("Failed to parse reports from localStorage:", error);
    localStorage.removeItem(REPORT_STORE_KEY);
  }
  return [];
};

/**
 * Saves a new report to the store in localStorage.
 * @param {ReportData} report - The report to save.
 */
export const saveReport = (report: ReportData): void => {
  try {
    const reports = getSavedReports();
    const savedReport: SavedReportData = {
      ...report,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      savedAt: new Date().toISOString(),
    };
    
    const updatedReports = [savedReport, ...reports];
    localStorage.setItem(REPORT_STORE_KEY, JSON.stringify(updatedReports));
  } catch (error) {
    console.error("Failed to save report to localStorage:", error);
  }
};

/**
 * Deletes a report from the store in localStorage by its ID.
 * @param {string} id - The ID of the report to delete.
 * @returns {SavedReportData[]} The updated list of reports.
 */
export const deleteReport = (id: string): SavedReportData[] => {
    try {
        const reports = getSavedReports();
        const updatedReports = reports.filter(report => report.id !== id);
        localStorage.setItem(REPORT_STORE_KEY, JSON.stringify(updatedReports));
        return updatedReports;
    } catch (error) {
        console.error("Failed to delete report from localStorage:", error);
        return getSavedReports();
    }
};
