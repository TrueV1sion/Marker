import type { ReportData, SavedReportData } from '../types';

const REPORT_STORE_KEY = 'helios_report_store';
const REPORTS_UPDATED_EVENT = 'reports-updated';

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
 * @returns {SavedReportData} The saved report object with id and savedAt timestamp.
 */
export const saveReport = (report: ReportData): SavedReportData => {
  const savedReport: SavedReportData = {
    ...report,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    savedAt: new Date().toISOString(),
  };

  try {
    const reports = getSavedReports();
    const updatedReports = [savedReport, ...reports];
    localStorage.setItem(REPORT_STORE_KEY, JSON.stringify(updatedReports));
    window.dispatchEvent(new Event(REPORTS_UPDATED_EVENT));
  } catch (error) {
    console.error("Failed to save report to localStorage:", error);
  }
  return savedReport;
};

/**
 * Updates an existing report in the store.
 * @param {string} id - The ID of the report to update.
 * @param {Partial<ReportData>} updates - An object containing the fields to update.
 * @returns {SavedReportData[] | null} The updated list of reports, or null if the report wasn't found.
 */
export const updateReport = (id: string, updates: Partial<ReportData>): SavedReportData[] | null => {
    try {
        const reports = getSavedReports();
        const reportIndex = reports.findIndex(report => report.id === id);

        if (reportIndex === -1) {
            console.warn(`Report with id ${id} not found for update.`);
            return null;
        }

        reports[reportIndex] = { ...reports[reportIndex], ...updates };

        localStorage.setItem(REPORT_STORE_KEY, JSON.stringify(reports));
        window.dispatchEvent(new Event(REPORTS_UPDATED_EVENT));
        return reports;
    } catch (error) {
        console.error("Failed to update report in localStorage:", error);
        return getSavedReports();
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
        window.dispatchEvent(new Event(REPORTS_UPDATED_EVENT));
        return updatedReports;
    } catch (error) {
        console.error("Failed to delete report from localStorage:", error);
        return getSavedReports();
    }
};