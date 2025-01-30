import axios from 'axios';
import {
  DELETE_USER_URL,
  GET_ALL_USER_URL,
  INVITE_USER_ROLE_URL,
  UPDATE_USER_ROLE_URL
} from '../endpoints';

const fetchAllUsers = async (providerCompanyId: string | number) => {
  try {
    const response = await axios.get(`${GET_ALL_USER_URL}/${providerCompanyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

const updateUserRole = async (selectedUserId: number, data: any) => {
  try {
    const response = await axios.post(`${UPDATE_USER_ROLE_URL}/${selectedUserId}`, data);
    console.log('Updated user:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error updating user role:', err);
    throw err;
  }
};

const deleteAUser = async (selectedUserId: string | number) => {
  try {
    const response = await axios.get(`${DELETE_USER_URL}/${selectedUserId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

const inviteUser = async (selectedCompanyId: string | number, data: any) => {
  try {
    const response = await axios.post(`${INVITE_USER_ROLE_URL}/${selectedCompanyId}`, data);
    console.log('invited user:', response.data);
    return response.data;
  } catch (err) {
    console.error('Error inviting user role:', err);
    throw err;
  }
};

export { updateUserRole, fetchAllUsers, deleteAUser, inviteUser };
