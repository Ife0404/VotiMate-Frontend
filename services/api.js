import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

const BASE_URL = "http://192.168.1.104:8080";
const FACIAL_URL = "http://192.168.1.104:5000";

// Axios instance with token handling
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error.response?.status, error.message);
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Network error";
    throw {
      message: errorMessage,
      status: error.response?.status,
      details: error.response?.data,
    };
  }
);

//////////////////////////
// AUTH & USER FUNCTIONS
//////////////////////////

export const login = async (data) => {
  const payload = {
    matricNumber: data.matricNumber,
    faceIdAttempts: data.faceIdAttempts || 0,
    faceEmbedding: data.faceEmbedding,
    password: data.password,
  };
  const response = await api.post("/api/student/login", payload);
  await AsyncStorage.setItem("userToken", response.token);
  await AsyncStorage.setItem("matricNumber", data.matricNumber);
  return response;
};

export const signup = async (userData) => {
  const payload = {
    firstName: userData.firstName,
    lastName: userData.lastName,
    matricNumber: userData.matricNumber,
    department: userData.department,
    password: userData.password,
    faceEmbedding: userData.faceEmbedding,
  };
  return await api.post("/api/student/signup", payload);
};

export const logout = async () => {
  await AsyncStorage.multiRemove(["userToken", "matricNumber", "userData"]);
  return { success: true, message: "Logged out" };
};

//////////////////////////
// VOTING API FUNCTIONS
//////////////////////////

export const vote = async (candidateId, matricNumber, electionId) => {
  return await api.post("/api/votes", {
    candidateId,
    matricNumber,
    electionId,
  });
};

export const getElections = async () => {
  const timestamp = new Date().getTime();
  return await api.get(`/api/elections?t=${timestamp}`);
};

export const getCandidates = async (electionId = null) => {
  const timestamp = new Date().getTime();
  if (electionId) {
    return await api.get(
      `/api/elections/${electionId}/candidates?t=${timestamp}`
    );
  }
  return await api.get(`/api/candidates?t=${timestamp}`);
};

export const getCandidateDetails = async (candidateId) => {
  const timestamp = new Date().getTime();
  return await api.get(`/api/candidates/${candidateId}?t=${timestamp}`);
};

export const getElectionStatus = async (electionId = null) => {
  const timestamp = new Date().getTime();
  if (electionId) {
    return await api.get(`/api/elections/${electionId}?t=${timestamp}`);
  }
  return await api.get(`/api/elections?t=${timestamp}`);
};

export const getResults = async (electionId) => {
  const timestamp = new Date().getTime();
  if (electionId) {
    return await api.get(`/api/results/${electionId}?t=${timestamp}`);
  }
  return await api.get(`/api/results?t=${timestamp}`);
};

export const getResultsByElection = async (electionId) => {
  const timestamp = new Date().getTime();
  return await api.get(`/api/results/${electionId}?t=${timestamp}`);
};

export const getVotingStatus = async () => {
  const timestamp = new Date().getTime();
  return await api.get(`/api/voting/status?t=${timestamp}`);
};

export const getVotingHistory = async (voterId) => {
  const timestamp = new Date().getTime();
  return await api.get(`/api/voting/history/${voterId}?t=${timestamp}`);
};

// New function to get election with candidates
export const getElectionWithCandidates = async (electionId) => {
  const timestamp = new Date().getTime();
  return await api.get(`/api/elections/${electionId}/full?t=${timestamp}`);
};

// New function to get all elections with their candidates
export const getAllElectionsWithCandidates = async () => {
  const timestamp = new Date().getTime();
  return await api.get(`/api/elections/full?t=${timestamp}`);
};

//////////////////////////
// FACE EMBEDDING
//////////////////////////

export const generateEmbedding = async (imageUri) => {
  const base64Data = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const response = await axios.post(
    `${FACIAL_URL}/generate_embedding_webcam`,
    { image_data: base64Data },
    { headers: { "Content-Type": "application/json" }, timeout: 15000 }
  );

  if (!response.data.embedding || !Array.isArray(response.data.embedding)) {
    throw new Error("Invalid embedding data received");
  }

  return response.data;
};

//////////////////////////
// CHATBOT
//////////////////////////

export const getChatbotResponse = async (message) => {
  const matricNumber = await AsyncStorage.getItem("matricNumber");
  if (!matricNumber) throw new Error("User not logged in");

  return await api.post(
    "/api/chatbot/message",
    { message },
    {
      headers: { "user-id": matricNumber },
    }
  );
};

//////////////////////////
// PROFILE
//////////////////////////

export const getProfile = async () => {
  try {
    const response = await api.get("/api/student/profile");

    // Store the updated user data in AsyncStorage for offline access
    const userData = {
      firstName: response.firstName,
      lastName: response.lastName,
      matricNumber: response.matricNumber,
      department: response.department,
    };
    await AsyncStorage.setItem("userData", JSON.stringify(userData));

    return {
      firstName: response.firstName,
      lastName: response.lastName,
      matricNumber: response.matricNumber,
      department: response.department,
      position: "Voter", // Static for now
    };
  } catch (error) {
    console.error("Failed to fetch profile from backend:", error);

    // Fallback to AsyncStorage if backend fails
    const matricNumber = await AsyncStorage.getItem("matricNumber");
    const userData = await AsyncStorage.getItem("userData");

    if (userData) {
      const parsed = JSON.parse(userData);
      return {
        firstName: parsed.firstName || "",
        lastName: parsed.lastName || "",
        matricNumber: matricNumber || parsed.matricNumber || "Unknown",
        department: parsed.department || "Unknown Department",
        position: "Voter",
      };
    }

    return {
      firstName: "Student",
      lastName: "",
      matricNumber: matricNumber || "Unknown",
      department: "Unknown Department",
      position: "Voter",
    };
  }
};

export const updateProfile = async (data) => {
  try {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      matricNumber: data.matricNumber,
      department: data.department,
    };

    const response = await api.put("/api/student/profile", payload);

    // Update AsyncStorage with new data
    await AsyncStorage.setItem("userData", JSON.stringify(payload));

    // Update matricNumber in AsyncStorage if it changed
    if (data.matricNumber) {
      await AsyncStorage.setItem("matricNumber", data.matricNumber);
    }

    return {
      success: true,
      message: response.message || "Profile updated successfully",
      data: response,
    };
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw {
      message: error.message || "Failed to update profile",
      status: error.status,
      details: error.details,
    };
  }
};

// Add a logout API call (optional - since JWT is stateless)
export const logoutFromServer = async () => {
  try {
    await api.post("/api/student/logout");
    await AsyncStorage.multiRemove(["userToken", "matricNumber", "userData"]);
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    // Even if server logout fails, clear local storage
    await AsyncStorage.multiRemove(["userToken", "matricNumber", "userData"]);
    return { success: true, message: "Logged out" };
  }
};