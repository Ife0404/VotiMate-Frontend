import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  getAdminProfile,
  updateAdminProfile,
  adminLogout,
} from "../services/api";

const AdminProfileScreen = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [adminData, setAdminData] = useState({
    firstName: "",
    lastName: "",
    matricNumber: "",
    department: "",
  });
  const [originalData, setOriginalData] = useState({}); // Store original data for cancel
  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setLoading(true);
        const data = await getAdminProfile();
        setAdminData(data);
        setOriginalData(data); // Store original data
      } catch (error) {
        console.error("Failed to load admin profile:", error);
        Alert.alert(
          "Error",
          error.message || "Failed to load profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAdminProfile();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSave = async () => {
    if (
      !adminData.firstName.trim() ||
      !adminData.lastName.trim() ||
      !adminData.matricNumber.trim() ||
      !adminData.department.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const result = await updateAdminProfile(adminData);
      setOriginalData(adminData); // Update original data after successful save
      setIsEditing(false);
      Alert.alert("Success", result.message || "Profile updated successfully");
    } catch (error) {
      console.error("Update profile error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setAdminData(originalData); // Reset to original data
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await adminLogout();
            // Replace with the correct screen name (verify in your navigation setup)
            navigation.replace("Onboarding"); // Changed from UserTypeSelection
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", error.message || "Failed to logout");
            // Still navigate to Onboarding on failure to clear session
            navigation.replace("Onboarding");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#14104D" />

      {/* Header with gradient */}
      <LinearGradient
        colors={["#14104D", "#1a1461", "#241b7a"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <View style={styles.backButtonContainer}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.headerText}>Admin Profile</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons
              name={isEditing ? "close" : "create-outline"}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Profile Details Card */}
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Administrator Information</Text>

            {/* First Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>First Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={adminData.firstName}
                  onChangeText={(text) =>
                    setAdminData({ ...adminData, firstName: text })
                  }
                  placeholder="Enter first name"
                  placeholderTextColor="#999"
                  editable={!loading}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {adminData.firstName || "Not set"}
                </Text>
              )}
            </View>

            {/* Last Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Last Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={adminData.lastName}
                  onChangeText={(text) =>
                    setAdminData({ ...adminData, lastName: text })
                  }
                  placeholder="Enter last name"
                  placeholderTextColor="#999"
                  editable={!loading}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {adminData.lastName || "Not set"}
                </Text>
              )}
            </View>

            {/* Matric Number */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Matric Number</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={adminData.matricNumber}
                  onChangeText={(text) =>
                    setAdminData({ ...adminData, matricNumber: text })
                  }
                  placeholder="Enter matric number"
                  placeholderTextColor="#999"
                  editable={!loading}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {adminData.matricNumber || "Not set"}
                </Text>
              )}
            </View>

            {/* Department */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Department</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={adminData.department}
                  onChangeText={(text) =>
                    setAdminData({ ...adminData, department: text })
                  }
                  placeholder="Enter department"
                  placeholderTextColor="#999"
                  editable={!loading}
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {adminData.department || "Not set"}
                </Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {isEditing ? (
              <View style={styles.editButtonsContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancel}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={loading ? ["#999", "#999"] : ["#4ECDC4", "#44A08D"]}
                    style={styles.saveButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color="#fff"
                          style={styles.buttonIcon}
                        />
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ff4757" />
                ) : (
                  <>
                    <Ionicons
                      name="log-out-outline"
                      size={20}
                      color="#ff4757"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
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
    paddingTop: 10,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#14104D",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  content: {
    flex: 1,
    marginTop: 20,
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 40,
    padding: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  input: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4ECDC4",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  editButtonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  cancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#e9ecef",
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#ff4757",
  },
  logoutButtonText: {
    color: "#ff4757",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default AdminProfileScreen;
