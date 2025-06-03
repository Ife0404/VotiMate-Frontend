import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const UserTypeSelectionScreen = ({ navigation }) => {
  const handleUserLogin = () => {
    navigation.navigate("Login");
  };

  const handleAdminLogin = () => {
    navigation.navigate("AdminLogin");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14104D" />

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Choose Login Type</Text>
          <Text style={styles.subtitle}>
            Select your account type to continue
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {/* User Login Button */}
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleUserLogin}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#6C4EF2", "#5A3ED9"]}
              style={styles.buttonGradient}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="people" size={32} color="#fff" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.buttonTitle}>Sign in as User</Text>
                <Text style={styles.buttonSubtitle}>
                  Vote in elections with face recognition
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Admin Login Button */}
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleAdminLogin}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#FF6B6B", "#FF5252"]}
              style={styles.buttonGradient}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={32} color="#fff" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.buttonTitle}>Sign in as Admin</Text>
                <Text style={styles.buttonSubtitle}>
                  Manage elections and candidates
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?{" "}
            <Text
              style={styles.footerLink}
              onPress={() => navigation.navigate("Register")}
            >
              Create one
            </Text>
          </Text>
        </View>
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
    paddingTop: 20,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    marginTop: 25,
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#B8B8B8",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  optionButton: {
    marginVertical: 12,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  buttonTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  buttonSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    lineHeight: 18,
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
  },
  footerText: {
    color: "#B8B8B8",
    fontSize: 16,
  },
  footerLink: {
    color: "#6C4EF2",
    fontWeight: "600",
  },
});

export default UserTypeSelectionScreen;
