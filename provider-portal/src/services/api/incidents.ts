import axios from 'axios';
import {
  GET_INCIDENTS_CUSTOMERS_URL,
  GET_INCIDENTS_STAFF_URL,
  GET_ALL_INCIDENTS_URL,
  GET_SINGLE_INCIDENT_URL,
  CREATE_INCIDENT_PREVIEW_URL,
  STORE_INCIDENT_URL,
  UPDATE_INCIDENT_URL,
  DELETE_INCIDENT_URL
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
    const response = await axios.delete(`${DELETE_INCIDENT_URL}/${incidentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting incident:', error);
    throw error;
  }
};

export {
  fetchIncidentCustomers,
  fetchIncidentStaff,
  fetchAllIncidents,
  fetchSingleIncident,
  createIncidentPreview,
  storeIncident,
  updateIncident,
  deleteIncident
};
