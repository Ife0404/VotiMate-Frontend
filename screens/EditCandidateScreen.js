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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  getElections,
} from "../services/api";

const EditCandidateScreen = ({ navigation, route }) => {
  const { candidateId } = route.params || {}; // Add fallback for undefined params

  // State declarations - these were missing!
  const [initialLoading, setInitialLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [elections, setElections] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    position: "",
    manifesto: "",
    electionName: "",
    level: "",
  });

  // Add validation for candidateId
  useEffect(() => {
    console.log("Route params:", route.params);
    console.log("Candidate ID received:", candidateId);

    if (!candidateId) {
      Alert.alert(
        "Error",
        "No candidate ID provided. Cannot load candidate data.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      return;
    }

    loadCandidateData();
    loadElections();
  }, [candidateId]);

  const loadCandidateData = async () => {
    if (!candidateId) {
      console.error("No candidate ID available");
      return;
    }

    try {
      setInitialLoading(true);
      console.log("Fetching candidate with ID:", candidateId);

      const response = await getCandidateById(candidateId);
      console.log("API Response:", response);

      if (response.success) {
        const candidateData = response.data;
        setCandidate(candidateData);

        // Split the name into firstName and lastName
        const nameParts = candidateData.name
          ? candidateData.name.split(" ")
          : ["", ""];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        setFormData({
          firstName,
          lastName,
          position: candidateData.position || "",
          manifesto: candidateData.manifesto || "",
          electionName: candidateData.electionName || "",
          level: candidateData.level ? candidateData.level.toString() : "",
        });
      } else {
        console.error("API Error:", response.message);
        Alert.alert(
          "Error",
          response.message || "Failed to load candidate data"
        );
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error loading candidate:", error);
      Alert.alert("Error", "Failed to load candidate data");
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  };

  const loadElections = async () => {
    try {
      const electionsData = await getElections();
      setElections(Array.isArray(electionsData) ? electionsData : []);
    } catch (error) {
      console.error("Error loading elections:", error);
      setElections([]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert("Error", "Please enter candidate's first name");
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert("Error", "Please enter candidate's last name");
      return false;
    }
    if (!formData.position.trim()) {
      Alert.alert("Error", "Please enter candidate's position");
      return false;
    }
    if (!formData.manifesto.trim()) {
      Alert.alert("Error", "Please enter candidate manifesto");
      return false;
    }
    if (!formData.electionName.trim()) {
      Alert.alert("Error", "Please enter election name");
      return false;
    }
    if (!formData.level.trim()) {
      Alert.alert("Error", "Please enter candidate level");
      return false;
    }
    return true;
  };

  const handleUpdateCandidate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        position: formData.position,
        manifesto: formData.manifesto,
        electionName: formData.electionName,
        level: parseInt(formData.level),
      };

      const response = await updateCandidate(candidateId, updateData);

      if (response.success) {
        Alert.alert("Success", "Candidate updated successfully!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert("Error", response.message || "Failed to update candidate");
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update candidate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = () => {
    Alert.alert(
      "Delete Candidate",
      `Are you sure you want to delete "${formData.firstName} ${formData.lastName}"? This action cannot be undone.`,
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
      const response = await deleteCandidate(candidateId);

      if (response.success) {
        Alert.alert("Success", "Candidate deleted successfully!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("CandidateManagement"),
          },
        ]);
      } else {
        Alert.alert("Error", response.message || "Failed to delete candidate");
      }
    } catch (error) {
      console.error("Delete error:", error);
      Alert.alert("Error", "Failed to delete candidate. Please try again.");
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
          <ActivityIndicator size="large" color="#6C4EF2" />
          <Text style={styles.loadingText}>Loading candidate data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error if candidate not found
  if (!candidate) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#14104D" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#FF6B6B" />
          <Text style={styles.errorText}>Candidate not found</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
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
          onPress={handleDeleteCandidate}
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
        <Text style={styles.screenTitle}>Edit Candidate</Text>
        <Text style={styles.screenSubtitle}>Update candidate details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Profile Image Section */}
          <View style={styles.imageSection}>
            <View style={styles.imageContainer}>
              <Image
                source={{
                  uri:
                    candidate.profileImageUrl ||
                    "https://via.placeholder.com/120x120?text=Photo",
                }}
                style={styles.profileImage}
              />
              <TouchableOpacity style={styles.changeImageButton}>
                <Ionicons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.imageLabel}>Candidate Photo</Text>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name *</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(text) => handleInputChange("firstName", text)}
                  placeholder="Enter first name"
                  placeholderTextColor="#999"
                  editable={!loading && !deleteLoading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name *</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(text) => handleInputChange("lastName", text)}
                  placeholder="Enter last name"
                  placeholderTextColor="#999"
                  editable={!loading && !deleteLoading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Position *</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="ribbon-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={formData.position}
                  onChangeText={(text) => handleInputChange("position", text)}
                  placeholder="Enter position (e.g., President, Vice President)"
                  placeholderTextColor="#999"
                  editable={!loading && !deleteLoading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Level *</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="school-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={formData.level}
                  onChangeText={(text) => handleInputChange("level", text)}
                  placeholder="Enter level (e.g., 100, 200, 300)"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  editable={!loading && !deleteLoading}
                />
              </View>
            </View>
          </View>

          {/* Election Assignment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Election Assignment</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Election Name *</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={formData.electionName}
                  onChangeText={(text) =>
                    handleInputChange("electionName", text)
                  }
                  placeholder="e.g., Student Union President 2025"
                  placeholderTextColor="#999"
                  editable={!loading && !deleteLoading}
                />
              </View>
            </View>
          </View>

          {/* Manifesto */}
          {/* <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manifesto</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Candidate Manifesto *</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#666"
                  style={[styles.inputIcon, styles.textAreaIcon]}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.manifesto}
                  onChangeText={(text) => handleInputChange("manifesto", text)}
                  placeholder="Enter candidate's manifesto, background, qualifications, and platform..."
                  placeholderTextColor="#999"
                  multiline
                  textAlignVertical="top"
                  editable={!loading && !deleteLoading}
                />
              </View>
            </View>
          </View> */}

          {/* Candidate Stats */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Ionicons name="stats-chart" size={20} color="#6C4EF2" />
              <Text style={styles.statusTitle}>Candidate Statistics</Text>
            </View>
            <View style={styles.statusContent}>
              {/* <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Total Votes:</Text>
                <Text style={styles.statusValue}>
                  {candidate.votesCount || 0}
                </Text>
              </View> */}
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Status:</Text>
                <Text style={styles.statusValue}>
                  {candidate.status || "Active"}
                </Text>
              </View>
              {/* <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Created:</Text>
                <Text style={styles.statusValue}>
                  {candidate.createdAt
                    ? new Date(candidate.createdAt).toLocaleDateString()
                    : "N/A"}
                </Text>
              </View> */}
            </View>
          </View>

          {/* Warning Card */}
          <View style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning" size={20} color="#FF9500" />
              <Text style={styles.warningTitle}>Important Notes</Text>
            </View>
            <View style={styles.warningContent}>
              <Text style={styles.warningText}>
                • Changes during active elections may affect voting results
              </Text>
              <Text style={styles.warningText}>
                • Deleting a candidate will remove all associated votes
              </Text>
              <Text style={styles.warningText}>
                • Profile changes should be communicated to voters
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
          onPress={handleUpdateCandidate}
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
                <Text style={styles.updateButtonText}>Update Candidate</Text>
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
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 16,
    textAlign: "center",
  },
  errorButton: {
    backgroundColor: "#6C4EF2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  imageSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  imageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F5F5",
  },
  changeImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#6C4EF2",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#14104D",
  },
  imageLabel: {
    color: "#B8B8B8",
    fontSize: 14,
    marginTop: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
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
  textAreaIcon: {
    alignSelf: "flex-start",
    marginTop: 0,
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

export default EditCandidateScreen;
