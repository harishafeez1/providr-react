import axios from 'axios';
import {
  GET_INCIDENTS_CUSTOMERS_URL,
  GET_INCIDENTS_STAFF_URL,
  GET_INCIDENTS_STATISTICS_URL,
  GET_ALL_INCIDENTS_URL,
  GET_SINGLE_INCIDENT_URL,
  GET_INCIDENT_TYPES_URL,
  CREATE_INCIDENT_PREVIEW_URL,
  STORE_INCIDENT_URL,
  UPDATE_INCIDENT_URL,
  DELETE_INCIDENT_URL,
  GET_BSP_ANALYSIS_URL,
  GET_BSP_ANALYSIS_REPORT_URL,
  EXPORT_INCIDENT_PDF_URL,
  EXPORT_INCIDENTS_CSV_URL
} from '../endpoints';

// Get customers/participants for dropdown
const fetchIncidentCustomers = async () => {
  try {
    const response = await axios.get(GET_INCIDENTS_CUSTOMERS_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching incident customers:', error);
    throw error;
  }
};

// Get staff for dropdown
const fetchIncidentStaff = async () => {
  try {
    const response = await axios.get(GET_INCIDENTS_STAFF_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching incident staff:', error);
    throw error;
  }
};

// Get all incidents (with optional filters)
const fetchAllIncidents = async (filters?: any) => {
  try {
    const response = await axios.get(GET_ALL_INCIDENTS_URL, { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching all incidents:', error);
    throw error;
  }
};

// Get single incident
const fetchSingleIncident = async (incidentId: string | number) => {
  try {
    const response = await axios.get(`${GET_SINGLE_INCIDENT_URL}/${incidentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching single incident:', error);
    throw error;
  }
};

// Create incident preview with AI report (Step 1 - no save)
const createIncidentPreview = async (data: any) => {
  try {
    const response = await axios.post(CREATE_INCIDENT_PREVIEW_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating incident preview:', error);
    throw error;
  }
};

// Store incident with all edited fields (Step 2 - final save)
const storeIncident = async (data: any) => {
  try {
    const response = await axios.post(STORE_INCIDENT_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error storing incident:', error);
    throw error;
  }
};

// Update incident
const updateIncident = async (incidentId: string | number, data: any) => {
  try {
    const response = await axios.put(`${UPDATE_INCIDENT_URL}/${incidentId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating incident:', error);
    throw error;
  }
};

// Delete incident
const deleteIncident = async (incidentId: string | number) => {
  try {
    const response = await axios.delete(`${DELETE_INCIDENT_URL}/${incidentId}`, {
      skipSuccessToast: true
    } as any);
    return response.data;
  } catch (error) {
    console.error('Error deleting incident:', error);
    throw error;
  }
};

// Get saved BSP Analysis Report from database (silent - no success toast)
const fetchBspAnalysisReport = async (incidentId: string | number) => {
  try {
    const response = await axios.get(`${GET_BSP_ANALYSIS_REPORT_URL}/${incidentId}/bsp-analysis-report`, {
      skipSuccessToast: true
    } as any);
    return response.data;
  } catch (error) {
    console.error('Error fetching BSP analysis report:', error);
    throw error;
  }
};

// Generate/Regenerate BSP Analysis (AI generation)
const fetchBspAnalysis = async (incidentId: string | number) => {
  try {
    const response = await axios.post(`${GET_BSP_ANALYSIS_URL}/${incidentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching BSP analysis:', error);
    throw error;
  }
};

// Export incident as PDF (opens in new window)
const exportIncidentPdf = async (incidentId: string | number) => {
  try {
    const response = await axios.get(`${EXPORT_INCIDENT_PDF_URL}/${incidentId}`, {
      responseType: 'blob'
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `incident_${incidentId}_report.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting incident PDF:', error);
    throw error;
  }
};

// Export incidents as CSV
const exportIncidentsCsv = async (filters?: any) => {
  try {
    const response = await axios.get(EXPORT_INCIDENTS_CSV_URL, {
      params: filters,
      responseType: 'blob'
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `incidents_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting incidents CSV:', error);
    throw error;
  }
};

// Get incident statistics
const fetchIncidentStatistics = async (filters?: any) => {
  try {
    const response = await axios.get(GET_INCIDENTS_STATISTICS_URL, { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error fetching incident statistics:', error);
    throw error;
  }
};

// Get incident types
const fetchIncidentTypes = async () => {
  try {
    const response = await axios.get(GET_INCIDENT_TYPES_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching incident types:', error);
    throw error;
  }
};

export {
  fetchIncidentCustomers,
  fetchIncidentStaff,
  fetchAllIncidents,
  fetchSingleIncident,
  fetchIncidentTypes,
  createIncidentPreview,
  storeIncident,
  updateIncident,
  deleteIncident,
  fetchBspAnalysisReport,
  fetchBspAnalysis,
  exportIncidentPdf,
  exportIncidentsCsv,
  fetchIncidentStatistics
};
