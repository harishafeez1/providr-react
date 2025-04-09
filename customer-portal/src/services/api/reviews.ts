import axios from 'axios';
import { GET_REVIEWS_URL, POST_REVIEW_URL } from '../endpoints';

const getReviews = async (params: any) => {
  try {
    const response = await axios.get(`${GET_REVIEWS_URL}?${params}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching Reviews:', err);
    throw err;
  }
};

const postReview = async (data: any) => {
  try {
    const response = await axios.post(POST_REVIEW_URL, data);
    return response.data;
  } catch (err) {
    console.error('Error posting Reviews:', err);
    throw err;
  }
};



export { getReviews, postReview };
