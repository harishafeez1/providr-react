const API_URL = import.meta.env.VITE_APP_API_URL;

// Auth Routes
export const LOGIN_URL = `${API_URL}/login`;
export const GOOGLE_LOGIN_URL = `${API_URL}/google_auth`;
export const LOGOUT_URL = `${API_URL}/logout`;
export const REGISTER_URL = `${API_URL}/register`;
export const FORGOT_PASSWORD_URL = `${API_URL}/forgot`;
export const RESET_PASSWORD_URL = `${API_URL}/reset`;
export const GET_USER_URL = `${API_URL}/provider_user_profile`;
export const GET_UPDATE_USER_URL = `${API_URL}/provider_user_profile/update`;

// Service Offerings Routes
export const SERVICE_OFFERING_ACT_DEACTIVATE_URL = `${API_URL}/service_offerings/update_active`;
export const SERVICE_OFFERING_ADD_URL = `${API_URL}/service_offerings`;
export const GET_ALL_SERVICE_OFFERING_URL = `${API_URL}/service_offerings/all_service_offerings`;
export const GET_SINGLE_SERVICE_OFFERING_URL = `${API_URL}/service_offerings`;
export const GET_UPDATE_SERVICE_OFFERING_URL = `${API_URL}/service_offerings/update`;
export const GET_DELETE_SERVICE_OFFERING_URL = `${API_URL}/service_offerings/delete`;

// Service Requests Routes
export const GET_ALL_CONNECTED_SERVICE_REQUEST_URL = `${API_URL}/service_requests/connected_service_requests`;
export const GET_ALL_CUSTOMER_SERVICE_REQUEST_URL = `${API_URL}/service_requests/all_service_requests`;
export const GET_PROVIDER_INTERESTED_URL = `${API_URL}/service_requests/send_request`;
export const GET_SINGLE_SERVICE_REQUEST_URL = `${API_URL}/service_requests`;
export const GET_SERVICE_REQUEST_CONTACTED_URL = `${API_URL}/service_requests/customer_contacted`;

// All Users Routes
export const GET_ALL_USER_URL = `${API_URL}/provider_user_profile/all_users`;
export const UPDATE_USER_ROLE_URL = `${API_URL}/provider_user_profile/update_roles`;
export const INVITE_USER_ROLE_URL = `${API_URL}/provider_user_profile/invite_user`;
export const DELETE_USER_URL = `${API_URL}/provider_user_profile/delete`;

// Company Routes
export const UPDATE_COMPANY_PROFILE_URL = `${API_URL}/provider_company/update`;
export const DELETE_COMPANY_PHOTO_GALLERY_URL = `${API_URL}/provider_company/delete_photo_gallery`;

// Premises Routes
export const GET_PREMISES_URL = `${API_URL}/premises`;
export const UPDATE_SINGLE_PREMISES_URL = `${API_URL}/premises/update`;
export const DELETE_PREMISES_URL = `${API_URL}/premises/delete`;
export const GET_SINGLE_PREMISES_URL = `${API_URL}/premises`;
export const GET_ALL_PREMISES_URL = `${API_URL}/premises/all_premises`;

// All Reviews Routes
export const GET_ALL_REVIEWS_URL = `${API_URL}/reviews/all_reviews`;

// All Services Routes
export const GET_ALL_SERVICES_URL = `${API_URL}/all_services`;

// All Notifications Routes
export const GET_NOTIFICATIONS_URL = `${API_URL}/notification_settings`; // type provider | customer / user_id | company_id
export const UPDATE_NOTIFICATIONS_URL = `${API_URL}/notification_settings/update`;
