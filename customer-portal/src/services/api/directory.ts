import axios from 'axios';
import { GET_DIRECTORY_PROVIDER_URL, GET_SERVICE_PROVIDER_COUNT_URL } from '../endpoints';
import { store } from '@/redux/store';

const postDirectoryFilters = async (data: any) => {
  try {
    const response = await axios.post(GET_DIRECTORY_PROVIDER_URL, data, {
      headers: { public: true }
    });
    return response.data;
  } catch (err) {
    console.error('Error posting filters data:', err);
    throw err;
  }
};

const getProviderCount = async (query: any) => {
  try {
    const response = await axios.get(`${GET_SERVICE_PROVIDER_COUNT_URL}?${query}`, {
      headers: { public: true }
    });
    return response.data;
  } catch (err) {
    console.error('Error provider count data:', err);
    throw err;
  }
};

export { postDirectoryFilters, getProviderCount };
