import axios from 'axios';
import { USER_PROFILE_UPDATE_URL } from '../endpoints';

const updateProfile = async (data: any) => {
  try {
    const response = await axios.post(USER_PROFILE_UPDATE_URL, data);
    return response.data;
  } catch (err) {
    console.error('Error updating user profile:', err);
    throw err;
  }
};

export { updateProfile };
