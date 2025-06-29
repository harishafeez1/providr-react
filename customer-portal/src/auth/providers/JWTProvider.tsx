/* eslint-disable no-unused-vars */
import axios, { AxiosResponse } from 'axios';
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useEffect,
  useState
} from 'react';

import * as authHelper from '../_helpers';
import { type AuthModel, type UserModel } from '@/auth';
import {
  FORGOT_PASSWORD_URL,
  GET_USER_URL,
  GOOGLE_LOGIN_URL,
  LOGIN_URL,
  LOGOUT_URL,
  REGISTER_URL,
  RESET_PASSWORD_URL
} from '@/services/endpoints';
import { useAppSelector } from '@/redux/hooks';
import { RootState, store } from '@/redux/store';
import { getStoreRequest } from '@/services/api/service-requests';
import { setResetServiceState } from '@/redux/slices/services-slice';

interface AuthContextProps {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  auth: AuthModel | undefined;
  saveAuth: (auth: AuthModel | undefined) => void;
  currentUser: UserModel | undefined;
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (code: any) => Promise<void>;
  loginWithGoogle?: () => Promise<void>;
  loginWithFacebook?: () => Promise<void>;
  loginWithGithub?: () => Promise<void>;
  register: (
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    phone: string
  ) => Promise<void>;
  requestPasswordResetLink: (email: string) => Promise<void>;
  changePassword: (
    email: string,
    token: string,
    password: string,
    password_confirmation: string
  ) => Promise<void>;
  getUser: () => Promise<AxiosResponse<any>>;
  logout: () => void;
  verify: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>();

  const { wizardData } = useAppSelector((state: RootState) => state.services);

  const verify = async () => {
    if (auth) {
      try {
        const { data: user } = await getUser();
        setCurrentUser(user);
      } catch {
        saveAuth(undefined);
        setCurrentUser(undefined);
      }
    }
  };

  const saveAuth = (auth: AuthModel | undefined) => {
    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data: auth } = await axios.post<AuthModel>(LOGIN_URL, {
        email,
        password
      });
      saveAuth(auth);
      // const { data: user } = await getUser();
      setCurrentUser(auth?.user);
      if (window.opener) {
        window.opener.postMessage('closeLogin', '*');
        window.close();
      }
    } catch (error) {
      saveAuth(undefined);
      throw new Error(`Error ${error}`);
    }
  };

  const register = async (
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    phone: string
  ) => {
    try {
      const { data: auth } = await axios.post(REGISTER_URL, {
        first_name,
        last_name,
        email,
        password,
        phone
      });
      saveAuth(auth);

      const { data: user } = await getUser();
      setCurrentUser(user);
      if (window.opener) {
        window.opener.postMessage('closeLogin', '*');
        window.close();
      }
    } catch (error) {
      saveAuth(undefined);
      throw new Error(`Error ${error}`);
    }
  };

  const requestPasswordResetLink = async (email: string) => {
    await axios.post(FORGOT_PASSWORD_URL, {
      email
    });
  };

  const changePassword = async (
    email: string,
    token: string,
    password: string,
    password_confirmation: string
  ) => {
    await axios.post(RESET_PASSWORD_URL, {
      email,
      token,
      password,
      password_confirmation
    });
  };

  const getUser = async () => {
    return await axios.get<UserModel>(GET_USER_URL);
  };

  const googleLogin = async (code: any) => {
    try {
      const { data: auth } = await axios.post(`${GOOGLE_LOGIN_URL}`, code);
      saveAuth(auth);
      // const { data: user } = await getUser();
      setCurrentUser(auth?.user);
      if (window.opener) {
        window.opener.postMessage('closeLogin', '*');
        window.close();
      }
    } catch (error) {
      saveAuth(undefined);
      throw new Error(`Login Error ${error}`);
    }
  };

  const logout = async () => {
    try {
      const response = await axios.post(LOGOUT_URL);
      if (response.status === 200) {
        authHelper.removeAuth();
        saveAuth(undefined);
        setCurrentUser(undefined);
        window.location.reload();
      }
    } catch (err) {
      throw new Error(`Logout Error ${err}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        auth,
        saveAuth,
        currentUser,
        setCurrentUser,
        login,
        googleLogin,
        register,
        requestPasswordResetLink,
        changePassword,
        getUser,
        logout,
        verify
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
