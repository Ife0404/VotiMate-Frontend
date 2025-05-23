// screens/ThanksScreen.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ThanksScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Thanks for your voting</Text>
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkIcon}>✓</Text>
        </View>
        <TouchableOpacity
          style={styles.viewResultsButton}
          onPress={() => navigation.navigate("ChartView")}
        >
          <Text style={styles.buttonText}>View results</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14104D",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    color: "#6B48FF",
    fontWeight: "bold",
    marginBottom: 10,
  },
  checkmark: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6B48FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  checkmarkIcon: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  viewResultsButton: {
    backgroundColor: "#6B48FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default ThanksScreen;
