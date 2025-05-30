import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Camera, CameraView } from "expo-camera";
import * as api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert("Error", "Please enter your first name.");
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert("Error", "Please enter your last name.");
      return false;
    }
    if (!matricNumber.trim()) {
      Alert.alert("Error", "Please enter your matric number.");
      return false;
    }
    if (!department.trim()) {
      Alert.alert("Error", "Please enter your department.");
      return false;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Please enter a password.");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    if (hasPermission === null) {
      await requestCameraPermission();
      return;
    }

    if (hasPermission === false) {
      Alert.alert(
        "Camera Permission Required",
        "Please enable camera permission to capture your face for registration.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Settings",
            onPress: () => {
              Alert.alert(
                "Info",
                "Please enable camera permission in your device settings."
              );
            },
          },
        ]
      );
      return;
    }

    setShowCamera(true);
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

        console.log("Photo captured successfully:", photo.uri);

        const embeddingResponse = await api.generateEmbedding(photo.uri);

        console.log("Embedding response:", embeddingResponse);

        if (
          embeddingResponse &&
          embeddingResponse.embedding &&
          Array.isArray(embeddingResponse.embedding) &&
          embeddingResponse.embedding.length === 128
        ) {
          const faceEmbedding = embeddingResponse.embedding;

          const userData = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            matricNumber: matricNumber.trim(),
            department: department.trim(),
            password: password.trim(),
            faceEmbedding: faceEmbedding,
          };

          const registerResponse = await api.signup(userData);

          if (registerResponse.success) {
            await AsyncStorage.setItem("matricNumber", matricNumber.trim());

            Alert.alert(
              "Registration Successful!",
              "Your account has been created successfully. You can now login with your face or password.",
              [
                {
                  text: "Login Now",
                  onPress: () => navigation.navigate("Login"),
                },
              ]
            );
          } else {
            Alert.alert(
              "Registration Failed",
              registerResponse.message ||
                "Failed to create account. Please try again."
            );
          }
        } else {
          throw new Error(
            "Invalid embedding data received: " +
              JSON.stringify(embeddingResponse)
          );
        }
      } catch (error) {
        console.error("Registration error details:", error);
        Alert.alert(
          "Registration Failed",
          error.message ||
            "Something went wrong during face capture. Please try again. Check console for details.",
          [
            { text: "Try Again", onPress: () => {} },
            {
              text: "Cancel",
              onPress: () => setShowCamera(false),
              style: "cancel",
            },
          ]
        );
      } finally {
        setLoading(false);
        setIsCapturing(false);
      }
    }
  };

  const handleBackFromCamera = () => {
    setShowCamera(false);
    setIsCapturing(false);
    setLoading(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C4EF2" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="front"
          ref={(ref) => setCameraRef(ref)}
        >
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackFromCamera}
                disabled={isCapturing}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.cameraHeaderText}>Face Registration</Text>
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

              <Text style={styles.hintText}>
                This will be used for secure login
              </Text>
            </View>

            <View style={styles.cameraFooter}>
              {loading || isCapturing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.loadingText}>
                    Processing face data...
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={handleSingleCapture}
                  disabled={isCapturing}
                >
                  <View style={styles.captureButtonInner}>
                    <Ionicons name="camera" size={30} color="#fff" />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonRow}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Fill in your details to get started</Text>

        <View style={styles.inputGroup}>
          <TextInput
            placeholder="First Name"
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            editable={!loading}
            autoCapitalize="words"
          />

          <TextInput
            placeholder="Last Name"
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            editable={!loading}
            autoCapitalize="words"
          />

          <TextInput
            placeholder="Matric Number"
            style={styles.input}
            value={matricNumber}
            onChangeText={setMatricNumber}
            editable={!loading}
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Department"
            style={styles.input}
            value={department}
            onChangeText={setDepartment}
            editable={!loading}
            autoCapitalize="words"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password (minimum 6 characters)"
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

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Confirm Password"
              style={[styles.input, styles.passwordInput]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={hideConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setHideConfirmPassword(!hideConfirmPassword)}
            >
              <Ionicons
                name={hideConfirmPassword ? "eye-off" : "eye"}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons
                name="camera"
                size={20}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Continue to Face Capture</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14104D",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#14104D",
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
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
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#B8B8B8",
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 30,
  },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginVertical: 8,
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
  button: {
    backgroundColor: "#6C4EF2",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#B8B8B8",
    fontSize: 16,
  },
  loginLink: {
    color: "#6C4EF2",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },

  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
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

export default RegisterScreen;
