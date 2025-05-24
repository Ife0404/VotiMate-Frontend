import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ProfileScreen = ({ navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "Mauro Pires",
    matricNumber: "BU21CSC1055",
    department: "Computer Science",
    level: "300",
    dateOfBirth: "12/04/2004",
    position: "Voter",
  });

  const handleSave = () => {
    setIsEditing(false);
    // Add logic to save changes to backend if needed
  };

  const handleLogout = () => {
    // Navigate to login or onboarding screen
    navigation.navigate("Onboarding");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Profile</Text>
          <View style={{ width: 28 }} /> {/* Placeholder for alignment */}
        </View>

        {/* Profile Picture and Name */}
        <View style={styles.profileSection}>
          <Image
            source={require("../assets/candidate.png")} // Reuse existing asset
            style={styles.profileImage}
          />
          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.matricNumber}>{userData.matricNumber}</Text>
        </View>

        {/* Details Section */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Department</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={userData.department}
                onChangeText={(text) =>
                  setUserData({ ...userData, department: text })
                }
              />
            ) : (
              <Text style={styles.value}>{userData.department}</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Level</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={userData.level}
                onChangeText={(text) =>
                  setUserData({ ...userData, level: text })
                }
              />
            ) : (
              <Text style={styles.value}>{userData.level}</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Date of Birth</Text>
            <Text style={styles.value}>{userData.dateOfBirth}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Position</Text>
            <Text style={styles.value}>{userData.position}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {isEditing ? (
            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1E1E3F",
  },
  container: {
    flex: 1,
    backgroundColor: "#1E1E3F",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#1E1E3F",
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  matricNumber: {
    color: "#D3D3D3",
    fontSize: 16,
    marginTop: 5,
  },
  detailsCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  detailRow: {
    marginBottom: 15,
  },
  label: {
    color: "#D3D3D3",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  value: {
    color: "#333",
    fontSize: 16,
  },
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    padding: 8,
    color: "#333",
    fontSize: 16,
  },
  buttonContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: "#4B2AFA",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: "#555555", // Gray for logout
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
