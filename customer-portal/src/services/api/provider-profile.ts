import axios from 'axios';
import { GET_PUBLIC_PROVIDER_URL } from '../endpoints';

const getPublicProviderProfile = async (providerId: any) => {
  try {
    const response = await axios.get(`${GET_PUBLIC_PROVIDER_URL}/${providerId}`, {
      headers: { public: true } // Set the public flag here
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching public provider Profile:', err);
    throw err;
  }
};

export { getPublicProviderProfile };
