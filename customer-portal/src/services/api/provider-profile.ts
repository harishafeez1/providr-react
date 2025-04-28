import axios from 'axios';
import { GET_DIRECT_CONNECT_PROVIDER_URL, GET_DIRECTORY_PROVIDER_URL, GET_PUBLIC_PROVIDER_URL } from '../endpoints';
import { store } from '@/redux/store';
import { setProviderProfile, setProviderProfileDirectory } from '@/redux/slices/service-request-slice';

const getPublicProviderProfile = async (providerId: any, customer_id?: any) => {
  try {
    if (customer_id) {
      const response = await axios.get(`${GET_PUBLIC_PROVIDER_URL}/${providerId}?customer_id=${customer_id}`, {
        headers: { public: true } 
      });
      store.dispatch(setProviderProfile(response.data));
      return response.data;
      
    }else{

      const response = await axios.get(`${GET_PUBLIC_PROVIDER_URL}/${providerId}`, {
        headers: { public: true } 
      });
      store.dispatch(setProviderProfile(response.data));
      return response.data;
    }
  } catch (err) {
    console.error('Error fetching public provider Profile:', err);
    throw err;
  }
};

const getDirectConnectProvider = async (providerId: any, data: any) => {
  try {
    const response = await axios.post(`${GET_DIRECT_CONNECT_PROVIDER_URL}/${providerId}`,data, {
      headers: { public: true } 
    });
    return response.data;
  } catch (err) {
    console.error('Error fetching public provider Profile:', err);
    throw err;
  }
};

const getListoftProvider = async (params: any) => {
  try {
    const response = await axios.post(`${GET_DIRECTORY_PROVIDER_URL}?page=${params}`, {
      headers: { public: true } 
    });
    store.dispatch(setProviderProfileDirectory(response.data));
    return response.data;
  } catch (err) {
    console.error('Error fetching public provider Profiles list:', err);
    throw err;
  }
};

export { getPublicProviderProfile, getDirectConnectProvider, getListoftProvider };
