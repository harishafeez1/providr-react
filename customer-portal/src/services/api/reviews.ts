import axios from 'axios';
import { GET_REVIEWS_URL } from '../endpoints';

const getReviews = async (params: any) => {
  try {
    const response = await axios.get(`${GET_REVIEWS_URL}?${params}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching Reviews:', err);
    throw err;
  }
};

export { getReviews };
