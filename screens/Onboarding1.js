import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

const Onboarding1 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/welcome.png")} style={styles.image} />
      <Text style={styles.title}>Welcome to VotiMate</Text>
      <Text style={styles.description}>
        The online voting application. Create your account and stay tuned.
      </Text>
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate("Onboarding2")}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Onboarding1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14104D",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
  },
  description: {
    textAlign: "center",
    color: "#fff",
    marginVertical: 10,
  },
  dotsContainer: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 10,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#4B2AFA",
  },
  button: {
    marginTop: 30,
    backgroundColor: "#6C4EF2",
    padding: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
