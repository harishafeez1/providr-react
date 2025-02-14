import axios from 'axios';
import { GET_SERVICE_REQUEST_URL } from '../endpoints';

const getServiceRequests = async (params: any) => {
  try {
    const response = await axios.get(`${GET_SERVICE_REQUEST_URL}?${params}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching Service Requests:', err);
    throw err;
  }
};

export { getServiceRequests };
