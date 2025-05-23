// screens/ResultsScreen.js
import React from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";


const ChartScreen = () => {
  const totalVotes = 4893;
  const candidates = [
    { name: "Eli", percentage: 41, votes: 2006, color: "#00FF00" }, // Green
    { name: "Sam", percentage: 24, votes: 1174, color: "#0000FF" }, // Blue
    { name: "Nicholes", percentage: 15, votes: 734, color: "#800080" }, // Purple
    { name: "Robby", percentage: 10, votes: 489, color: "#FFD700" }, // Yellow
    { name: "Kenny", percentage: 7, votes: 343, color: "#C0C0C0" }, // Silver
    { name: "Miguel", percentage: 3, votes: 147, color: "#808080" }, // Gray
  ];

  const screenWidth = Dimensions.get("window").width - 40; // Subtract padding

  const ProgressBar = ({ percentage, color }) => (
    <View style={styles.progressBarContainer}>
      <View
        style={[
          styles.progressBar,
          { width: `${percentage}%`, backgroundColor: color },
        ]}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={["#361EB5", "#14104D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.voteBox}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>Total votes counted</Text>
          <Text style={styles.totalVotes}>{totalVotes.toLocaleString()}</Text>
        </View>
      </LinearGradient>

      {candidates.map((candidate, index) => (
        <View key={index} style={styles.candidateRow}>
          <View style={styles.candidateInfo}>
            <Text style={styles.candidateName}>{candidate.name}</Text>
            <Text style={styles.candidatePercentage}>
              {candidate.percentage}%
            </Text>
          </View>
          <ProgressBar
            percentage={candidate.percentage}
            color={candidate.color}
          />
          <Text style={styles.votesText}>
            Votes: {candidate.votes.toLocaleString()}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14104D",
    padding: 20,
    paddingTop: 100,
  },
  voteBox: {
    width: 353,
    height: 84,
    padding: 10,
    borderRadius: 12,
    marginBottom: 20,
  },
  header: {
    padding: 15,
    borderRadius: 10,
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerText: {
    color: "white",
    fontSize: 15,
    fontFamily: "Poppins",
    fontWeight: "bold",
  },
  totalVotes: {
    color: "white",
    fontSize: 20,
    fontFamily: "Poppins",
    fontWeight: "bold",
  },
  candidateRow: {
    backgroundColor: "#606062",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  candidateInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  candidateName: {
    color: "#D3D3D3", // Light gray for candidate names
    fontSize: 18,
  },
  candidatePercentage: {
    color: "#D3D3D3", // Light gray for percentage
    fontSize: 18,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#555555", // Gray background for progress bar
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 5,
  },
  progressBar: {
    height: "100%",
    borderRadius: 5,
  },
  votesText: {
    color: "#D3D3D3", // Light gray for votes
    fontSize: 14,
    textAlign: "right",
  },
});

export default ChartScreen;