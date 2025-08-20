import axios from 'axios';
import { GET_NEARBY_PROVIDERS_URL } from '../endpoints';

const searchNearByProviders = async (data: any) => {
  try {
    const response = await axios.post(GET_NEARBY_PROVIDERS_URL, data, {
      headers: { public: true }
    });
    return response.data;
  } catch (err) {
    console.error('Error searching providers:', err);
    throw err;
  }
};

export { searchNearByProviders };
