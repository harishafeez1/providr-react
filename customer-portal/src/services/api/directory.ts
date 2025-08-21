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

const getProviderCount = async (latitude: number, longitude: number, service_id?: number) => {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString()
    });

    if (service_id) {
      params.append('service_id', service_id.toString());
    }

    const response = await axios.post(`${GET_SERVICE_PROVIDER_COUNT_URL}?${params.toString()}`, {
      headers: { public: true }
    });
    return response.data;
  } catch (err) {
    console.error('Error provider count data:', err);
    throw err;
  }
};

export { postDirectoryFilters, getProviderCount };
