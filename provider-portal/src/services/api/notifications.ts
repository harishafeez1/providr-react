import axios from 'axios';
import { GET_NOTIFICATIONS_URL, UPDATE_NOTIFICATIONS_URL } from '../endpoints';

const getAllNotifications = async (providerCompanyId: any) => {
  try {
    const response = await axios.get(`${GET_NOTIFICATIONS_URL}/provider/${providerCompanyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all Notifications:', error);
    throw error;
  }
};

const updateNotificationsSetting = async (providerCompanyId: any, data: any) => {
  try {
    const response = await axios.post(
      `${UPDATE_NOTIFICATIONS_URL}/provider/${providerCompanyId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching all Notifications:', error);
    throw error;
  }
};

export { getAllNotifications, updateNotificationsSetting };
