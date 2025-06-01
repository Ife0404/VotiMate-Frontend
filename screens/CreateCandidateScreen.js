import React, { useState, useEffect } from "react";
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
import { Picker } from "@react-native-picker/picker";
import * as api from "../services/api";

const CreateCandidateScreen = ({ navigation, route }) => {
  const { candidate, isEditing = false } = route.params || {};
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    matricNumber: "",
    department: "",
    level: "",
    position: "",
    manifesto: "",
    electionId: "",
    profileImage: null,
  });

  const [elections, setElections] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState(null);

  const departments = [
    "Computer Science",
    "Information Technology", 
    "Software Engineering",
    "Cybersecurity",
    "Data Science"
  ];

  const levels = ["100", "200", "300", "400", "500"];

  useEffect(() => {
    fetchElections();
    if (isEditing && candidate) {
      setFormData({
        ...candidate,
        electionId: candidate.electionId || "",
      });
      setImageUri(candidate.profileImage);
    }
  }, [candidate, isEditing]);

  const fetchElections = async () => {
    try {
      const response = await api.getActiveElections();
      setElections(response);
    } catch (error) {
      console.error("Error fetching elections:", error);
      Alert.alert("Error", "Failed to load elections");
    }
  };

  const fetchPositions = async (electionId) => {
    try {
      const response = await api.getElectionPositions(electionId);
      setPositions(response);
    } catch (error) {
      console.error("Error fetching positions:", error);
      setPositions([]);
    }
  };

  const handleElectionChange = (electionId) => {
    setFormData({ ...formData, electionId, position: "" });
    if (electionId) {
      fetchPositions(electionId);
    } else {
      setPositions([]);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Permission to access camera roll is required!");
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
      Alert.alert("Permission Required", "Permission to access camera is required!");
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
    Alert.alert(
      "Select Image",
      "Choose how you want to add a photo",
      [
        { text: "Camera", onPress: takePhoto },
        { text: "Gallery", onPress: pickImage },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const validateForm = () => {
    const requiredFields = [
      { field: "firstName", name: "First Name" },
      { field: "lastName", name: "Last Name" },
      { field: "matricNumber", name: "Matric Number" },
      { field: "department", name: "Department" },
      { field: "level", name: "Level" },
      { field: "position", name: "Position" },
      { field: "electionId", name: "Election" },
      { field: "manifesto", name: "Manifesto" },
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

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const candidateData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'profileImage' && formData[key]) {
          candidateData.append('profileImage', {
            uri: formData[key].uri,
            type: 'image/jpeg',
            name: 'profile.jpg',
          });
        } else if (key !== 'profileImage') {
          candidateData.append(key, formData[key]);
        }
      });

      if (isEditing) {
        await api.updateCandidate(candidate.id, candidateData);
        Alert.alert("Success", "Candidate updated successfully");
      } else {
        await api.createCandidate(candidateData);
        Alert.alert("Success", "Candidate created successfully");
      }
      
      navigation.goBack();
    } catch (error) {
      console.error("Error saving candidate:", error);
      Alert.alert("Error", `Failed to ${isEditing ? 'update' : 'create'} candidate`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#14104D" />

      {/* Header */}
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
          <Text style={styles.headerText}>
            {isEditing ? "Edit Candidate" : "Add Candidate"}
          </Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.imageContainer} onPress={showImagePicker}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={32} color="#6C4EF2" />
                  <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                </View>
              )}
              <View style={styles.imageOverlay}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Information */}
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
              <Text style={styles.label}>Matric Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.matricNumber}
                onChangeText={(text) => handleInputChange("matricNumber", text)}
                placeholder="Enter matric number"
                placeholderTextColor="#999"
                autoCapitalize="characters"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Department *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.department}
                    onValueChange={(value) => handleInputChange("department", value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Department" value="" />
                    {departments.map((dept) => (
                      <Picker.Item key={dept} label={dept} value={dept} />
                    ))}
                  </Picker>
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Level *</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.level}
                    onValueChange={(value) => handleInputChange("level", value)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Level" value="" />
                    {levels.map((level) => (
                      <Picker.Item key={level} label={`${level} Level`} value={level} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Election Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Election Details</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Election *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.electionId}
                  onValueChange={handleElectionChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Election" value="" />
                  {elections.map((election) => (
                    <Picker.Item 
                      key={election.id} 
                      label={election.title} 
                      value={election.id} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Position *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.position}
                  onValueChange={(value) => handleInputChange("position", value)}
                  style={styles.picker}
                  enabled={positions.length > 0}
                >
                  <Picker.Item label="Select Position" value="" />
                  {positions.map((position) => (
                    <Picker.Item key={position} label={position} value={position} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* Manifesto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manifesto</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Manifesto * <Text style={styles.charCount}>({formData.manifesto.length}/100 min)</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.manifesto}
                onChangeText={(text) => handleInputChange("manifesto", text)}
                placeholder="Write your manifesto (minimum 100 characters)"
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        {/* Submit Button */}
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
              {loading ? "Saving..." : (isEditing ? "Update Candidate" : "Add Candidate")}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#14104D",
  },
  headerGradient: {
    paddingBottom: 20,
  },
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
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: "#14104D",
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
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
  imageContainer: {
    alignSelf: "center",
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
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
  imageOverlay: {
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
    borderColor: "#fff",
  },
  row: {
    flexDirection: "row",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: "#666",
    fontWeight: "normal",
  },
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
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: "#333",
  },
  submitButton: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 40,
    borderRadius: 16,
    overflow: "hidden",
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CreateCandidateScreen;