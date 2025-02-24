import axios from 'axios';
import {
  GET_ALL_CONNECTED_SERVICE_REQUEST_URL,
  GET_ALL_CUSTOMER_SERVICE_REQUEST_URL
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

export { getAllConnectedServiceRequests, getAllCustomerServiceRequests };
