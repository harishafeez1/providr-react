import axios from 'axios';
import { GET_DOCUMENTS_URL, UPLOAD_DOCUMENTS_URL } from '../endpoints';

const getDocuments = async (params: any) => {
  try {
    const response = await axios.get(`${GET_DOCUMENTS_URL}?${params}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching documents:', err);
    throw err;
  }
};

const uploadDocument = async (data: any) => {
  try {
    const response = await axios.post(`${UPLOAD_DOCUMENTS_URL}`, data);
    return response.data;
  } catch (err) {
    console.error('Error uploading documents:', err);
    throw err;
  }
};

export { getDocuments, uploadDocument };
