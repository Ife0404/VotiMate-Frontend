import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Camera, CameraView } from "expo-camera";
import * as api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const [matricNumber, setMatricNumber] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cameraRef, setCameraRef] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialView, setInitialView] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    checkExistingUser();
  }, []);

  const checkExistingUser = async () => {
    try {
      const storedMatricNumber = await AsyncStorage.getItem("matricNumber");
      if (storedMatricNumber) {
        setMatricNumber(storedMatricNumber); // Pre-fill matric number
      }
      setInitialView(true); // Always show initial login options
    } catch (error) {
      console.error("Error checking existing user:", error);
      setInitialView(true); // Fallback to initial view on error
    }
  };

  const handleFaceLoginOption = async () => {
    if (!matricNumber.trim()) {
      Alert.alert("Error", "Please enter your matric number first.");
      return;
    }

    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");

    if (status === "granted") {
      setShowCamera(true);
      setInitialView(false);
      setFailedAttempts(0);
    } else {
      Alert.alert(
        "Camera Permission Required",
        "Please enable camera permission for face login."
      );
    }
  };

  const handleSingleCapture = async () => {
    if (cameraRef && !isCapturing) {
      setIsCapturing(true);
      setLoading(true);

      try {
        const photo = await cameraRef.takePictureAsync({
          quality: 0.7,
          base64: false,
        });

        console.log("Photo captured:", photo.uri);

        const embeddingResponse = await api.generateEmbedding(photo.uri);
        console.log("Embedding response:", embeddingResponse);

        if (
          embeddingResponse &&
          embeddingResponse.embedding &&
          Array.isArray(embeddingResponse.embedding)
        ) {
          const faceEmbedding = embeddingResponse.embedding;

          if (faceEmbedding.length === 0) {
            throw new Error("Empty face embedding data received");
          }

          console.log("Face embedding length:", faceEmbedding.length);

          const loginData = {
            matricNumber: matricNumber.trim(),
            faceEmbedding: faceEmbedding,
            faceIdAttempts: failedAttempts,
          };

          console.log("Attempting face login with data:", {
            matricNumber: loginData.matricNumber,
            faceIdAttempts: loginData.faceIdAttempts,
            embeddingLength: loginData.faceEmbedding.length,
          });

          // Call the API and handle the response
          const loginResponse = await api.login(loginData);
          console.log("Login response received:", loginResponse);

          // Check if we got a valid response
          if (loginResponse && loginResponse.token) {
            console.log("Login successful, storing token");
            await AsyncStorage.setItem("matricNumber", matricNumber.trim());
            await AsyncStorage.setItem("userToken", loginResponse.token);

            Alert.alert("Success", "Face login successful!", [
              {
                text: "OK",
                onPress: () => navigation.replace("Main", { screen: "Home" }),
              },
            ]);
          } else {
            console.log("Login failed - no token in response");
            handleFailedRecognition();
          }
        } else {
          console.error("Invalid embedding response:", embeddingResponse);
          Alert.alert(
            "Face Recognition Failed",
            "Failed to process your face data. Please try again.",
            [
              { text: "Try Again", onPress: () => {} },
              {
                text: "Use Password",
                onPress: () => {
                  setShowCamera(false);
                  setShowPasswordLogin(true);
                },
                style: "cancel",
              },
            ]
          );
        }
      } catch (error) {
        console.error("Face login error:", error);

        // Handle different types of errors
        if (error && typeof error === "object" && error.message) {
          // This is our structured error
          const errorMessage = error.message;
          const attempts = error.attempts || failedAttempts;

          console.log(
            "Structured error - message:",
            errorMessage,
            "attempts:",
            attempts
          );

          // Update attempts if provided
          if (
            error.attempts !== undefined &&
            error.attempts !== failedAttempts
          ) {
            setFailedAttempts(error.attempts);
          }

          // Check if we should fallback to password
          if (attempts >= 3) {
            setShowCamera(false);
            setShowPasswordLogin(true);
            Alert.alert(
              "Face Recognition Failed",
              "Face recognition failed after 3 attempts. Please use your password to login.",
              [{ text: "OK" }]
            );
          } else {
            Alert.alert("Face Login Failed", errorMessage, [
              {
                text: "Try Again",
                onPress: () => {
                  // Don't increment attempts here, let the next attempt handle it
                },
              },
              {
                text: "Use Password",
                onPress: () => {
                  setShowCamera(false);
                  setShowPasswordLogin(true);
                },
                style: "cancel",
              },
            ]);
          }
        } else {
          // Handle unexpected errors
          console.error("Unexpected error type:", typeof error, error);
          handleFailedRecognition();
        }
      } finally {
        setLoading(false);
        setIsCapturing(false);
      }
    }
  };


  // const handleFailedRecognition = () => {
  //   const newFailedAttempts = failedAttempts + 1;
  //   setFailedAttempts(newFailedAttempts);

  //   if (newFailedAttempts >= 3) {
  //     setShowCamera(false);
  //     setShowPasswordLogin(true);

  //     Alert.alert(
  //       "Face Recognition Failed",
  //       "Face recognition failed after 3 attempts. Please use your password to login.",
  //       [{ text: "OK" }]
  //     );
  //   } else {
  //     Alert.alert(
  //       "Recognition Failed",
  //       `Face not recognized. ${3 - newFailedAttempts} attempt${
  //         3 - newFailedAttempts === 1 ? "" : "s"
  //       } remaining.`,
  //       [
  //         {
  //           text: "Try Again",
  //           onPress: () => {}, // Stay on camera screen
  //         },
  //         {
  //           text: "Use Password",
  //           onPress: () => {
  //             setShowCamera(false);
  //             setShowPasswordLogin(true);
  //           },
  //         },
  //       ]
  //     );
  //   }
  // };

  const handleFailedRecognition = () => {
    const newFailedAttempts = failedAttempts + 1;
    setFailedAttempts(newFailedAttempts);

    if (newFailedAttempts >= 3) {
      setShowCamera(false);
      setShowPasswordLogin(true);

      Alert.alert(
        "Face Recognition Failed",
        "Face recognition failed after 3 attempts. Please use your password to login.",
        [{ text: "OK" }]
      );
    } else {
      Alert.alert(
        "Recognition Failed",
        `Face not recognized. ${3 - newFailedAttempts} attempt${
          3 - newFailedAttempts === 1 ? "" : "s"
        } remaining.`,
        [
          {
            text: "Try Again",
            onPress: () => {
              // Reset capture state for retry
              setIsCapturing(false);
              setLoading(false);
            },
          },
          {
            text: "Use Password",
            onPress: () => {
              setShowCamera(false);
              setShowPasswordLogin(true);
            },
          },
        ]
      );
    }
  };

  const handlePasswordLogin = async () => {
    if (!matricNumber.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both matric number and password.");
      return;
    }

    setLoading(true);
    try {
      // FIXED: Include faceIdAttempts for password fallback
      const loginResponse = await api.login({
        matricNumber: matricNumber.trim(),
        password: password.trim(),
        faceIdAttempts: failedAttempts >= 3 ? failedAttempts : 3, // Ensure it's >= 3 for password fallback
      });

      // FIXED: Handle new response structure
      if (loginResponse.token) {
        await AsyncStorage.setItem("matricNumber", matricNumber.trim());
        await AsyncStorage.setItem("userToken", loginResponse.token);

        Alert.alert("Success", "Login successful!", [
          {
            text: "OK",
            onPress: () => navigation.replace("Main", { screen: "Home" }),
          },
        ]);
      } else {
        Alert.alert(
          "Login Failed",
          "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.error("Password login error:", error);

      // FIXED: Handle structured error response
      const errorMessage = error.message || "Login failed. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowCamera(false);
    setShowPasswordLogin(false);
    setInitialView(true);
    setFailedAttempts(0);
    setPassword("");
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="front"
          ref={(ref) => setCameraRef(ref)}
        />
        <View style={styles.cameraOverlay}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackToLogin}
              disabled={isCapturing}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.cameraHeaderText}>Face Login</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.cameraCenterContent}>
            <View style={styles.faceFrame}>
              <View style={styles.faceFrameCorner} />
            </View>

            <Text style={styles.instructionText}>
              Position your face within the frame{"\n"}
              Look directly at the camera
            </Text>

            {failedAttempts > 0 && (
              <Text style={styles.attemptsText}>
                Failed attempts: {failedAttempts}/3
              </Text>
            )}

            <Text style={styles.hintText}>Secure face recognition login</Text>
          </View>

          <View style={styles.cameraFooter}>
            {loading || isCapturing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Processing face data...</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleSingleCapture}
                disabled={isCapturing}
              >
                <View style={styles.captureButtonInner}>
                  <Ionicons name="scan" size={30} color="#fff" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  if (showPasswordLogin) {
    return (
      <View style={styles.container}>
        <View style={styles.passwordHeader}>
          <TouchableOpacity
            style={styles.backButtonRow}
            onPress={handleBackToLogin}
            disabled={loading}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContent}>
          <Text style={styles.title}>Login with Password</Text>
          <Text style={styles.subtitle}>
            {failedAttempts >= 3
              ? "Face recognition failed. Please use your password."
              : "Enter your password to continue."}
          </Text>

          <TextInput
            placeholder="Matric Number"
            style={styles.input}
            value={matricNumber}
            onChangeText={setMatricNumber}
            editable={!loading}
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={hidePassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setHidePassword(!hidePassword)}
            >
              <Ionicons
                name={hidePassword ? "eye-off" : "eye"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handlePasswordLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (initialView) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Enter your matric number"
            style={styles.input}
            value={matricNumber}
            onChangeText={setMatricNumber}
            editable={!loading}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, styles.faceLoginButton]}
            onPress={handleFaceLoginOption}
            disabled={loading || !matricNumber.trim()}
          >
            <Ionicons
              name="scan"
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonText}>Login with Face</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.passwordLoginButton]}
            onPress={() => {
              setShowPasswordLogin(true);
              setInitialView(false);
            }}
            disabled={loading}
          >
            <Ionicons
              name="lock-closed"
              size={20}
              color="#6C4EF2"
              style={styles.buttonIcon}
            />
            <Text style={[styles.buttonText, { color: "#6C4EF2" }]}>
              Login with Password
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => navigation.navigate("Register")}
          disabled={loading}
        >
          <Text style={styles.createAccountText}>Create New Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#6C4EF2" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14104D",
    paddingHorizontal: 24,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#14104D",
  },

  header: {
    alignItems: "center",
    marginTop: 80,
    marginBottom: 40,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#B8B8B8",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginVertical: 8,
  },
  button: {
    backgroundColor: "#6C4EF2",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  faceLoginButton: {
    backgroundColor: "#6C4EF2",
    marginTop: 20,
  },
  passwordLoginButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#6C4EF2",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },
  dividerText: {
    color: "#666",
    paddingHorizontal: 20,
    fontSize: 14,
  },
  createAccountButton: {
    marginTop: 10,
    marginBottom: 40,
    borderWidth: 2,
    borderColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  createAccountText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  passwordHeader: {
    paddingTop: 60,
    marginBottom: 20,
  },
  backButtonRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
  },
  passwordContent: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 100,
  },
  passwordContainer: {
    position: "relative",
    marginVertical: 8,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: "absolute",
    right: 15,
    top: 24,
  },

  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  cameraHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 12,
    borderRadius: 25,
  },
  cameraHeaderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  cameraCenterContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  faceFrame: {
    width: 250,
    height: 300,
    borderRadius: 125,
    borderWidth: 3,
    borderColor: "#6C4EF2",
    marginBottom: 30,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  faceFrameCorner: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: "rgba(108, 78, 242, 0.3)",
  },
  instructionText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 22,
  },
  attemptsText: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 10,
  },
  hintText: {
    color: "#B8B8B8",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  cameraFooter: {
    paddingBottom: 80,
    alignItems: "center",
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(108, 78, 242, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6C4EF2",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoginScreen;
