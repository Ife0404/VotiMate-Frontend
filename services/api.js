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
    // First try to get userToken (for students)
    let token = await AsyncStorage.getItem("userToken");

    // If no userToken, try adminToken (for admins)
    if (!token) {
      token = await AsyncStorage.getItem("adminToken");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token added to request:", token.substring(0, 20) + "...");
    } else {
      console.log("No token found in AsyncStorage");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data, // response.data is already extracted
  (error) => {
    console.error("=== API ERROR DEBUG ===");
    console.error("Full error object:", error);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error response:", error.response);
    console.error(
      "Error request:",
      error.request ? "Request made but no response" : "No request made"
    );
    console.error("=== END DEBUG ===");

    let errorMessage = "An unexpected error occurred";
    let status = null;
    let details = {};

    if (error.response) {
      // Server responded with an error status (4xx, 5xx)
      console.log(
        "Server error response:",
        error.response.status,
        error.response.data
      );
      errorMessage =
        error.response.data?.message ||
        `Server error: ${error.response.status}`;
      status = error.response.status;
      details = error.response.data || {};
    } else if (error.request) {
      // Request was made but no response received (network issues)
      console.log("Network error - no response received");
      errorMessage =
        "Network error: Unable to reach server. Please check your connection and server status.";
      status = 0; // Network error
      details = { networkError: true };
    } else {
      // Something else happened while setting up the request
      console.log("Request setup error:", error.message);
      errorMessage = `Request error: ${error.message}`;
      details = { setupError: true };
    }

    // Throw a simplified error object
    throw {
      message: errorMessage,
      status: status,
      details: details,
      originalError: error.message,
    };
  }
);

// ✅ ALTERNATIVE APPROACH: Create separate API instances
const createApiInstance = (tokenKey) => {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
  });

  instance.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem(tokenKey);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(
          `${tokenKey} added to request:`,
          token.substring(0, 20) + "..."
        );
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response.data,
    (error) => {
      console.error("API Error Response:", error.response);
      let errorMessage = "An unexpected error occurred";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw {
        message: errorMessage,
        status: error.response?.status,
        details: error.response?.data,
      };
    }
  );

  return instance;
};

// Create separate instances for different user types
const studentApi = createApiInstance("userToken");
const adminApi = createApiInstance("adminToken");

// AUTH & USER FUNCTIONS
export const login = async (data) => {
  try {
    // Test server connectivity first
    console.log("Testing server connectivity...");
    console.log("BASE_URL:", BASE_URL);

    // Cleaned payload: only send password or faceEmbedding
    const payload = {
      matricNumber: data.matricNumber,
      faceIdAttempts: data.faceIdAttempts || 0,
    };

    if (data.password) {
      payload.password = data.password;
    } else if (data.faceEmbedding) {
      payload.faceEmbedding = data.faceEmbedding;
    }

    console.log("API Login - Sending payload:", payload);
    console.log("API Login - Request URL:", `${BASE_URL}/api/student/login`);

    const response = await api.post("/api/student/login", payload);

    console.log("API Login - Raw response:", response);
    console.log("API Login - Extracted token:", response.token);
    console.log("API Login - Auth method:", response.authenticationMethod);

    const token = response.token;
    if (!token) {
      throw {
        message: "Token not found in response",
        status: 500,
      };
    }

    // Store token and matric number in AsyncStorage
    await AsyncStorage.setItem("userToken", token);
    await AsyncStorage.setItem("matricNumber", data.matricNumber);

    return {
      token,
      authenticationMethod: response.authenticationMethod,
    };
  } catch (error) {
    console.error("API Login - Error caught:", error);

    // Enhanced error handling
    throw {
      message: error.message || "An unexpected error occurred during login",
      attempts: error.details?.attempts || data.faceIdAttempts || 0,
      status: error.status,
      networkError: error.details?.networkError || false,
      setupError: error.details?.setupError || false,
    };
  }
};

// export const login = async (data) => {
//   const payload = {
//     matricNumber: data.matricNumber,
//     faceIdAttempts: data.faceIdAttempts || 0,
//     faceEmbedding: data.faceEmbedding,
//     password: data.password,
//   };
//   const response = await api.post("/api/student/login", payload);
//   await AsyncStorage.setItem("userToken", response.token);
//   await AsyncStorage.setItem("matricNumber", data.matricNumber);
//   return response;
// };

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
    const response = await api.post("/api/student/signup", payload);
    return {
      success: true,
      data: response,
      message: "Registration successful",
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      message: error.message || "Registration failed",
      details: error.details,
    };
  }
};

export const logout = async () => {
  await AsyncStorage.multiRemove(["userToken", "matricNumber", "userData"]);
  return { success: true, message: "Logged out" };
};

// ADMIN FUNCTIONS
export const adminLogin = async (data) => {
  try {
    console.log("Admin Login - Testing server connectivity...");
    console.log("BASE_URL:", BASE_URL);

    const payload = {
      matricNumber: data.matricNumber,
      password: data.password,
    };

    console.log("Admin Login - Sending payload:", payload);
    console.log("Admin Login - Request URL:", `${BASE_URL}/api/admin/login`);

    const response = await api.post("/api/admin/login", payload);

    console.log("Admin Login - Raw response:", response);

    await AsyncStorage.setItem("adminToken", response.token);
    await AsyncStorage.setItem("adminMatricNumber", data.matricNumber);

    return response;
  } catch (error) {
    console.error("Admin Login - Error caught:", error);
    throw error; // Re-throw the enhanced error from interceptor
  }
};

export const adminRegister = async (adminData) => {
  try {
    const payload = {
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      matricNumber: adminData.matricNumber,
      department: adminData.department,
      password: adminData.password,
    };
    const response = await api.post("/api/admin/register", payload);
    return {
      success: true,
      data: response,
      message: "Admin registration successful",
    };
  } catch (error) {
    console.error("Admin register error:", error);
    return {
      success: false,
      message: error.message || "Registration failed",
      details: error.details,
    };
  }
};

export const getAdminProfile = async () => {
  try {
    const adminToken = await AsyncStorage.getItem("adminToken");
    console.log("Admin token exists:", !!adminToken);
    console.log(
      "Admin token preview:",
      adminToken ? adminToken.substring(0, 20) + "..." : "null"
    );

    if (!adminToken) {
      throw new Error("No admin token found. Please login again.");
    }

    const response = await adminApi.get("/api/admin/profile");
    console.log("Admin profile response:", response);

    const adminData = {
      firstName: response.firstName || "",
      lastName: response.lastName || "",
      matricNumber: response.matricNumber || "",
      department: response.department || "",
    };

    await AsyncStorage.setItem("adminData", JSON.stringify(adminData));

    return {
      ...adminData,
      position: "Administrator",
    };
  } catch (error) {
    console.error("Failed to fetch admin profile:", error);

    // Fallback to cached data
    const adminMatricNumber = await AsyncStorage.getItem("adminMatricNumber");
    const adminData = await AsyncStorage.getItem("adminData");

    if (adminData) {
      const parsed = JSON.parse(adminData);
      return {
        firstName: parsed.firstName || "",
        lastName: parsed.lastName || "",
        matricNumber: adminMatricNumber || parsed.matricNumber || "Unknown",
        department: parsed.department || "Unknown Department",
        position: "Administrator",
      };
    }

    throw error;
  }
};

export const updateAdminProfile = async (data) => {
  try {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      matricNumber: data.matricNumber,
      department: data.department,
    };
    const response = await adminApi.put("/api/admin/profile", payload);
    await AsyncStorage.setItem("adminData", JSON.stringify(payload));
    if (data.matricNumber) {
      await AsyncStorage.setItem("adminMatricNumber", data.matricNumber);
    }
    return {
      success: true,
      message: response.message || "Admin profile updated successfully",
      data: response,
    };
  } catch (error) {
    console.error("Failed to update admin profile:", error);
    throw {
      message: error.message || "Failed to update admin profile",
      status: error.status,
      details: error.details,
    };
  }
};

export const adminLogout = async () => {
  try {
    await adminApi.post("/api/admin/logout");
    await AsyncStorage.multiRemove([
      "adminToken",
      "adminMatricNumber",
      "adminData",
    ]);
    return { success: true, message: "Admin logged out successfully" };
  } catch (error) {
    await AsyncStorage.multiRemove([
      "adminToken",
      "adminMatricNumber",
      "adminData",
    ]);
    return { success: true, message: "Admin logged out" };
  }
};

// VOTING API FUNCTIONS
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

// export const getCandidates = async (electionId = null) => {
//   const timestamp = new Date().getTime();
//   if (electionId) {
//     return await api.get(
//       `/api/elections/${electionId}/candidates?t=${timestamp}`
//     );
//   }
//   return await api.get(`/api/candidates?t=${timestamp}`);
// };

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

export const getElectionWithCandidates = async (electionId) => {
  const timestamp = new Date().getTime();
  return await api.get(`/api/elections/${electionId}/full?t=${timestamp}`);
};

export const getAllElectionsWithCandidates = async () => {
  const timestamp = new Date().getTime();
  return await api.get(`/api/elections/full?t=${timestamp}`);
};

// FACE EMBEDDING
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

// CHATBOT
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

// PROFILE
export const getProfile = async () => {
  try {
    const response = await api.get("/api/student/profile");
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
      position: "Voter",
    };
  } catch (error) {
    console.error("Failed to fetch profile from backend:", error);
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

export const logoutFromServer = async () => {
  try {
    await api.post("/api/student/logout");
    await AsyncStorage.multiRemove(["userToken", "matricNumber", "userData"]);
    return { success: true, message: "Logged out successfully" };
  } catch (error) {
    await AsyncStorage.multiRemove(["userToken", "matricNumber", "userData"]);
    return { success: true, message: "Logged out" };
  }
};

// CANDIDATE FUNCTIONS
export const getActiveElections = async () => {
  try {
    const timestamp = new Date().getTime();
    const response = await api.get(`/api/elections?t=${timestamp}`);
    return response.filter((election) => election.status === "ACTIVE");
  } catch (error) {
    console.error("Error fetching active elections:", error);
    throw {
      message: error.message || "Failed to fetch active elections",
      status: error.status,
      details: error.details,
    };
  }
};

export const getElectionPositions = async (electionId) => {
  try {
    const timestamp = new Date().getTime();
    const response = await api.get(
      `/api/elections/${electionId}?t=${timestamp}`
    );
    return response.positions || [];
  } catch (error) {
    console.error("Error fetching election positions:", error);
    throw {
      message: error.message || "Failed to fetch election positions",
      status: error.status,
      details: error.details,
    };
  }
};

// export const createCandidate = async (candidateData) => {
//   try {
//     const formData = new FormData();

//     // Create the candidate object matching your Spring Boot DTO
//     const candidatePayload = {
//       name: `${candidateData.firstName} ${candidateData.lastName}`.trim(),
//       manifesto: candidateData.manifesto,
//       position: candidateData.position,
//       level: parseInt(candidateData.level),
//       electionName: candidateData.electionName,
//     };

//     // Append the candidate data as a JSON blob with proper content type
//     formData.append("candidate", {
//       string: JSON.stringify(candidatePayload),
//       type: "application/json",
//     });

//     // Add image if provided (React Native format)
//     if (candidateData.profileImage && candidateData.profileImage.uri) {
//       formData.append("image", {
//         uri: candidateData.profileImage.uri,
//         type: candidateData.profileImage.type || "image/jpeg",
//         name: candidateData.profileImage.fileName || "profile.jpg",
//       });
//     }

//     // Don't set Content-Type header - let the browser/RN set it automatically
//     // This ensures proper boundary is set for multipart/form-data
//     const response = await api.post("/api/candidates", formData);

//     return response;
//   } catch (error) {
//     console.error("Error creating candidate:", error);
//     throw {
//       message:
//         error.response?.data?.message ||
//         error.message ||
//         "Failed to create candidate",
//       status: error.response?.status,
//       details: error.response?.data,
//     };
//   }
// };

// Additional helper function to get candidates by election name
export const getCandidatesByElectionName = async (electionName) => {
  try {
    const response = await api.get(
      `/api/candidates/election/name/${electionName}`
    );
    return response;
  } catch (error) {
    console.error("Error fetching candidates by election name:", error);
    throw error;
  }
};

export const updateCandidate = async (candidateId, candidateData) => {
  try {
    const formData = new FormData();

    // Create the candidate object matching your Spring Boot DTO
    const candidatePayload = {
      name: `${candidateData.firstName} ${candidateData.lastName}`.trim(),
      manifesto: candidateData.manifesto || candidateData.campaignPromises,
      position: candidateData.position,
      level: parseInt(candidateData.level),
      electionName: candidateData.electionName,
    };

    formData.append("candidate", JSON.stringify(candidatePayload));

    // Add image if provided
    if (candidateData.profileImage && candidateData.profileImage.uri) {
      formData.append("image", {
        uri: candidateData.profileImage.uri,
        type: candidateData.profileImage.type || "image/jpeg",
        name: candidateData.profileImage.fileName || "profile.jpg",
      });
    }

    const response = await adminApi.put(
      `/api/candidates/${candidateId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      success: true,
      data: response,
      message: "Candidate updated successfully",
    };
  } catch (error) {
    console.error("Error updating candidate:", error);
    return {
      success: false,
      message: error.message || "Failed to update candidate",
      status: error.status,
      details: error.details,
    };
  }
};

// ELECTION MANAGEMENT FUNCTIONS
export const createElection = async (electionData) => {
  try {
    // The payload is already in the correct format from the frontend
    const payload = {
      name: electionData.name,
      startDate: electionData.startDate, // Combined date-time (e.g., "2025-06-17T09:00:00")
      endDate: electionData.endDate, // Combined date-time (e.g., "2025-06-18T17:00:00")
    };

    console.log("Creating election with payload:", payload);

    const response = await api.post("/api/elections", payload);

    return {
      success: true,
      data: response.data, // Access the actual response data
      message: "Election created successfully",
    };
  } catch (error) {
    console.error("Error creating election:", error);

    // Better error handling for axios errors
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        message: error.response.data?.message || "Failed to create election",
        details: error.response.data?.details || {},
        status: error.response.status,
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        message: "Network error. Please check your connection.",
        details: {},
        status: null,
      };
    } else {
      // Other error
      return {
        success: false,
        message: error.message || "An unexpected error occurred",
        details: {},
        status: null,
      };
    }
  }
};

export const updateElection = async (electionId, electionData) => {
  try {
    const payload = {
      name: electionData.title,
      startDate: electionData.startDate,
      endDate: electionData.endDate,
    };

    const response = await api.put(`/api/elections/${electionId}`, payload);

    return {
      success: true,
      data: response,
      message: "Election updated successfully",
    };
  } catch (error) {
    console.error("Error updating election:", error);
    return {
      success: false,
      message: error.message || "Failed to update election",
      details: error.details,
      status: error.status,
    };
  }
};

export const deleteElection = async (electionId) => {
  try {
    const response = await api.delete(`/api/elections/${electionId}`);

    return {
      success: true,
      data: response,
      message: "Election deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting election:", error);
    return {
      success: false,
      message: error.message || "Failed to delete election",
      details: error.details,
      status: error.status,
    };
  }
};

export const getElectionById = async (electionId) => {
  try {
    const timestamp = new Date().getTime();
    const response = await api.get(
      `/api/elections/${electionId}?t=${timestamp}`
    );

    return {
      success: true,
      data: response,
      message: "Election fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching election:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch election",
      details: error.details,
      status: error.status,
    };
  }
};

// Add these functions to your api.js file

// Get registered voters count
export const getRegisteredVotersCount = async () => {
  try {
    const timestamp = new Date().getTime();
    const response = await api.get(`/api/students/count?t=${timestamp}`);
    return response;
  } catch (error) {
    console.error("Error fetching registered voters count:", error);
    throw error;
  }
};

// Get all students (if you need the full list)
export const getAllStudents = async () => {
  try {
    const timestamp = new Date().getTime();
    const response = await api.get(`/api/students?t=${timestamp}`);
    return response;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

// Get detailed statistics (if your backend supports it)
export const getAdminStatistics = async () => {
  try {
    const timestamp = new Date().getTime();
    const response = await api.get(`/api/admin/statistics?t=${timestamp}`);
    return response;
  } catch (error) {
    console.error("Error fetching admin statistics:", error);
    throw error;
  }
};

// Get election statistics
export const getElectionStatistics = async (electionId = null) => {
  try {
    const timestamp = new Date().getTime();
    const url = electionId
      ? `/api/elections/${electionId}/statistics?t=${timestamp}`
      : `/api/elections/statistics?t=${timestamp}`;
    const response = await api.get(url);
    return response;
  } catch (error) {
    console.error("Error fetching election statistics:", error);
    throw error;
  }
};

// Add these updated functions to your api.js file

// CANDIDATE FUNCTIONS - Updated for better backend integration

export const deleteCandidate = async (candidateId) => {
  try {
    const response = await adminApi.delete(`/api/candidates/${candidateId}`);

    return {
      success: true,
      data: response,
      message: "Candidate deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting candidate:", error);
    return {
      success: false,
      message: error.message || "Failed to delete candidate",
      details: error.details,
      status: error.status,
    };
  }
};

// Updated getCandidates function with better error handling
export const getCandidates = async (electionId = null) => {
  try {
    const timestamp = new Date().getTime();
    let url;

    if (electionId) {
      url = `/api/candidates/election/${electionId}?t=${timestamp}`;
    } else {
      url = `/api/candidates?t=${timestamp}`;
    }

    const response = await api.get(url);

    // Transform the response to ensure consistent structure
    const candidates = Array.isArray(response) ? response : [response];

    return candidates.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      manifesto:
        candidate.manifesto ||
        candidate.campaignPromises ||
        "No manifesto provided",
      campaignPromises:
        candidate.campaignPromises ||
        candidate.manifesto ||
        "No campaign promises provided",
      electionId: candidate.electionId,
      electionName: candidate.electionName || "Unknown Election",
      profileImageUrl: candidate.profileImageUrl,
      status: candidate.status || "active",
      votesCount: candidate.votesCount || 0,
      position: candidate.position || "Unknown Position",
      level: candidate.level || 1,
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching candidates:", error);
    throw {
      message: error.message || "Failed to fetch candidates",
      status: error.status,
      details: error.details,
    };
  }
};

// Updated createCandidate function with better FormData handling
export const createCandidate = async (candidateData) => {
  try {
    const formData = new FormData();

    // Create the candidate object matching your Spring Boot DTO
    const candidatePayload = {
      name: `${candidateData.firstName} ${candidateData.lastName}`.trim(),
      manifesto: candidateData.manifesto || candidateData.campaignPromises,
      position: candidateData.position,
      level: parseInt(candidateData.level),
      electionName: candidateData.electionName,
    };

    // Append the candidate data as a JSON blob
    formData.append("candidate", JSON.stringify(candidatePayload));

    // Add image if provided (React Native format)
    if (candidateData.profileImage && candidateData.profileImage.uri) {
      formData.append("image", {
        uri: candidateData.profileImage.uri,
        type: candidateData.profileImage.type || "image/jpeg",
        name: candidateData.profileImage.fileName || "profile.jpg",
      });
    }

    const response = await adminApi.post("/api/candidates", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      success: true,
      data: response,
      message: "Candidate created successfully",
    };
  } catch (error) {
    console.error("Error creating candidate:", error);
    return {
      success: false,
      message: error.message || "Failed to create candidate",
      status: error.status,
      details: error.details,
    };
  }
};

// Get candidate by ID
export const getCandidateById = async (candidateId) => {
  try {
    const timestamp = new Date().getTime();
    const response = await api.get(
      `/api/candidates/${candidateId}?t=${timestamp}`
    );

    return {
      success: true,
      data: response,
      message: "Candidate fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching candidate:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch candidate",
      status: error.status,
      details: error.details,
    };
  }
};
