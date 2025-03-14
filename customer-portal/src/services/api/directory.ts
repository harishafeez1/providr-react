import axios from 'axios';
import {  GET_DIRECTORY_PROVIDER_URL } from '../endpoints';
import { store } from '@/redux/store';

const postDirectoryFilters = async (data:any) => {
  try {
    const response = await axios.post(GET_DIRECTORY_PROVIDER_URL, data, {headers: {public : true}});
    return response.data;
  } catch (err) {
    console.error('Error posting filters data:', err);
    throw err;
  }
};

export { postDirectoryFilters };