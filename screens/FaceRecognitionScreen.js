import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";

export default function FaceRecognitionScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/face.png")}
        style={styles.faceIcon}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("FaceCamera")}
      >
        <Text style={styles.buttonText}>Enable facial recognition</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14104D",
    justifyContent: "center",
    alignItems: "center",
  },
  faceIcon: {
    width: 100,
    height: 100,
    tintColor: "white",
  },
  button: {
    marginTop: 40,
    backgroundColor: "#6236FF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
