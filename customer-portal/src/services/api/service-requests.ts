import axios from 'axios';
import { GET_SERVICE_REQUEST_URL, GET_SERVICE_REQUEST_VIEW_URL } from '../endpoints';

const getServiceRequests = async (params: any) => {
  try {
    const response = await axios.get(`${GET_SERVICE_REQUEST_URL}?${params}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching Service Requests:', err);
    throw err;
  }
};

const getSingleServiceRequests = async (requestId: any) => {
  try {
    const response = await axios.get(`${GET_SERVICE_REQUEST_VIEW_URL}/${requestId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching Single Service Requests:', err);
    throw err;
  }
};

export { getServiceRequests, getSingleServiceRequests };
