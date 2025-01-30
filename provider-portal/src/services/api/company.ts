import axios from 'axios';
import { DELETE_COMPANY_PHOTO_GALLERY_URL, UPDATE_COMPANY_PROFILE_URL } from '../endpoints';

const updateCompanyProfile = async (selectedUserId: number, data: any) => {
  try {
    const response = await axios.post(`${UPDATE_COMPANY_PROFILE_URL}/${selectedUserId}`, data);
    return response.data;
  } catch (err) {
    console.error('Error updating comapny profile:', err);
    throw err;
  }
};

const deleteGalleryPhoto = async (companyId: any, data: any) => {
  try {
    if (companyId) {
      const response = await axios.post(`${DELETE_COMPANY_PHOTO_GALLERY_URL}/${companyId}`, {
        photo_gallery_delete: data
      });
      return response.data;
    } else {
      throw new Error('company id is undefined');
    }
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};

export { updateCompanyProfile, deleteGalleryPhoto };
