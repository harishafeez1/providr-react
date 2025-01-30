import axios from 'axios';
import {
  DELETE_PREMISES_URL,
  GET_ALL_PREMISES_URL,
  GET_PREMISES_URL,
  GET_SINGLE_PREMISES_URL,
  UPDATE_SINGLE_PREMISES_URL
} from '../endpoints';

const createPremises = async (data: any) => {
  try {
    const response = await axios.post(GET_PREMISES_URL, data);
    return response.data;
  } catch (err) {
    console.error('Error creating premises :', err);
    throw err;
  }
};

const updatePremises = async (premisesId: string | undefined, data: any) => {
  try {
    const response = await axios.post(`${UPDATE_SINGLE_PREMISES_URL}/${premisesId}`, data);
    return response.data;
  } catch (err) {
    console.error('Error updating single premises :', err);
    throw err;
  }
};

const deletePremises = async (premisesId: string | undefined) => {
  try {
    const response = await axios.get(`${DELETE_PREMISES_URL}/${premisesId}`);
    return response.data;
  } catch (err) {
    console.error('Error deleting premises :', err);
    throw err;
  }
};

const getSinglePremises = async (premisesId: string | undefined) => {
  try {
    const response = await axios.get(`${GET_SINGLE_PREMISES_URL}/${premisesId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching single premises :', err);
    throw err;
  }
};

const getAllPremises = async (comapnyId: string | number) => {
  try {
    const response = await axios.get(`${GET_ALL_PREMISES_URL}/${comapnyId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching all premises :', err);
    throw err;
  }
};

export { createPremises, updatePremises, deletePremises, getSinglePremises, getAllPremises };
