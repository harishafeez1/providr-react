import axios from 'axios';
import { store } from '@/redux/store';
import { setServices } from '@/redux/slices/services-slice';
import { GET_SETTINGS_URL } from '../endpoints';


const getSettings = async () => {
  try {
    const response = await axios.get(`${GET_SETTINGS_URL}`, {headers: {public : true}});
    return response.data;
  } catch (err) {
    console.error('Error fetching Settings:', err);
    throw err;
  }
}


export { getSettings };