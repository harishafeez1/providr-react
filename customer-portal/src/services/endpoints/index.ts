const API_URL = import.meta.env.VITE_APP_API_URL;

// Auth Routes
export const REGISTER_URL = `${API_URL}/register`;
export const LOGIN_URL = `${API_URL}/login`;
export const GOOGLE_LOGIN_URL = `${API_URL}/google_auth`;
export const GET_USER_URL = `${API_URL}/profile`;
export const USER_PROFILE_UPDATE_URL = `${API_URL}/update_profile`;
export const FORGOT_PASSWORD_URL = `${API_URL}/forgot`;
export const RESET_PASSWORD_URL = `${API_URL}/reset`;
export const LOGOUT_URL = `${API_URL}/logout`;
