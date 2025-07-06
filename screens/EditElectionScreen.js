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
import {
  getElectionById,
  updateElection,
  deleteElection,
  getCandidates,
} from "../services/api";

const EditElectionScreen = ({ navigation, route }) => {
  const { electionId } = route.params;
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [election, setElection] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });
  const [electionStats, setElectionStats] = useState({
    candidatesCount: 0,
    status: "unknown",
  });

  // Helper function to format date-time from backend
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return { date: "", time: "" };

    try {
      const date = new Date(dateTimeString);
      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
      const timeStr = date.toTimeString().split(" ")[0].substring(0, 5); // HH:MM
      return { date: dateStr, time: timeStr };
    } catch (error) {
      console.error("Error parsing date-time:", error);
      return { date: "", time: "" };
    }
  };

  // Helper function to combine date and time for backend
  const combineDateTime = (date, time) => {
    if (!date || !time) return null;
    return `${date}T${time}:00`;
  };

  // Helper function to determine election status
  const getElectionStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return "upcoming";
    if (now > end) return "completed";
    return "active";
  };

  // Fetch election data and statistics
  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        setInitialLoading(true);

        // Fetch election details
        const electionResponse = await getElectionById(electionId);
        if (electionResponse.success) {
          const electionData = electionResponse.data;
          setElection(electionData);

          // Format start and end dates
          const startDateTime = formatDateTime(electionData.startDate);
          const endDateTime = formatDateTime(electionData.endDate);

          setFormData({
            title: electionData.name || "",
            description: electionData.description || "",
            startDate: startDateTime.date,
            startTime: startDateTime.time || "09:00",
            endDate: endDateTime.date,
            endTime: endDateTime.time || "17:00",
          });

          // Determine election status
          const status = getElectionStatus(
            electionData.startDate,
            electionData.endDate
          );

          // Fetch candidates count
          try {
            const candidatesResponse = await getCandidates(electionId);
            const candidatesCount = Array.isArray(candidatesResponse)
              ? candidatesResponse.length
              : 0;

            setElectionStats({
              candidatesCount,
              status,
            });
          } catch (candidatesError) {
            console.warn("Could not fetch candidates:", candidatesError);
            setElectionStats((prev) => ({ ...prev, status }));
          }
        } else {
          Alert.alert(
            "Error",
            electionResponse.message || "Failed to fetch election data"
          );
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error fetching election data:", error);
        Alert.alert("Error", "Failed to load election data. Please try again.");
        navigation.goBack();
      } finally {
        setInitialLoading(false);
      }
    };

    if (electionId) {
      fetchElectionData();
    } else {
      Alert.alert("Error", "No election ID provided");
      navigation.goBack();
    }
  }, [electionId]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert("Error", "Please enter election title");
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

    // Validate date format (basic check)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.startDate)) {
      Alert.alert("Error", "Start date must be in YYYY-MM-DD format");
      return false;
    }
    if (!dateRegex.test(formData.endDate)) {
      Alert.alert("Error", "End date must be in YYYY-MM-DD format");
      return false;
    }

    // Validate time format (basic check)
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
      combineDateTime(formData.startDate, formData.startTime)
    );
    const endDateTime = new Date(
      combineDateTime(formData.endDate, formData.endTime)
    );

    if (endDateTime <= startDateTime) {
      Alert.alert("Error", "End date/time must be after start date/time");
      return false;
    }

    return true;
  };

  const handleUpdateElection = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = {
        title: formData.title.trim(),
        startDate: combineDateTime(formData.startDate, formData.startTime),
        endDate: combineDateTime(formData.endDate, formData.endTime),
      };

      console.log("Updating election with data:", updateData);

      const response = await updateElection(electionId, updateData);

      if (response.success) {
        Alert.alert("Success", "Election updated successfully!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to update election. Please try again."
        );
      }
    } catch (error) {
      console.error("Error updating election:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to update election. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteElection = () => {
    Alert.alert(
      "Delete Election",
      `Are you sure you want to delete "${formData.title}"? This action cannot be undone and will remove all associated candidates and votes.`,
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
      const response = await deleteElection(electionId);

      if (response.success) {
        Alert.alert("Success", "Election deleted successfully!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("ElectionManagement"),
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to delete election. Please try again."
        );
      }
    } catch (error) {
      console.error("Error deleting election:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to delete election. Please try again."
      );
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

  // Show loading screen while fetching initial data
  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#14104D" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Loading election data...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
                    {electionStats.status.charAt(0).toUpperCase() +
                      electionStats.status.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Candidates:</Text>
                <Text style={styles.statusValue}>
                  {electionStats.candidatesCount}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 12,
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
