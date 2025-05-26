import axios from 'axios';
import { GET_ALL_SERVICES_PUBLIC_URL, GET_PROVIDE_BY_SERVICE_ID_URL } from '../endpoints';
import { store } from '@/redux/store';
import { setAllServices } from '@/redux/slices/services-slice';

const getAllServices = async (params: string) => {
  try {
    const response = await axios.get(`${GET_ALL_SERVICES_PUBLIC_URL}?${params}`, {headers: {public : true}});

    store.dispatch(setAllServices(response.data))
    return response.data;
  } catch (err) {
    console.error('Error fetching Services:', err);
    throw err;
  }
};


const getProvidersByServiceId = async (id: number, params: string) => {
  try {
    const response = await axios.get(`${GET_PROVIDE_BY_SERVICE_ID_URL}/${id}?${params}`, {headers: {public : true}});
    return response.data;
  } catch (err) {
    console.error('Error fetching Services related provider:', err);
    throw err;
  }
}

export { getAllServices,getProvidersByServiceId };