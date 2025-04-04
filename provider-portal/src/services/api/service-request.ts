import axios from 'axios';
import {
  GET_ALL_CONNECTED_SERVICE_REQUEST_URL,
  GET_ALL_CUSTOMER_SERVICE_REQUEST_URL,
  GET_PROVIDER_INTERESTED_URL,
  GET_SERVICE_REQUEST_CONTACTED_URL,
  GET_SINGLE_SERVICE_REQUEST_URL
} from '../endpoints';

const getAllConnectedServiceRequests = async (comapnyId: string | number) => {
  try {
    const response = await axios.get(`${GET_ALL_CONNECTED_SERVICE_REQUEST_URL}/${comapnyId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching all connected service requests :', err);
    throw err;
  }
};

const getAllCustomerServiceRequests = async (comapnyId: string | number) => {
  try {
    const response = await axios.get(`${GET_ALL_CUSTOMER_SERVICE_REQUEST_URL}/${comapnyId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching all customer service requests :', err);
    throw err;
  }
};

const getInteresetedInRequest = async (
  comapnyId: string | number,
  serviceRequestId: number | string
) => {
  try {
    const response = await axios.get(
      `${GET_PROVIDER_INTERESTED_URL}/${comapnyId}/${serviceRequestId}`
    );
    return response.data;
  } catch (err) {
    console.error('Error fetching all customer service requests :', err);
    throw err;
  }
};

const getSingleServiceRequest = async (serviceRequestId: number | string) => {
  try {
    const response = await axios.get(`${GET_SINGLE_SERVICE_REQUEST_URL}/${serviceRequestId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching single service requests :', err);
    throw err;
  }
};

const getContactedServiceRequest = async (
  comapnyId: string | number,
  serviceRequestId: number | string
) => {
  try {
    const response = await axios.get(
      `${GET_SERVICE_REQUEST_CONTACTED_URL}/${comapnyId}/${serviceRequestId}`
    );
    return response.data;
  } catch (err) {
    console.error('Error fetching contacted service requests :', err);
    throw err;
  }
};

export {
  getAllConnectedServiceRequests,
  getAllCustomerServiceRequests,
  getInteresetedInRequest,
  getSingleServiceRequest,
  getContactedServiceRequest
};
