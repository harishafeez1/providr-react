import axios from 'axios';
import {
  GET_DASHBOARD_OVERVIEW_URL,
  GET_DASHBOARD_INCIDENT_TRENDS_URL,
  GET_DASHBOARD_INCIDENT_DISTRIBUTION_URL,
  GET_DASHBOARD_RECENT_INCIDENTS_URL,
  GET_DASHBOARD_PARTICIPANTS_URL
} from '../endpoints';

// Dashboard Overview (stats, restrictive practice trends, breakdown by type)
const fetchDashboardOverview = async (params?: {
  participant_id?: number;
  start_date?: string;
  end_date?: string;
  period?: string;
}) => {
  try {
    const response = await axios.get(GET_DASHBOARD_OVERVIEW_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    throw error;
  }
};

// Incident Trends Over Time
const fetchIncidentTrends = async (params?: {
  participant_id?: number;
  start_date?: string;
  end_date?: string;
  period?: string;
}) => {
  try {
    const response = await axios.get(GET_DASHBOARD_INCIDENT_TRENDS_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching incident trends:', error);
    throw error;
  }
};

// Incident Distribution (by type and severity)
const fetchIncidentDistribution = async (params?: {
  participant_id?: number;
  start_date?: string;
  end_date?: string;
  period?: string;
}) => {
  try {
    const response = await axios.get(GET_DASHBOARD_INCIDENT_DISTRIBUTION_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching incident distribution:', error);
    throw error;
  }
};

// Recent Incidents
const fetchDashboardRecentIncidents = async (params?: {
  limit?: number;
  participant_id?: number;
}) => {
  try {
    const response = await axios.get(GET_DASHBOARD_RECENT_INCIDENTS_URL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent incidents:', error);
    throw error;
  }
};

// Participants List for dropdown
const fetchDashboardParticipants = async () => {
  try {
    const response = await axios.get(GET_DASHBOARD_PARTICIPANTS_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard participants:', error);
    throw error;
  }
};

export {
  fetchDashboardOverview,
  fetchIncidentTrends,
  fetchIncidentDistribution,
  fetchDashboardRecentIncidents,
  fetchDashboardParticipants
};
