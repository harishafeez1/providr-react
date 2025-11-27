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
export const POST_REVIEW_REPLY_URL = `${API_URL}/reviews`;
export const UPDATE_REVIEW_REPLY_URL = `${API_URL}/reviews/reply/update`;
export const DELETE_REVIEW_REPLY_URL = `${API_URL}/reviews/reply`;

// All Services Routes
export const GET_ALL_SERVICES_URL = `${API_URL}/all_services`;

// All Notifications Routes
export const GET_NOTIFICATIONS_URL = `${API_URL}/notification_settings`; // type provider | customer / user_id | company_id
export const UPDATE_NOTIFICATIONS_URL = `${API_URL}/notification_settings/update`;

//MAPBOX Routes

export const GET_MAPBOX_GEOCODE_URL = `${API_URL}/mapbox/geocode`; //?lng={longitude}&lat={latitude}
export const GET_MAPBOX_SEARCH_URL = `${API_URL}/mapbox/search`; //?query={query}

// invitaion email
export const GET_INVITE_CUSTOMER_REVIEW_URL = `${API_URL}/provider-review/send-invitation`;

// Stripe
export const GET_STRIPE_CREATE_SESSION_URL = `${API_URL}/stripe/create-checkout-session`;
export const POST_STRIPE_CREATE_TRIAL_SESSION_URL = `${API_URL}/stripe/create-trial-session`;
export const POST_STRIPE_BILLING_PORTAL_URL = `${API_URL}/stripe/create-billing-portal-session`;
export const GET_STRIPE_SUBSCRIPTION_STATUS_URL = `${API_URL}/stripe/subscription-status`;
export const POST_STRIPE_CANCEL_SUBSCRIPTION_URL = `${API_URL}/stripe/cancel-subscription`;
export const POST_STRIPE_REACTIVATE_SUBSCRIPTION_URL = `${API_URL}/stripe/reactivate-subscription`;

// Incidents Routes
export const GET_INCIDENTS_CUSTOMERS_URL = `${API_URL}/incidents/customers`;
export const GET_INCIDENTS_STAFF_URL = `${API_URL}/incidents/staff`;
export const GET_ALL_INCIDENTS_URL = `${API_URL}/incidents`;
export const GET_SINGLE_INCIDENT_URL = `${API_URL}/incidents`;
export const CREATE_INCIDENT_PREVIEW_URL = `${API_URL}/incidents/preview`;
export const STORE_INCIDENT_URL = `${API_URL}/incidents`;
export const UPDATE_INCIDENT_URL = `${API_URL}/incidents`;
export const DELETE_INCIDENT_URL = `${API_URL}/incidents`;
export const GET_BSP_ANALYSIS_URL = `${API_URL}/incidents/getbspAnalysis`;
