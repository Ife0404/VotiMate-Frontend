// CandidateCard.js
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function CandidateCard({ name, position, image, navigation }) {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.image} />
      <View style={styles.details}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.position}>{position}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Candidate")}
        >
          <Text style={styles.buttonText}>View profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
  },
  image: {
    width: 99,
    height: "100%",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  details: {
    flex: 1,
    padding: 15,
    justifyContent: "center",
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#14104D",
  },
  position: {
    color: "gray",
    marginBottom: 12,
  },
  button: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#6236FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  buttonText: {
    color: "#6236FF",
    fontWeight: "bold",
  },
});
