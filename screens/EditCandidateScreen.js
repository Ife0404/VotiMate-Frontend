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

const EditCandidateScreen = ({ navigation, route }) => {
  const { candidate } = route.params;
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    party: "",
    description: "",
    electionId: "",
  });

  // Sample elections for dropdown - replace with actual data
  const [elections] = useState([
    { id: 1, title: "Student Union President 2025" },
    { id: 2, title: "Faculty Representative Election" },
    { id: 3, title: "Sports Director Election" },
  ]);

  useEffect(() => {
    if (candidate) {
      setFormData({
        firstName: candidate.firstName || "",
        lastName: candidate.lastName || "",
        party: candidate.party || "",
        description: candidate.description || "",
        electionId: candidate.electionId || "",
      });
    }
  }, [candidate]);

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
    if (!formData.party.trim()) {
      Alert.alert("Error", "Please enter candidate's party");
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert("Error", "Please enter candidate description");
      return false;
    }
    if (!formData.electionId) {
      Alert.alert("Error", "Please select an election");
      return false;
    }
    return true;
  };

  const handleUpdateCandidate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Implement update candidate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert("Success", "Candidate updated successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update candidate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = () => {
    Alert.alert(
      "Delete Candidate",
      `Are you sure you want to delete "${candidate.firstName} ${candidate.lastName}"? This action cannot be undone.`,
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
      // TODO: Implement delete candidate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert("Success", "Candidate deleted successfully!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("CandidateManagement"),
        },
      ]);
    } catch (error) {
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

  const selectedElection = elections.find((e) => e.id === formData.electionId);

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
                    candidate?.profileImage ||
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
              <Text style={styles.inputLabel}>Party/Affiliation *</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="flag-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={formData.party}
                  onChangeText={(text) => handleInputChange("party", text)}
                  placeholder="e.g., Independent, Democratic Party"
                  placeholderTextColor="#999"
                  editable={!loading && !deleteLoading}
                />
              </View>
            </View>
          </View>

          {/* Election Assignment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Election Assignment</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Election *</Text>
              <TouchableOpacity
                style={styles.dropdownContainer}
                onPress={() => {
                  // TODO: Implement election picker
                  Alert.alert(
                    "Select Election",
                    "Election picker will be implemented"
                  );
                }}
                disabled={loading || deleteLoading}
              >
                <Ionicons
                  name="ballot-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <Text
                  style={[
                    styles.dropdownText,
                    !selectedElection && styles.placeholderText,
                  ]}
                >
                  {selectedElection
                    ? selectedElection.title
                    : "Select an election"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Candidate Description *</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#666"
                  style={[styles.inputIcon, styles.textAreaIcon]}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) =>
                    handleInputChange("description", text)
                  }
                  placeholder="Enter candidate's background, qualifications, and platform..."
                  placeholderTextColor="#999"
                  multiline
                  textAlignVertical="top"
                  editable={!loading && !deleteLoading}
                />
              </View>
            </View>
          </View>

          {/* Candidate Stats */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Ionicons name="stats-chart" size={20} color="#6C4EF2" />
              <Text style={styles.statusTitle}>Candidate Statistics</Text>
            </View>
            <View style={styles.statusContent}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Total Votes:</Text>
                <Text style={styles.statusValue}>
                  {candidate?.votesCount || 0}
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Vote Percentage:</Text>
                <Text style={styles.statusValue}>
                  {candidate?.votePercentage || 0}%
                </Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>Ranking:</Text>
                <Text style={styles.statusValue}>
                  #{candidate?.ranking || "N/A"}
                </Text>
              </View>
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
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  placeholderText: {
    color: "#999",
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
