import axios from 'axios';
import { CLAIM_LISTING_URL, USER_PROFILE_UPDATE_URL } from '../endpoints';

const updateProfile = async (data: any) => {
  try {
    const response = await axios.post(USER_PROFILE_UPDATE_URL, data);
    return response.data;
  } catch (err) {
    console.error('Error updating user profile:', err);
    throw err;
  }
};

const ClaimListing = async (data: any) => {
  try {
    const response = await axios.post(CLAIM_LISTING_URL, data);
    return response.data;
  } catch (err) {
    console.error('Error updating user profile:', err);
    throw err;
  }
};

export { updateProfile, ClaimListing };
