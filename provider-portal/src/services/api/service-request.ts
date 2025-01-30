import axios from 'axios';
import { GET_ALL_SERVICE_REQUEST_URL } from '../endpoints';

const getAllServiceRequests = async (comapnyId: string | number) => {
  try {
    const response = await axios.get(`${GET_ALL_SERVICE_REQUEST_URL}/${comapnyId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching all service requests :', err);
    throw err;
  }
};

export { getAllServiceRequests };
