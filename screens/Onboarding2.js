import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

const Onboarding2 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/stay_tuned.png")}
        style={styles.image}
      />
      <Text style={styles.title}>Stay tuned</Text>
      <Text style={styles.description}>
        Follow each candidate's election campaign.
      </Text>
      <View style={styles.dotsContainer}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
      </View>
      <TouchableOpacity
        onPress={() => navigation.navigate("Onboarding3")}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Onboarding2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14104D",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: 260,
    height: 253,
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
