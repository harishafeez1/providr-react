import axios from 'axios';
import {
  GET_ALL_SERVICE_OFFERING_URL,
  GET_ALL_SERVICES_URL,
  GET_DELETE_SERVICE_OFFERING_URL,
  GET_SINGLE_SERVICE_OFFERING_URL,
  GET_UPDATE_SERVICE_OFFERING_URL,
  SERVICE_OFFERING_ACT_DEACTIVATE_URL
} from '../endpoints';

const updateServiceOfferings = async (ServiceOfferingsId: string | undefined, data: any) => {
  try {
    const response = await axios.post(
      `${GET_UPDATE_SERVICE_OFFERING_URL}/${ServiceOfferingsId}`,
      data
    );
    return response.data;
  } catch (err) {
    console.error('Error updating single ServiceOfferings :', err);
    throw err;
  }
};

const deleteServiceOfferings = async (ServiceOfferingsId: string | undefined) => {
  try {
    const response = await axios.get(`${GET_DELETE_SERVICE_OFFERING_URL}/${ServiceOfferingsId}`);
    return response.data;
  } catch (err) {
    console.error('Error deleting ServiceOfferings  :', err);
    throw err;
  }
};

const getAllServiceOfferings = async (comapnyId: string | number) => {
  try {
    const response = await axios.get(`${GET_ALL_SERVICE_OFFERING_URL}/${comapnyId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching all service offerings :', err);
    throw err;
  }
};

const getSingleServiceOfferings = async (ServiceOfferingsId: string | undefined) => {
  try {
    const response = await axios.get(`${GET_SINGLE_SERVICE_OFFERING_URL}/${ServiceOfferingsId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching single ServiceOfferings :', err);
    throw err;
  }
};

const activeDeactiveServiceOffering = async (ServiceOfferingsId: string | undefined, status: number) => {
  try {
    const response = await axios.get(`${SERVICE_OFFERING_ACT_DEACTIVATE_URL}/${ServiceOfferingsId}/${status}`);
    return response.data;
  } catch (err) {
    console.error('Error updating ServiceOfferings :', err);
    throw err;
  }
};

const getAllServices = async () => {
  try {
    const response = await axios.get(`${GET_ALL_SERVICES_URL}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching all services :', err);
    throw err;
  }
};

export {
  getAllServices,
  deleteServiceOfferings,
  updateServiceOfferings,
  getAllServiceOfferings,
  getSingleServiceOfferings,
  activeDeactiveServiceOffering
};
