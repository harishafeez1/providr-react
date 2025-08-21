import axios from 'axios';
import { GET_MAPBOX_GEOCODE_URL, GET_MAPBOX_SEARCH_URL } from '../endpoints';

const getAllMapBoxGeocode = async (Lng: number, Lat: number) => {
  try {
    const response = await axios.get(`${GET_MAPBOX_GEOCODE_URL}?lng=${Lng}&lat=${Lat}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all MapboxGeocode:', error);
    throw error;
  }
};

const postMapBoxSearchQuery = async (query:any) => {
  try {
    const response = await axios.get(`${GET_MAPBOX_SEARCH_URL}?query=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error posting mapbox search query:', error);
    throw error;
  }
};
export { getAllMapBoxGeocode, postMapBoxSearchQuery };
