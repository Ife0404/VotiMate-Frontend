// screens/ConfirmationScreen.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Alert,
} from "react-native";
import * as api from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ConfirmationScreen = ({ visible, onCancel, candidateId, navigation }) => {
  const handleConfirm = async () => {
    try {
      const matricNumber = await AsyncStorage.getItem("matricNumber");
      if (!matricNumber) {
        throw new Error("User not authenticated. Please log in again.");
      }
      await api.vote(candidateId, matricNumber);
      onCancel();
      setTimeout(
        () => {
          navigation.navigate("Thanks");
        },
        Platform.OS === "ios" ? 500 : 300
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Voting failed. Please try again or log in."
      );
      if (error.message.includes("not authenticated")) {
        navigation.navigate("Login");
      }
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Confirmation</Text>
          <Text style={styles.message}>
            Are you sure? Your vote cannot be changed.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.buttonSecondText}>Confirm</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#6B48FF",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    width: "100%",
  },
  cancelButton: {
    borderColor: "#4B2AFA",
    borderWidth: 2,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: "#4B2AFA",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: { color: "black", fontSize: 16 },
  buttonSecondText: { color: "white", fontSize: 16 },
});

export default ConfirmationScreen;
