import axios from 'axios';
import { GET_ALL_SERVICES_PUBLIC_URL } from '../endpoints';
import { store } from '@/redux/store';
import { setServices } from '@/redux/slices/services-slice';

const getAllServices = async () => {
  try {
    const response = await axios.get(GET_ALL_SERVICES_PUBLIC_URL, {headers: {public : true}});
    store.dispatch(setServices(response.data))
    return response.data;
  } catch (err) {
    console.error('Error fetching Services:', err);
    throw err;
  }
};

export { getAllServices };