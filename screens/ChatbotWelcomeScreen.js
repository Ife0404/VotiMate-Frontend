import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function ChatbotWelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      
      {/* Avatar */}
      <Image
        source={require("../assets/chatbot.png")} // Replace with your avatar image
        style={styles.avatar}
      />

      {/* Greeting Text */}
      <Text style={styles.greeting}>Hello</Text>
      <Text style={styles.subtext}>How can I help you today?</Text>

      {/* Chat Button */}
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => navigation.navigate("ChatbotView")}
      >
        <Text
          style={styles.chatButtonText}
        >
          Let’s Chat
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14104D",
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  
  avatar: {
    width: 120,
    height: 120,
    marginBottom: 50,
  },
  greeting: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtext: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 40,
  },
  chatButton: {
    backgroundColor: "#4B2AFA",
    width: 260,
    height: 62,
    paddingVertical: 20,
    paddingHorizontal: 89,
    borderRadius: 10,
  },
  chatButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
