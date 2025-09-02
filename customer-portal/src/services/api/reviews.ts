import axios from 'axios';
import { 
  GET_REVIEWS_URL, 
  POST_REVIEW_URL,
  VALIDATE_INVITATION_TOKEN_URL,
  SEND_SMS_VERIFICATION_URL,
  VERIFY_SMS_CODE_URL,
  SUBMIT_TOKEN_REVIEW_URL
} from '../endpoints';

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

const validateInvitationToken = async (token: string) => {
  try {
    const response = await axios.post(VALIDATE_INVITATION_TOKEN_URL, { token });
    return response.data;
  } catch (err) {
    console.error('Error validating invitation token:', err);
    throw err;
  }
};

const sendSmsVerification = async (token: string, phone: string) => {
  try {
    const response = await axios.post(SEND_SMS_VERIFICATION_URL, { token, phone });
    return response.data;
  } catch (err) {
    console.error('Error sending SMS verification:', err);
    throw err;
  }
};

const verifySmsCode = async (token: string, sms_code: string) => {
  try {
    const response = await axios.post(VERIFY_SMS_CODE_URL, { token, sms_code });
    return response.data;
  } catch (err) {
    console.error('Error verifying SMS code:', err);
    throw err;
  }
};

const submitTokenReview = async (data: any) => {
  try {
    const response = await axios.post(SUBMIT_TOKEN_REVIEW_URL, data);
    return response.data;
  } catch (err) {
    console.error('Error submitting token review:', err);
    throw err;
  }
};

export { 
  getReviews, 
  postReview, 
  validateInvitationToken,
  sendSmsVerification,
  verifySmsCode,
  submitTokenReview
};
