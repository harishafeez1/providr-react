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
    // const logoutUser = async () => {
    //   if (!logout) {
    //     console.error('Impersonate: logout function is null');
    //     return;
    //   }

    //   try {
    //     await logout();
    //   } catch (error) {
    //     console.error('Impersonate: error logging out', error);
    //   } finally {
    //     removeAuth();
    //   }
    // };

    // if (auth?.token) {
    //   logoutUser();
    // }
    if (token && user_id) {
      saveAuth({
        token,
        user: {
          id: Number(user_id)
        }
      });
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios
        .get(`${GET_USER_URL}/${user_id}`)
        .then((response) => {
          setCurrentUser(response.data);
        })
        .then(() => {
          setTimeout(() => {
            navigate('/');
          }, 5000);
        });
    }
  }, []);

  return (
    <>
      <ScreenLoader />
    </>
  );
}

export { Impersonate };
