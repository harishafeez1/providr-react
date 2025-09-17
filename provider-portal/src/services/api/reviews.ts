import axios from 'axios';
import {
  GET_ALL_REVIEWS_URL,
  GET_INVITE_CUSTOMER_REVIEW_URL,
  POST_REVIEW_REPLY_URL,
  UPDATE_REVIEW_REPLY_URL,
  DELETE_REVIEW_REPLY_URL
} from '../endpoints';

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

const replyToReview = async (reviewId: string | number, content: string) => {
  try {
    const response = await axios.post(`${POST_REVIEW_REPLY_URL}/${reviewId}/reply`, {
      content
    });
    return response.data;
  } catch (error) {
    console.error('Error replying to review:', error);
    throw error;
  }
};

const updateReply = async (replyId: string | number, content: string) => {
  try {
    const response = await axios.post(`${UPDATE_REVIEW_REPLY_URL}/${replyId}`, {
      content
    });
    return response.data;
  } catch (error) {
    console.error('Error updating reply:', error);
    throw error;
  }
};

const deleteReply = async (replyId: string | number) => {
  try {
    const response = await axios.delete(`${DELETE_REVIEW_REPLY_URL}/${replyId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting reply:', error);
    throw error;
  }
};

export { getAllReviews, inviteACustomerforReview, replyToReview, updateReply, deleteReply };
