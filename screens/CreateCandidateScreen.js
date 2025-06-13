import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
  TextInput,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import * as api from "../services/api";

const CreateCandidateScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    level: "",
    position: "",
    manifesto: "", // Changed from campaignPromises to manifesto
    electionName: "", // Changed from selectedElectionId to electionName
    profileImage: null,
  });

  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Permission to access camera roll is required!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setFormData({ ...formData, profileImage: result.assets[0] });
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Permission to access camera is required!"
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setFormData({ ...formData, profileImage: result.assets[0] });
    }
  };

  const showImagePicker = () => {
    Alert.alert("Select Image", "Choose how you want to add a photo", [
      { text: "Camera", onPress: takePhoto },
      { text: "Gallery", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const validateForm = () => {
    const requiredFields = [
      { field: "firstName", name: "First Name" },
      { field: "lastName", name: "Last Name" },
      { field: "level", name: "Level" },
      { field: "position", name: "Position" },
      { field: "electionName", name: "Election Name" }, // Updated field name
      { field: "manifesto", name: "Manifesto" }, // Updated field name
    ];

    for (const { field, name } of requiredFields) {
      if (!formData[field]?.toString().trim()) {
        Alert.alert("Error", `Please enter ${name}`);
        return false;
      }
    }

    if (formData.manifesto.length < 100) {
      Alert.alert("Error", "Manifesto must be at least 100 characters long");
      return false;
    }

    // Validate level is a number
    if (isNaN(parseInt(formData.level))) {
      Alert.alert("Error", "Level must be a valid number");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await api.createCandidate(formData);
      Alert.alert("Success", "Candidate created successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error creating candidate:", error);
      Alert.alert("Error", `Failed to create candidate: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#14104D" />
      <LinearGradient
        colors={["#14104D", "#1a1461", "#241b7a"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Add Candidate</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={showImagePicker}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="add" size={32} color="#6C4EF2" />
                  <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>First Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.firstName}
                  onChangeText={(text) => handleInputChange("firstName", text)}
                  placeholder="Enter first name"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Last Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.lastName}
                  onChangeText={(text) => handleInputChange("lastName", text)}
                  placeholder="Enter last name"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Level *</Text>
              <TextInput
                style={styles.input}
                value={formData.level}
                onChangeText={(text) => handleInputChange("level", text)}
                placeholder="Enter level (e.g., 100, 200, 300, etc.)"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Election Details</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Election Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.electionName}
                onChangeText={(text) => handleInputChange("electionName", text)}
                placeholder="Enter election name (e.g., Student Union Election 2024)"
                placeholderTextColor="#999"
              />
              <Text style={styles.helperText}>
                💡 If this election doesn't exist, it will be created
                automatically
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Position *</Text>
              <TextInput
                style={styles.input}
                value={formData.position}
                onChangeText={(text) => handleInputChange("position", text)}
                placeholder="Enter position (e.g., President, Secretary, etc.)"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manifesto</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Manifesto *{" "}
                <Text style={styles.charCount}>
                  ({formData.manifesto.length}/100 min)
                </Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.manifesto}
                onChangeText={(text) => handleInputChange("manifesto", text)}
                placeholder="Write your manifesto - your vision, goals, and promises to the electorate (minimum 100 characters)"
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ["#ccc", "#aaa"] : ["#6C4EF2", "#4B2AFA"]}
            style={styles.submitGradient}
          >
            <Text style={styles.submitText}>
              {loading ? "Creating..." : "Add Candidate"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#14104D" },
  headerGradient: { paddingBottom: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  placeholder: { width: 40 },
  container: { flex: 1, backgroundColor: "#14104D" },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: { alignSelf: "center", position: "relative" },
  profileImage: { width: 120, height: 120, borderRadius: 60 },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f0f0",
    borderWidth: 2,
    borderColor: "#6C4EF2",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: "#6C4EF2",
    marginTop: 4,
    fontWeight: "600",
  },
  row: { flexDirection: "row" },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 8 },
  charCount: { fontSize: 12, color: "#666", fontWeight: "normal" },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  textArea: { height: 120, textAlignVertical: "top" },
  helperText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  submitButton: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  disabledButton: { opacity: 0.6 },
  submitGradient: { paddingVertical: 16, alignItems: "center" },
  submitText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  bottomPadding: { height: 30 },
});
export default CreateCandidateScreen;