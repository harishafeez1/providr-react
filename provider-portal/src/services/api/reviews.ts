import axios from 'axios';
import { GET_ALL_REVIEWS_URL } from '../endpoints';

const getAllReviews = async (providerCompanyId: string | number) => {
  try {
    const response = await axios.get(`${GET_ALL_REVIEWS_URL}/${providerCompanyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all errors:', error);
    throw error;
  }
};

export { getAllReviews };
