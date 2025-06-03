// screens/ConfirmationScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ConfirmationScreen = ({
  visible,
  onCancel,
  onError, // Add this new prop
  candidateId,
  electionId,
  navigation,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const matricNumber = await AsyncStorage.getItem("matricNumber");
      if (!matricNumber) {
        throw new Error("User not authenticated. Please log in again.");
      }

      // Make sure to pass electionId to the API call
      await api.vote(candidateId, matricNumber, electionId);
      onCancel(); // Close modal first
      setTimeout(
        () => {
          navigation.navigate("Thanks");
        },
        Platform.OS === "ios" ? 500 : 300
      );
    } catch (error) {
      console.log("Vote submission error:", error);

      // Close the confirmation modal first
      onCancel();

      // Check if onError callback is provided (for custom error handling)
      if (onError) {
        onError(error);
      } else {
        // Fallback to generic alert if no onError handler
        Alert.alert(
          "Error",
          error.message || "Voting failed. Please try again or log in."
        );
      }

      // Handle authentication errors
      if (error.message && error.message.includes("not authenticated")) {
        navigation.navigate("Login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.dialog}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>⚠️</Text>
          </View>

          <Text style={styles.title}>Confirm Your Vote</Text>
          <Text style={styles.message}>
            Are you sure you want to cast your vote?{"\n"}
            <Text style={styles.warning}>This action cannot be undone.</Text>
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, loading && styles.disabledButton]}
              onPress={onCancel}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  loading && styles.disabledText,
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.disabledButton]}
              onPress={handleConfirm}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 16,
    width: "85%",
    maxWidth: 320,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#6B48FF",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  warning: {
    color: "#FF6B6B",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 8,
  },
  cancelButton: {
    flex: 1,
    borderColor: "#4B2AFA",
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "transparent",
    marginRight: 8,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#4B2AFA",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 8,
    shadowColor: "#4B2AFA",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButtonText: {
    color: "#4B2AFA",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
});

// Make sure to export as default
export default ConfirmationScreen;
