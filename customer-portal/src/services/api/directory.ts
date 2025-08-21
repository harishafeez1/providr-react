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

const getProviderCount = async (service_id: number, latitude?: number, longitude?: number) => {
  try {
    const params = new URLSearchParams({
      service_id: service_id.toString()
    });

    // Only add location parameters if both are provided
    if (latitude !== undefined && longitude !== undefined) {
      params.append('latitude', latitude.toString());
      params.append('longitude', longitude.toString());
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
