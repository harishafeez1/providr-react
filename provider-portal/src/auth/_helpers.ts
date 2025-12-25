import { User as Auth0UserModel } from '@auth0/auth0-spa-js';

import { getData, setData } from '@/utils';
import { type AuthModel } from './_models';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

const AUTH_LOCAL_STORAGE_KEY = `${import.meta.env.VITE_APP_NAME}-auth-v${
  import.meta.env.VITE_APP_VERSION
}`;

const getAuth = (): AuthModel | undefined => {
  try {
    const auth = getData(AUTH_LOCAL_STORAGE_KEY) as AuthModel | undefined;
    if (auth) {
      return auth;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error('AUTH LOCAL STORAGE PARSE ERROR', error);
  }
};

const setAuth = (auth: AuthModel | Auth0UserModel) => {
  setData(AUTH_LOCAL_STORAGE_KEY, auth);
};

const removeAuth = () => {
  if (!localStorage) {
    return;
  }

  try {
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
  } catch (error) {
    console.error('AUTH LOCAL STORAGE REMOVE ERROR', error);
  }
};

interface ErrorMsg {
  message?: string;
}

export function setupAxios(axios: any) {
  axios.defaults.headers.Accept = 'application/json';
  axios.interceptors.request.use(
    (config: { headers: { Authorization: string } }) => {
      const auth = getAuth();

      if (auth?.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }

      return config;
    },
    async (err: any) => await Promise.reject(err)
  );

  axios.interceptors.response.use(
    (response: any) => {
      if (response?.data.message) {
        toast.success(response?.data?.message, {
          position: 'top-right'
        });
      }
      return response;
    },
    async (error: any) => {
      // Log full error details to console for debugging
      console.group('🔴 API Error Details');
      console.error('Error:', error);
      console.error('Response:', error.response);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Headers:', error.response?.headers);
      console.error('Request URL:', error.config?.url);
      console.error('Request Method:', error.config?.method);
      console.error('Request Data:', error.config?.data);
      console.groupEnd();

      const axiosError = error as AxiosError<ErrorMsg>;
      if (axiosError.response?.data.message) {
        toast.error(axiosError?.response?.data?.message, {
          position: 'top-right'
        });
      }

      if (error.response && error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;

        Object.values(errors)
          .flat()
          .forEach((message: any) => {
            toast.error(message, {
              position: 'top-right'
            });
          });
      }

      // If no specific error message was found, show a generic error with status
      if (!axiosError.response?.data.message && (!error.response?.data?.errors || Object.keys(error.response.data.errors).length === 0)) {
        const statusText = error.response?.statusText || 'Unknown Error';
        const status = error.response?.status || '';
        toast.error(`API Error ${status}: ${statusText}`, {
          position: 'top-right'
        });
      }

      // Reject the error for further handling
      return await Promise.reject(error);
    }
  );
}

export { AUTH_LOCAL_STORAGE_KEY, getAuth, removeAuth, setAuth };
