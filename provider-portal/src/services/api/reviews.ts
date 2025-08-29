import axios from 'axios';
import { GET_ALL_REVIEWS_URL, GET_INVITE_CUSTOMER_REVIEW_URL } from '../endpoints';

const getAllReviews = async (providerCompanyId: string | number) => {
  try {
    const response = await axios.get(`${GET_ALL_REVIEWS_URL}/${providerCompanyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all errors:', error);
    throw error;
  }
};

const inviteACustomerforReview = async (data: any) => {
  try {
    const response = await axios.post(`${GET_INVITE_CUSTOMER_REVIEW_URL}`, data);
    return response.data;
  } catch (error) {
    console.error('Error inviting customer for review:', error);
    throw error;
  }
};

export { getAllReviews, inviteACustomerforReview };
