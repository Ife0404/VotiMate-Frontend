import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

const BASE_URL = "http://192.168.1.104:8080";
const FACIAL_URL = "http://192.168.1.104:5000";

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

export const login = async (data) => {
  try {
    const payload = {
      matricNumber: data.matricNumber,
      faceIdAttempts: data.faceIdAttempts || 0,
      faceEmbedding: data.faceEmbedding,
      password: data.password,
    };
    const response = await api.post("/api/student/login", payload, {
      headers: { "Content-Type": "application/json" },
    });
    await AsyncStorage.setItem("userToken", response.token);
    await AsyncStorage.setItem("matricNumber", data.matricNumber);
    return response;
  } catch (error) {
    throw error;
  }
};

export const signup = async (userData) => {
  try {
    const payload = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      matricNumber: userData.matricNumber,
      department: userData.department,
      password: userData.password,
      faceEmbedding: userData.faceEmbedding,
    };
    const response = await api.post("/api/student/signup", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const getValidImageFile = async (uri) => {
  if (!uri || typeof uri !== "string") {
    console.log("Invalid photo URI: not a string or null");
    return null;
  }
  if (!uri.startsWith("file://")) {
    console.log("Invalid photo URI: does not start with file://", uri);
    return null;
  }

  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) {
    console.log("Photo file does not exist:", uri);
    return null;
  }

  console.log("Valid photo file:", uri);
  return {
    uri,
    type: "image/jpeg",
    name: uri.split("/").pop() || "photo.jpg",
  };
};

export const vote = async (candidateId, matricNumber) => {
  try {
    const response = await api.post("/api/votes", {
      candidateId,
      matricNumber,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const getChatbotResponse = async (message) => {
  try {
    // Get the user's matric number from storage
    const matricNumber = await AsyncStorage.getItem("matricNumber");

    if (!matricNumber) {
      throw new Error("User not logged in");
    }

    const response = await api.post(
      "/api/chatbot/message",
      { message },
      {
        headers: {
          "user-id": matricNumber, // Add the required user-id header
        },
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const getCandidates = async () => {
  try {
    const response = await api.get("/api/candidates");
    return response;
  } catch (error) {
    throw error;
  }
};

export const getElectionStatus = async () => {
  try {
    const response = await api.get("/api/elections");
    return response;
  } catch (error) {
    throw error;
  }
};

export const getResults = async () => {
  try {
    const response = await api.get("/api/results");
    return response;
  } catch (error) {
    throw error;
  }
};

export const generateEmbedding = async (imageUri) => {
  try {
    if (!imageUri || typeof imageUri !== "string") {
      throw new Error("Invalid image data");
    }

    const base64Data = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log("Sending base64 data length:", base64Data.length);

    const response = await axios.post(
      `${FACIAL_URL}/generate_embedding_webcam`,
      { image_data: base64Data },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      }
    );

    console.log("Raw embedding response:", JSON.stringify(response.data));
    if (!response.data.embedding || !Array.isArray(response.data.embedding)) {
      throw new Error(
        "No valid embedding data received: " + JSON.stringify(response.data)
      );
    }

    return response.data;
  } catch (error) {
    console.error("Embedding generation error:", {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    throw {
      embedding: null,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to generate embedding",
    };
  }
};

export const getProfile = async () => {
  try {
    const matricNumber = await AsyncStorage.getItem("matricNumber");
    const userData = await AsyncStorage.getItem("userData");

    if (userData) {
      const parsedData = JSON.parse(userData);
      return {
        name:
          `${parsedData.firstName || ""} ${parsedData.lastName || ""}`.trim() ||
          "Student",
        matricNumber: matricNumber || parsedData.matricNumber || "Unknown",
        department: parsedData.department || "Unknown Department",
        position: "Voter",
      };
    }

    return {
      name: "Student",
      matricNumber: matricNumber || "Unknown",
      department: "Unknown Department",
      position: "Voter",
    };
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (data) => {
  try {
    await AsyncStorage.setItem("userData", JSON.stringify(data));
    return { success: true, message: "Profile updated" };
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("matricNumber");
    await AsyncStorage.removeItem("userData");
    return { success: true, message: "Logged out" };
  } catch (error) {
    throw error;
  }
};
