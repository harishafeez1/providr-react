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
import { ProviderCompany, type AuthModel, type UserModel } from '@/auth';
import {
  FORGOT_PASSWORD_URL,
  GET_UPDATE_USER_URL,
  GET_USER_URL,
  GOOGLE_LOGIN_URL,
  LOGIN_URL,
  LOGOUT_URL,
  REGISTER_URL,
  RESET_PASSWORD_URL
} from '@/services/endpoints';
import { getAllServices } from '@/services/api';
import { setServices } from '@/redux/slices/services-slice';
import { store } from '@/redux/store';
import { useAppSelector } from '@/redux/hooks';

interface AuthContextProps {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  auth: AuthModel | undefined;
  saveAuth: (auth: AuthModel | undefined) => void;
  currentUser: UserModel | undefined;
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>;
  currentCompany: ProviderCompany | undefined;
  setCurrentCompany: Dispatch<SetStateAction<ProviderCompany | undefined>>;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (code: any) => Promise<void>;
  loginWithGoogle?: () => Promise<void>;
  loginWithFacebook?: () => Promise<void>;
  loginWithGithub?: () => Promise<void>;
  register: (
    first_name: string,
    last_name: string,
    phone: string,
    business_name: string,
    job_role: string,
    ndis: boolean,
    email: string,
    password: string
  ) => Promise<void>;
  requestPasswordResetLink: (email: string) => Promise<void>;
  changePassword: (
    email: string,
    token: string,
    password: string,
    password_confirmation: string
  ) => Promise<void>;
  getUser: () => Promise<AxiosResponse<any>>;
  updateUser: (
    first_name?: string,
    last_name?: string,
    phone?: string,
    email?: string,
    password?: string
  ) => Promise<any>;
  logout: () => void;
  verify: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>();
  const [currentCompany, setCurrentCompany] = useState<ProviderCompany | undefined>(
    currentUser?.provider_company
  );

  const { services } = useAppSelector((state) => state.services);

  useEffect(() => {
    setCurrentCompany(currentUser?.provider_company);
    const fetchServices = async () => {
      const services = await getAllServices();
      store.dispatch(setServices(services));
    };
    if (localStorage.getItem('impersonate') !== 'true' && services.length === 0) {
      fetchServices();
    }
  }, [currentUser]);

  const verify = async () => {
    if (auth?.token) {
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
    } catch (error) {
      saveAuth(undefined);
      throw new Error(`Login Error ${error}`);
    }
  };

  const googleLogin = async (code: any) => {
    try {
      const { data: auth } = await axios.post(`${GOOGLE_LOGIN_URL}`, code);
      saveAuth(auth);
      // const { data: user } = await getUser();
      setCurrentUser(auth?.user);
    } catch (error) {
      saveAuth(undefined);
      throw new Error(`Login Error ${error}`);
    }
  };

  const register = async (
    first_name: string,
    last_name: string,
    phone: string,
    business_name: string,
    job_role: string,
    ndis: boolean,
    email: string,
    password: string
  ) => {
    try {
      const { data: auth } = await axios.post(REGISTER_URL, {
        first_name: first_name,
        last_name: last_name,
        phone: phone,
        business_name: business_name,
        job_role: job_role,
        ndis: ndis,
        email: email,
        password: password
      });
      saveAuth(auth);
      // const { data: user } = await getUser();
      setCurrentUser(auth?.user);
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const requestPasswordResetLink = async (email: string) => {
    try {
      await axios.post(FORGOT_PASSWORD_URL, {
        email
      });
    } catch (error) {
      throw new Error(`Reset Error ${error}`);
    }
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
    try {
      const newAuth = authHelper.getAuth();
      if (newAuth?.user?.id) {
        return await axios.get<UserModel>(`${GET_USER_URL}/${newAuth?.user?.id}`);
      } else {
        throw new Error('User IDs do not match. Cannot fetch user data.');
      }
    } catch (error) {
      throw new Error(`Get User Error ${error}`);
    }
  };

  const updateUser = async (
    first_name?: string,
    last_name?: string,
    phone?: string,
    email?: string,
    password?: string
  ) => {
    try {
      const res = await axios.post<UserModel>(`${GET_UPDATE_USER_URL}/${auth?.user?.id}`, {
        first_name,
        last_name,
        phone,
        email,
        password
      });
      setCurrentUser(res?.data);
    } catch (error) {
      throw new Error(`Update User Error ${error}`);
    }
  };

  const logout = async () => {
    try {
      delete axios.defaults.headers.common['Authorization'];

      const response = await axios.post(LOGOUT_URL);
      if (response.status === 200) {
        authHelper.removeAuth();
        saveAuth(undefined);
        setCurrentUser(undefined);
        setCurrentCompany(undefined);
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
        currentCompany,
        setCurrentCompany,
        login,
        googleLogin,
        register,
        requestPasswordResetLink,
        changePassword,
        getUser,
        updateUser,
        logout,
        verify
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
