import React, { useState, useEffect } from "react";
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

const EditElectionScreen = ({ navigation, route }) => {
  const { election } = route.params;
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  useEffect(() => {
    if (election) {
      setFormData({
        title: election.title || "",
        description: election.description || "",
        startDate: election.startDate || "",
        startTime: election.startTime || "09:00",
        endDate: election.endDate || "",
        endTime: election.endTime || "17:00",
      });
    }
  }, [election]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter election title");
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert("Error", "Please enter election description");
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
    return true;
  };

  const handleUpdateElection = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Implement update election API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert("Success", "Election updated successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update election. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteElection = () => {
    Alert.alert(
      "Delete Election",
      `Are you sure you want to delete "${election.title}"? This action cannot be undone and will remove all associated candidates and votes.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      // TODO: Implement delete election API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert("Success", "Election deleted successfully!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("ElectionManagement"),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to delete election. Please try again.");
    } finally {
      setDeleteLoading(false);
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

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteElection}
          disabled={deleteLoading}
        >
          {deleteLoading ? (
            <ActivityIndicator size="small" color="#FF6B6B" />
          ) : (
            <Ionicons name="trash" size={24} color="#FF6B6B" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>Edit Election</Text>
        <Text style={styles.screenSubtitle}>Update election details</Text>
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
                value={formData.title}
                onChangeText={(text) => handleInputChange("title", text)}
                placeholder="e.g., Student Union President 2025"
                placeholderTextColor="#999"
                editable={!loading && !deleteLoading}
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
                    editable={!loading && !deleteLoading}
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
                    editable={!loading && !deleteLoading}
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
                    editable={!loading && !deleteLoading}
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
                    editable={!loading && !deleteLoading}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Ionicons name="information-circle" size={20} color="#6C4EF2" />
              <Text style={styles.statusTitle}>Election Status</Text>
            </View>
            <View style={styles.statusContent}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Current Status:</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {election?.status?.charAt(0).toUpperCase() +
                      election?.status?.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Candidates:</Text>
                <Text style={styles.statusValue}>
                  {election?.candidatesCount || 0}
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Registered Voters:</Text>
                <Text style={styles.statusValue}>
                  {election?.votersCount || 0}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning" size={20} color="#FF9500" />
              <Text style={styles.warningTitle}>Important Notes</Text>
            </View>
            <View style={styles.warningContent}>
              <Text style={styles.warningText}>
                • Changes to active elections may affect ongoing voting
              </Text>
              <Text style={styles.warningText}>
                • Deleting an election will remove all associated data
              </Text>
              <Text style={styles.warningText}>
                • Schedule changes should be communicated to voters
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          disabled={loading || deleteLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.updateButton,
            (loading || deleteLoading) && styles.buttonDisabled,
          ]}
          onPress={handleUpdateElection}
          disabled={loading || deleteLoading}
        >
          <LinearGradient
            colors={
              loading || deleteLoading
                ? ["#999", "#999"]
                : ["#4ECDC4", "#44A08D"]
            }
            style={styles.updateButtonGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.updateButtonText}>Update Election</Text>
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
  deleteButton: {
    padding: 8,
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
  statusCard: {
    backgroundColor: "rgba(108, 78, 242, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(108, 78, 242, 0.2)",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusTitle: {
    color: "#6C4EF2",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  statusContent: {
    gap: 8,
  },
  statusItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
  },
  statusBadge: {
    backgroundColor: "rgba(108, 78, 242, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  statusValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  warningCard: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  warningTitle: {
    color: "#FF9500",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  warningContent: {
    gap: 8,
  },
  warningText: {
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
  updateButton: {
    elevation: 4,
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  updateButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default EditElectionScreen;
