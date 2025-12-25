import axios from 'axios';
import {
  GET_PARTICIPANTS_URL,
  UPDATE_SINGLE_PARTICIPANT_URL,
  DELETE_PARTICIPANT_URL,
  GET_SINGLE_PARTICIPANT_URL,
  GET_ALL_PARTICIPANTS_URL
} from '../endpoints';

const createParticipant = async (data: any) => {
  const response = await axios.post(GET_PARTICIPANTS_URL, data);
  return response.data;
};

const updateParticipant = async (participantId: string | undefined, data: any) => {
  const response = await axios.put(`${UPDATE_SINGLE_PARTICIPANT_URL}/${participantId}`, data);
  return response.data;
};

const deleteParticipant = async (participantId: string | undefined) => {
  const response = await axios.delete(`${DELETE_PARTICIPANT_URL}/${participantId}`);
  return response.data;
};

const getSingleParticipant = async (participantId: string | undefined) => {
  const response = await axios.get(`${GET_SINGLE_PARTICIPANT_URL}/${participantId}`);
  return response.data;
};

const getAllParticipants = async (queryString: string) => {
  const response = await axios.get(`${GET_ALL_PARTICIPANTS_URL}?${queryString}`);
  return response.data;
};

export { createParticipant, updateParticipant, deleteParticipant, getSingleParticipant, getAllParticipants };
