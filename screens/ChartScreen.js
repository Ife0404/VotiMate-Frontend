// screens/ChartScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
  TouchableOpacity,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as api from "../services/api";

const { width } = Dimensions.get("window");

const ChartScreen = ({ navigation }) => {
  const [results, setResults] = useState([]);
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showElectionSelector, setShowElectionSelector] = useState(false);
  const [groupedResults, setGroupedResults] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Predefined colors for candidates
  const candidateColors = [
    "#6B48FF",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FECA57",
    "#FF9FF3",
    "#54A0FF",
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // Fetch elections first
      const electionsData = await api.getElections();
      let electionsArray = [];

      if (electionsData && Array.isArray(electionsData)) {
        electionsArray = electionsData;
      } else if (electionsData) {
        electionsArray = [electionsData];
      }

      setElections(electionsArray);

      // Set default election (first one or the active one)
      let defaultElection = null;
      if (electionsArray.length > 0) {
        // Try to find an active election first
        const activeElection = electionsArray.find(
          (election) =>
            election.status === "ACTIVE" || election.status === "ONGOING"
        );
        defaultElection = activeElection || electionsArray[0];
        setSelectedElection(defaultElection);
      }

      // Fetch results for all elections
      await fetchAllResults(electionsArray);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      Alert.alert("Error", "Failed to load elections.");
      setElections([]);
      setSelectedElection(null);
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch results for all elections
  const fetchAllResults = async (electionsArray = elections) => {
    try {
      const grouped = {};
      let colorIndex = 0;

      // Fetch results for each election
      for (const election of electionsArray) {
        try {
          const data = await api.getResultsByElection(election.id);

          if (
            data &&
            data.candidateResults &&
            Array.isArray(data.candidateResults)
          ) {
            const transformedData = data.candidateResults.map(
              (candidate, index) => ({
                name:
                  candidate.name ||
                  candidate.candidateName ||
                  `Candidate ${index + 1}`,
                votes: candidate.voteCount || candidate.votes || 0,
                percentage: candidate.percentage || 0,
                id: candidate.id || candidate.candidateId || index + 1,
                color: candidateColors[colorIndex % candidateColors.length],
              })
            );

            // Sort by votes descending
            transformedData.sort((a, b) => b.votes - a.votes);

            grouped[
              election.name || election.title || `Election ${election.id}`
            ] = transformedData;
            colorIndex += transformedData.length;
          }
        } catch (error) {
          console.error(
            `Error fetching results for election ${election.id}:`,
            error
          );
        }
      }

      setGroupedResults(grouped);

      // Also set the flat results for backward compatibility with existing stats
      const flatResults = Object.values(grouped).flat();
      setResults(flatResults);

      // Animate in the results
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert("Error", "Failed to load results.");
    }
  };

  const handleElectionChange = async (election) => {
    setSelectedElection(election);
    setShowElectionSelector(false);
    fadeAnim.setValue(0);
    await fetchAllResults([election]); // Fetch only selected election
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllResults(elections); // Refresh all elections
    setRefreshing(false);
  };

  const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
  const maxVotes = Math.max(...results.map((r) => r.votes), 1);

  const ProgressBar = ({ percentage, color, votes, animated = true }) => {
    const animatedWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (animated) {
        Animated.timing(animatedWidth, {
          toValue: percentage,
          duration: 1500,
          useNativeDriver: false,
        }).start();
      }
    }, [percentage, animated]);

    return (
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: color,
              width: animated
                ? animatedWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                    extrapolate: "clamp",
                  })
                : `${percentage}%`,
            },
          ]}
        />
        <View style={styles.progressBarBackground} />
      </View>
    );
  };

  const CandidateCard = ({ candidate, index, isWinner }) => (
    <Animated.View
      style={[
        styles.candidateCard,
        isWinner && styles.winnerCard,
        { opacity: fadeAnim },
      ]}
    >
      <View style={styles.candidateHeader}>
        <View style={styles.candidateInfo}>
          <View style={styles.candidateDetails}>
            <Text style={[styles.candidateName, isWinner && styles.winnerText]}>
              {candidate.name}
            </Text>
            <Text style={styles.candidateSubtext}>
              {candidate.votes.toLocaleString()} votes
            </Text>
          </View>
        </View>
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentageText, { color: candidate.color }]}>
            {candidate.percentage.toFixed(1)}%
          </Text>
        </View>
      </View>

      <ProgressBar
        percentage={candidate.percentage}
        color={candidate.color}
        votes={candidate.votes}
      />
    </Animated.View>
  );

  // Election Header Component
  const ElectionHeader = ({ electionName, candidateCount }) => (
    <View style={styles.electionHeaderContainer}>
      <Text style={styles.electionHeaderText}>{electionName}</Text>
      <Text style={styles.electionHeaderSubtext}>
        {candidateCount} candidates
      </Text>
    </View>
  );

  const ElectionSelector = () => (
    <Modal
      visible={showElectionSelector}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowElectionSelector(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Election</Text>
            <TouchableOpacity
              onPress={() => setShowElectionSelector(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.electionList}>
            {elections.map((election, index) => (
              <TouchableOpacity
                key={election.id || index}
                style={[
                  styles.electionItem,
                  selectedElection?.id === election.id &&
                    styles.selectedElectionItem,
                ]}
                onPress={() => handleElectionChange(election)}
              >
                <View style={styles.electionInfo}>
                  <Text style={styles.electionName}>
                    {election.name || election.title}
                  </Text>
                  <Text style={styles.electionDate}>
                    {election.date
                      ? new Date(election.date).toLocaleDateString()
                      : "No date"}
                  </Text>
                  <Text
                    style={[
                      styles.electionStatus,
                      {
                        color:
                          election.status === "ACTIVE" ? "#4ECDC4" : "#FECA57",
                      },
                    ]}
                  >
                    {election.status || "Unknown"}
                  </Text>
                </View>
                {selectedElection?.id === election.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#6B48FF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Results...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Section */}
      <LinearGradient
        colors={["#6B48FF", "#14104D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Election Results</Text>
          <Text style={styles.headerSubtitle}>Live Results Dashboard</Text>
        </View>
      </LinearGradient>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <LinearGradient
          colors={["#361EB5", "#6B48FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.totalVotesCard}
        >
          <Text style={styles.totalVotesLabel}>Total Votes Counted</Text>
          <Text style={styles.totalVotesNumber}>
            {totalVotes.toLocaleString()}
          </Text>
          <Text style={styles.totalVotesSubtext}>
            Across {Object.keys(groupedResults).length} elections
          </Text>
        </LinearGradient>

        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{results.length}</Text>
            <Text style={styles.statLabel}>Total Candidates</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {Object.keys(groupedResults).length}
            </Text>
            <Text style={styles.statLabel}>Elections</Text>
          </View>
        </View>
      </View>

      {/* Results Section with Election Headers */}
      <View style={styles.resultsSection}>
        <Text style={styles.sectionTitle}>Election Results</Text>

        {Object.keys(groupedResults).length > 0 ? (
          Object.entries(groupedResults).map(([electionName, candidates]) => (
            <View key={electionName} style={styles.electionGroup}>
              <ElectionHeader
                electionName={electionName}
                candidateCount={candidates.length}
              />

              {candidates.map((candidate, index) => (
                <CandidateCard
                  key={candidate.id || index}
                  candidate={candidate}
                  index={index}
                  isWinner={index === 0}
                />
              ))}
            </View>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataIcon}>📊</Text>
            <Text style={styles.noDataText}>No results available yet</Text>
            <Text style={styles.noDataSubtext}>
              Results will appear here once voting begins
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          activeOpacity={0.8}
        >
          <Text style={styles.refreshButtonText}>🔄 Refresh Results</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ElectionSelector />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14104D",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#14104D",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  headerSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
  },
  statsSection: {
    padding: 20,
    paddingTop: 0,
  },
  totalVotesCard: {
    padding: 24,
    borderRadius: 20,
    marginTop: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  totalVotesLabel: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  totalVotesNumber: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 4,
  },
  totalVotesSubtext: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    borderRadius: 16,
    flex: 0.48,
    alignItems: "center",
  },
  statNumber: {
    color: "#6B48FF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  resultsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  electionGroup: {
    marginBottom: 30,
  },
  electionHeaderContainer: {
    backgroundColor: "rgba(107, 72, 255, 0.15)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#6B48FF",
  },
  electionHeaderText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  electionHeaderSubtext: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  candidateCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  winnerCard: {
    backgroundColor: "rgba(107, 72, 255, 0.1)",
    borderColor: "#6B48FF",
    borderWidth: 2,
  },
  candidateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  candidateInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  candidateDetails: {
    flex: 1,
  },
  candidateName: {
    color: "#D3D3D3",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  winnerText: {
    color: "#6B48FF",
  },
  candidateSubtext: {
    color: "rgba(211, 211, 211, 0.7)",
    fontSize: 14,
  },
  percentageContainer: {
    alignItems: "flex-end",
  },
  percentageText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  progressBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
    zIndex: 1,
  },
  noDataContainer: {
    alignItems: "center",
    padding: 40,
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noDataText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  noDataSubtext: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 16,
    textAlign: "center",
  },
  actionButtons: {
    padding: 20,
    paddingTop: 0,
  },
  refreshButton: {
    backgroundColor: "#6B48FF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  refreshButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  backButtonText: {
    color: "#6B48FF",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#14104D",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  electionList: {
    maxHeight: 400,
  },
  electionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  selectedElectionItem: {
    backgroundColor: "rgba(107, 72, 255, 0.1)",
  },
  electionInfo: {
    flex: 1,
  },
  electionName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  electionDate: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    marginBottom: 2,
  },
  electionStatus: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});

export default ChartScreen;
