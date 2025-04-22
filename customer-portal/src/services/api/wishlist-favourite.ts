import axios from 'axios';
import { GET_ADD_WISHLIST_FAVOUTIE_URL, GET_ALL_WISHLIST_FAVOUTIE_URL } from '../endpoints';


const addFavouriteProvider = async (  provider_id: number, customer_id:number | undefined) => {
  try {
    const response = await axios.get(`${GET_ADD_WISHLIST_FAVOUTIE_URL}/${provider_id}/${customer_id}`);
    return response.data;
  } catch (err) {
    console.error('Error Adding to wishlist:', err);
    throw err;
  }
};

const getCustomerWishlist = async (  customer_id:number | undefined,params?: string) => {
  try {
    const response = await axios.get(`${GET_ALL_WISHLIST_FAVOUTIE_URL}/${customer_id}?${params}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    throw err;
  }
};



export {  addFavouriteProvider, getCustomerWishlist };
