import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

const Onboarding3 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/vote.png")} style={styles.image} />
      <Text style={styles.title}>Make your choice</Text>
      <Text style={styles.description}>
        Vote for your favorite candidate, and view the results in real time.
      </Text>
      <View style={styles.dotsContainer}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
      </View>

      <TouchableOpacity
        onPress={() => navigation.replace("Selection")}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Onboarding3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14104D",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: 252,
    height: 264,
    resizeMode: "contain",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "Poppins",
    color: "#fff",
    marginTop: 20,
  },
  description: {
    textAlign: "center",
    color: "#fff",
    marginVertical: 10,
    fontFamily: "Poppins",
    fontSize: 20,
    fontWeight: "300",
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
