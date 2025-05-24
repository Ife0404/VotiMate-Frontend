import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ConfirmationScreen from "./ConfirmationScreen";

const CandidateScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleVote = () => {
    setModalVisible(true);
  };

  const handleConfirm = () => {
    setModalVisible(false);
    // Backend Connection Start - Vote API Call
    // try {
    //   await vote('1', 'BU21CSC1055'); // Replace with actual API call and matric
    //   navigation.navigate('Thanks');
    // } catch (error) {
    //   console.error('Voting failed:', error);
    // }
    // Backend Connection End

    // Mock navigation for UI testing without backend
    navigation.navigate("Thanks");
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>

      <Image
        source={require("../assets/candidate.png")}
        style={styles.profileImage}
      />

      <View style={styles.detailsContainer}>
        <Text style={styles.name}>Mauro Pires</Text>

        <TouchableOpacity style={styles.voteButton} onPress={handleVote}>
          <Text style={styles.voteButtonText}>Vote now</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.profileLink}>Profile</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.label}>Level</Text>
        <Text style={styles.value}>300</Text>

        <Text style={styles.label}>Position</Text>
        <Text style={styles.value}>President</Text>

        <Text style={styles.label}>Campaign Promises</Text>
        <Text style={styles.value}>
          Pledge to provide affordable health insurance to all Americans,
          resulting in the implementation of the Affordable Care Act.{"\n"}
          Pledge to withdraw American troops from Iraq in a responsible manner,
          with a view to ending the war safely.{"\n"}
          Pledge to invest in renewable energy and clean energy technologies in
          order to reduce US dependence on foreign oil and combat climate
          change.
        </Text>
      </View>

      {/* Use the imported ConfirmationScreen */}
      <ConfirmationScreen
        visible={modalVisible}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </ScrollView>
  );
};

export default CandidateScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14104D",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
  },
  profileImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: "#0D004C",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 12,
  },
  voteButton: {
    backgroundColor: "#4B2AFA",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  voteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  profileLink: {
    color: "#B1A9FF",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#B1A9FF",
    marginBottom: 20,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  value: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 5,
  },
});
