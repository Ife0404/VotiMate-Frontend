// screens/ChartScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as api from "../services/api";

const ChartScreen = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await api.getResults();
        if (!data || data.length === 0) {
          setResults([]);
        } else {
          setResults(data);
        }
      } catch (error) {
        Alert.alert("Error", error.message || "Failed to load results");
        setResults([]);
      }
    };
    fetchResults();
  }, []);

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
          <Text style={styles.totalVotes}>
            {results.reduce((sum, r) => sum + r.votes, 0).toLocaleString()}
          </Text>
        </View>
      </LinearGradient>
      {results.length > 0 ? (
        results.map((candidate, index) => (
          <View key={index} style={styles.candidateRow}>
            <View style={styles.candidateInfo}>
              <Text style={styles.candidateName}>{candidate.name}</Text>
              <Text style={styles.candidatePercentage}>
                {candidate.percentage}%
              </Text>
            </View>
            <ProgressBar
              percentage={candidate.percentage}
              color={candidate.color || "#00FF00"}
            />
            <Text style={styles.votesText}>
              Votes: {candidate.votes.toLocaleString()}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.noDataText}>No results yet</Text>
      )}
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
  candidateName: { color: "#D3D3D3", fontSize: 18 },
  candidatePercentage: { color: "#D3D3D3", fontSize: 18 },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#555555",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 5,
  },
  progressBar: { height: "100%", borderRadius: 5 },
  votesText: { color: "#D3D3D3", fontSize: 14, textAlign: "right" },
  noDataText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
});

export default ChartScreen;
