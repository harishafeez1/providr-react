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

// Service Request
export const GET_SERVICE_REQUEST_URL = `${API_URL}/service_requests`;
export const GET_SERVICE_REQUEST_VIEW_URL = `${API_URL}/single_service_request`;
export const GET_SERVICE_REQUEST_STORE_URL = `${API_URL}/store_service_request`;

// Reviews
export const GET_REVIEWS_URL = `${API_URL}/reviews`;
export const POST_REVIEW_URL = `${API_URL}/store_review`;

// Documents
export const GET_DOCUMENTS_URL = `${API_URL}/all_documents`;
export const UPLOAD_DOCUMENTS_URL = `${API_URL}/documents`;
export const DOWNLOAD_DOCUMENTS_URL = `${API_URL}/documents`; //id
export const DELETE_DOCUMENTS_URL = `${API_URL}/delete_documents`; //id

// Public Facing Routes
export const GET_PUBLIC_PROVIDER_URL = `${API_URL}/public_provider_profile`;
export const GET_CONNECT_PROVIDER_URL = `${API_URL}/connect_provider`;
export const GET_DIRECT_CONNECT_PROVIDER_URL = `${API_URL}/direct_connect_provider`;
export const GET_DIRECTORY_PROVIDER_URL = `${API_URL}/directory`;
export const GET_ALL_SERVICES_PUBLIC_URL = `${API_URL}/get_services`;
export const GET_PROVIDE_BY_SERVICE_ID_URL = `${API_URL}/get_providers_by_service_id`; //id
export const GET_SETTINGS_URL = `${API_URL}/get_settings`; //id
export const GET_SERVICE_PROVIDER_COUNT_URL = `${API_URL}/provider_count`; //id

// WishList Routes
export const GET_ALL_WISHLIST_FAVOUTIE_URL = `${API_URL}/customer_favs`;
export const GET_ADD_WISHLIST_FAVOUTIE_URL = `${API_URL}/fav_provider`;
