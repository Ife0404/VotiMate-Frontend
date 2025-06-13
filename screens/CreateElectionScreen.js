import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { createElection } from "../services/api"; // Import your API function

const CreateElectionScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", // Changed from 'title' to 'name' to match backend
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Please enter election name");
      return false;
    }
    if (!formData.startDate.trim()) {
      Alert.alert("Error", "Please enter start date");
      return false;
    }
    if (!formData.startTime.trim()) {
      Alert.alert("Error", "Please enter start time");
      return false;
    }
    if (!formData.endDate.trim()) {
      Alert.alert("Error", "Please enter end date");
      return false;
    }
    if (!formData.endTime.trim()) {
      Alert.alert("Error", "Please enter end time");
      return false;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.startDate)) {
      Alert.alert("Error", "Start date must be in YYYY-MM-DD format");
      return false;
    }
    if (!dateRegex.test(formData.endDate)) {
      Alert.alert("Error", "End date must be in YYYY-MM-DD format");
      return false;
    }

    // Validate time format (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(formData.startTime)) {
      Alert.alert("Error", "Start time must be in HH:MM format");
      return false;
    }
    if (!timeRegex.test(formData.endTime)) {
      Alert.alert("Error", "End time must be in HH:MM format");
      return false;
    }

    // Validate that end date/time is after start date/time
    const startDateTime = new Date(
      `${formData.startDate}T${formData.startTime}`
    );
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    if (endDateTime <= startDateTime) {
      Alert.alert(
        "Error",
        "End date and time must be after start date and time"
      );
      return false;
    }

    return true;
  };

  // Helper function to combine date and time into ISO format
  const combineDateTime = (date, time) => {
    // Add seconds to make it a complete ISO datetime
    return `${date}T${time}:00`;
  };

  const handleCreateElection = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Send data directly to backend (no mapping needed now)
      const backendData = {
        name: formData.name.trim(),
        startDate: combineDateTime(formData.startDate, formData.startTime),
        endDate: combineDateTime(formData.endDate, formData.endTime),
      };

      console.log("Creating election with data:", backendData);

      const result = await createElection(backendData);

      if (result.success) {
        Alert.alert(
          "Success",
          result.message || "Election created successfully!",
          [
            {
              text: "OK",
              onPress: () => {
                // Reset form
                setFormData({
                  name: "",
                  startDate: "",
                  startTime: "",
                  endDate: "",
                  endTime: "",
                });
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        // Handle API error response
        Alert.alert(
          "Error",
          result.message || "Failed to create election. Please try again."
        );
      }
    } catch (error) {
      console.error("Unexpected error creating election:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel",
      "Are you sure you want to cancel? All unsaved changes will be lost.",
      [
        { text: "Continue Editing", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14104D" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonRow} onPress={handleCancel}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>Create Election</Text>
        <Text style={styles.screenSubtitle}>Set up a new election</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Election Title *</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => handleInputChange("name", text)}
                placeholder="e.g., Student Union President 2025"
                placeholderTextColor="#999"
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.dateTimeSection}>
            <Text style={styles.sectionTitle}>Election Schedule</Text>

            <View style={styles.dateTimeRow}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Start Date *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={formData.startDate}
                    onChangeText={(text) =>
                      handleInputChange("startDate", text)
                    }
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#999"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Start Time *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={formData.startTime}
                    onChangeText={(text) =>
                      handleInputChange("startTime", text)
                    }
                    placeholder="HH:MM"
                    placeholderTextColor="#999"
                    editable={!loading}
                  />
                </View>
              </View>
            </View>

            <View style={styles.dateTimeRow}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>End Date *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={formData.endDate}
                    onChangeText={(text) => handleInputChange("endDate", text)}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#999"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.inputLabel}>End Time *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={formData.endTime}
                    onChangeText={(text) => handleInputChange("endTime", text)}
                    placeholder="HH:MM"
                    placeholderTextColor="#999"
                    editable={!loading}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={20} color="#6C4EF2" />
              <Text style={styles.infoTitle}>Important Notes</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                • Elections cannot be modified once voting begins
              </Text>
              <Text style={styles.infoText}>
                • Candidates can be added after creating the election
              </Text>
              <Text style={styles.infoText}>
                • Make sure to set appropriate start and end times
              </Text>
              <Text style={styles.infoText}>
                • All fields marked with * are required
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.createButton,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleCreateElection}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ["#999", "#999"] : ["#4ECDC4", "#44A08D"]}
            style={styles.createButtonGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="add-circle"
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.createButtonText}>Create Election</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14104D",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
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
  titleContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  screenTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  screenSubtitle: {
    color: "#B8B8B8",
    fontSize: 16,
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  formContainer: {
    paddingBottom: 100,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  textAreaContainer: {
    alignItems: "flex-start",
    paddingTop: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dateTimeSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: "rgba(108, 78, 242, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(108, 78, 242, 0.2)",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    color: "#6C4EF2",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  infoContent: {
    gap: 8,
  },
  infoText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "#14104D",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  button: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  cancelButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  createButton: {
    elevation: 4,
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  createButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default CreateElectionScreen;
