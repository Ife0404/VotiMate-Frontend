import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";

export default function CameraScreen({ navigation }) {
  useEffect(() => {
    // Simulate scanning delay then navigate
    const timer = setTimeout(() => {
      navigation.replace("Main");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require("../assets/face.png")} style={styles.faceIcon} />
      {/* Future: Integrate camera here */}
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
});
