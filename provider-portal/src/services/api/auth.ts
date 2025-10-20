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
 * @param password_confirmation - Password confirmation (required for providers)
 */
const resetPassword = async (
  email: string,
  token: string,
  password: string,
  password_confirmation: string
) => {
  try {
    const response = await axios.post(RESET_PASSWORD_URL, {
      email,
      token,
      password,
      password_confirmation
    });
    return response.data;
  } catch (err) {
    console.error('Error resetting password:', err);
    throw err;
  }
};

export { forgotPassword, resetPassword };
