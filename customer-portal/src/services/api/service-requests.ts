import axios from 'axios';
import { GET_CONNECT_PROVIDER_URL, GET_SERVICE_REQUEST_STORE_URL, GET_SERVICE_REQUEST_URL, GET_SERVICE_REQUEST_VIEW_URL } from '../endpoints';
import { setServiceRequest } from '@/redux/slices/service-request-slice';
import { store } from '@/redux/store';

const getServiceRequests = async (params: any) => {
  try {
    const response = await axios.get(`${GET_SERVICE_REQUEST_URL}?${params}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching Service Requests:', err);
    throw err;
  }
};

const getSingleServiceRequests = async (requestId: any) => {
  try {
    const response = await axios.get(`${GET_SERVICE_REQUEST_VIEW_URL}/${requestId}`);
    store.dispatch(
      setServiceRequest(response.data)
    )
    return response.data;
  } catch (err) {
    console.error('Error fetching Single Service Requests:', err);
    throw err;
  }
};

const getConnectedProvider = async (providerId: any, requestId: any) => {
  try {
    const response = await axios.post(`${GET_CONNECT_PROVIDER_URL}/${providerId}`,{request_id:requestId});
    return response.data;
  } catch (err) {
    console.error('Error Posting single connected provider:', err);
    throw err;
  }
};

const getStoreRequest = async (data:any) => {
  try {
    const response = await axios.post(GET_SERVICE_REQUEST_STORE_URL, data);
    return response.data;
  } catch (err) {
    console.error('Error Posting request wizard data:', err);
    throw err;
  }
};

export { getServiceRequests, getSingleServiceRequests, getConnectedProvider, getStoreRequest };
