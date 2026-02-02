import '@/components/keenicons/assets/styles.css';
import './styles/globals.css';
import '@fontsource/montserrat';

import axios from 'axios';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { setupAxios } from './auth';
import { ProvidersWrapper } from './providers';
import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store } from './redux/store';
import { Provider } from 'react-redux';

/**
 * Inject interceptors for axios.
 *
 * @see https://github.com/axios/axios#interceptors
 */
setupAxios(axios);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
const googleClientId = import.meta.env.VITE_APP_GOOGLE_CLIENT_ID || 'placeholder';

root.render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <Provider store={store}>
      {/* <React.StrictMode> */}
      <ProvidersWrapper>
        <App />
      </ProvidersWrapper>
      {/* </React.StrictMode> */}
    </Provider>
  </GoogleOAuthProvider>
);
