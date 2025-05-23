import axios from 'axios';

const BASE_URL = 'http://192.168.1.104:8080';
const FACIAL_URL = 'http://192.168.1.104:5000';

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/student/login`, { email, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signup = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/student/signup`, userData);
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const vote = async (candidateId, matricNumber) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/votes`, { candidateId, matricNumber });
    return response.data;
  } catch (error) {
    console.error('Vote error:', error);
    throw error;
  }
};

export const getChatbotResponse = async (message) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/chatbot/message`, { message });
    return response.data;
  } catch (error) {
    console.error('Chatbot error:', error);
    throw error;
  }
};

export const getCandidates = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/candidates`);
    return response.data;
  } catch (error) {
    console.error('Candidates error:', error);
    throw error;
  }
};

export const getElectionStatus = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/elections`);
    return response.data;
  } catch (error) {
    console.error('Election status error:', error);
    throw error;
  }
};

export const getResults = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/results`);
    return response.data;
  } catch (error) {
    console.error('Results error:', error);
    throw error;
  }
};

export const generateEmbedding = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });
    const response = await axios.post(`${FACIAL_URL}/facial/generate_embedding`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Embedding error:', error);
    throw error;
  }
};