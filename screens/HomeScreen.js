import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import CandidateCard from "../components/CandidateCard";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Home</Text>

      {/* Timer Section */}
      <LinearGradient
        colors={["#4B2AFA", "#2C1994"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.timerBox}
      >
        <View style={styles.timerHeader}>
          <Image
            source={require("../assets/hourglass.png")}
            style={styles.timerIcon}
          />
          <Text style={styles.timerLabel}>Remaining time for the election</Text>
        </View>

        <View style={styles.timerRow}>
          <View style={styles.timerRow}>
            <View style={styles.timeItem}>
              <Text style={styles.timeValue}>124</Text>
              <Text style={styles.timeLabel}>Days</Text>
            </View>
            <View style={styles.timeItem}>
              <Text style={styles.timeValue}>4</Text>
              <Text style={styles.timeLabel}>Hours</Text>
            </View>
            <View style={styles.timeItem}>
              <Text style={styles.timeValue}>30</Text>
              <Text style={styles.timeLabel}>Minutes</Text>
            </View>
            <View style={styles.timeItem}>
              <Text style={styles.timeValue}>29</Text>
              <Text style={styles.timeLabel}>Seconds</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <TextInput
        placeholder="Search Candidates"
        placeholderTextColor="#999"
        style={styles.searchInput}
      />

      {[
        "President",
        "Welfare Director",
        "General Secretary",
        "Commisioner",
        "Vice President",
      ].map((role, index) => (
        <CandidateCard
          key={index}
          name="Mauro Pires"
          position={role}
          image={require("../assets/mauro.png")}
          navigation={navigation}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14104D",
    padding: 20,
    paddingTop: 70,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  timerBox: {
    backgroundColor: "#1E1763",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  timerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  timerIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
    marginTop: 4,
    resizeMode: "contain",
  },
  timerLabel: {
    color: "#CFCFCF",
    fontSize: 15,
    fontFamily: "Poppins",
    fontWeight: "bold",
  },
  timerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 41,
  },
  timeItem: {
    alignItems: "center",
  },
  timeValue: {
    color: "#FFFFFF",
    fontSize: 32,
    fontFamily: "Poppins",
    fontWeight: "bold",
  },
  timeLabel: {
    color: "#fff",
    fontWeight: "semibold",
    fontFamily: "Poppins",
    fontSize: 15,
  },
  searchInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
});
