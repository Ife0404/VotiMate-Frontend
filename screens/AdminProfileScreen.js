import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const AdminProfileScreen = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sample admin data - replace with actual data from your backend
  const [adminData, setAdminData] = useState({
    firstName: "John",
    lastName: "Doe",
    matricNumber: "ADM001",
    department: "Computer Science",
  });

  const [editData, setEditData] = useState({ ...adminData });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ ...adminData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ ...adminData });
  };

  const handleSave = async () => {
    if (
      !editData.firstName.trim() ||
      !editData.lastName.trim() ||
      !editData.matricNumber.trim() ||
      !editData.department.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement update profile API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setAdminData({ ...editData });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => navigation.replace("UserTypeSelection"),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14104D" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonRow}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {!isEditing && (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={["#FF6B6B", "#FF5252"]}
            style={styles.avatarContainer}
          >
            <Ionicons name="shield-checkmark" size={50} color="#fff" />
          </LinearGradient>
          <Text style={styles.adminRole}>Administrator</Text>
          <Text style={styles.adminName}>
            {adminData.firstName} {adminData.lastName}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={isEditing ? editData.firstName : adminData.firstName}
                onChangeText={(text) =>
                  setEditData({ ...editData, firstName: text })
                }
                editable={isEditing && !loading}
                placeholder="First Name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={isEditing ? editData.lastName : adminData.lastName}
                onChangeText={(text) =>
                  setEditData({ ...editData, lastName: text })
                }
                editable={isEditing && !loading}
                placeholder="Last Name"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Matric Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="card-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={
                  isEditing ? editData.matricNumber : adminData.matricNumber
                }
                onChangeText={(text) =>
                  setEditData({ ...editData, matricNumber: text })
                }
                editable={isEditing && !loading}
                placeholder="Matric Number"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Department</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="school-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={isEditing ? editData.department : adminData.department}
                onChangeText={(text) =>
                  setEditData({ ...editData, department: text })
                }
                editable={isEditing && !loading}
                placeholder="Department"
              />
            </View>
          </View>

          {isEditing && (
            <View style={styles.buttonGroup}>
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
                  styles.saveButton,
                  loading && styles.buttonDisabled,
                ]}
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
          )}
        </View>

        {!isEditing && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionItem, styles.logoutItem]}
              onPress={handleLogout}
            >
              <View
                style={[styles.actionIconContainer, styles.logoutIconContainer]}
              >
                <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
              </View>
              <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
              <Ionicons name="chevron-forward" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    marginBottom: 20,
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
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  adminRole: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  adminName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  formContainer: {
    marginBottom: 30,
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
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#333",
  },
  inputDisabled: {
    color: "#666",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
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
  saveButton: {
    elevation: 4,
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  actionsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 8,
    marginBottom: 40,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginVertical: 4,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(108, 78, 242, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionText: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  logoutItem: {
    marginTop: 8,
  },
  logoutIconContainer: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
  },
  logoutText: {
    color: "#FF6B6B",
  },
});

export default AdminProfileScreen;
