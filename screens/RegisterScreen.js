// screens/Register.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const RegisterScreen = ({ navigation }) => {
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Create account</Text>

      <View style={styles.firstContainer}>
        {["First name", "Last name", "Department", "Matric Number"].map(
          (placeholder, index) => (
            <TextInput
              key={index}
              placeholder={placeholder}
              placeholderTextColor="#999"
              style={styles.input}
            />
          )
        )}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={hidePassword}
          style={styles.inputField}
        />
        <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
          <Ionicons
            name={hidePassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#666"
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.enterButton}
        onPress={() => navigation.navigate("FaceIntro")}
      >
        <Text style={styles.enterButtonText}>Enter</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14104D",
    padding: 24,
  },
  backBtn: {
    marginTop: 40,
    marginBottom: 24,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 50,
  },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginVertical: 8,
  },
  firstContainer: {
    marginTop: 40,
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 8,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  icon: {
    marginLeft: 8,
  },
  enterButton: {
    backgroundColor: "#6C4EF2",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 60,
  },
  enterButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
