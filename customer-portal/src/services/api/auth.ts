import axios from 'axios';
import { FORGOT_PASSWORD_URL, RESET_PASSWORD_URL } from '../endpoints';

/**
 * Send forgot password email
 * @param email - User's email address
 */
const forgotPassword = async (email: string) => {
  try {
    const response = await axios.post(FORGOT_PASSWORD_URL, { email });
    return response.data;
  } catch (err) {
    console.error('Error sending forgot password email:', err);
    throw err;
  }
};

/**
 * Reset password using token from email
 * @param email - User's email address
 * @param token - Password reset token from email
 * @param password - New password
 * NOTE: No password_confirmation needed for customers
 */
const resetPassword = async (email: string, token: string, password: string) => {
  try {
    const response = await axios.post(RESET_PASSWORD_URL, {
      email,
      token,
      password
    });
    return response.data;
  } catch (err) {
    console.error('Error resetting password:', err);
    throw err;
  }
};

export { forgotPassword, resetPassword };
