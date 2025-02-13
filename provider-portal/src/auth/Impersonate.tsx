import { ScreenLoader } from '@/components';
import { useEffect } from 'react';
import { getAuth, removeAuth } from './_helpers';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from './useAuthContext';

import axios from 'axios';
import { GET_USER_URL } from '@/services/endpoints';

function Impersonate() {
  const { logout, setCurrentUser, saveAuth } = useAuthContext();
  const location = useLocation();
  const auth = getAuth();
  const navigate = useNavigate();

  const getQueryParam = (param: any) => {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get(param);
  };

  const token = getQueryParam('token');
  const user_id = getQueryParam('user_id');

  useEffect(() => {
    localStorage.setItem('impersonate', 'true');

    const handleImpersonation = async () => {
      delete axios.defaults.headers.common['Authorization'];

      if (auth?.token) {
        try {
          await logout();
        } catch (error) {
          console.error('Impersonate: error logging out', error);
        }
      }

      if (token && user_id) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        saveAuth({ token, user: { id: Number(user_id) } });

        try {
          const response = await axios.get(`${GET_USER_URL}/${user_id}`);
          setCurrentUser(response.data);
          saveAuth({
            token,
            user: response.data
          });
          localStorage.removeItem('impersonate');
          navigate('/');
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    handleImpersonation();
  }, []);

  return (
    <>
      <ScreenLoader />
    </>
  );
}

export { Impersonate };
