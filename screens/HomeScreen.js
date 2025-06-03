// screens/HomeScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Image,
  Alert,
  StatusBar,
  Animated,
} from "react-native";
import CandidateCard from "../components/CandidateCard";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as api from "../services/api";

export default function HomeScreen({ navigation }) {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch elections first
        const electionsData = await api.getElections(); // Assuming you have this API endpoint
        console.log("Elections data:", electionsData);

        let electionsArray = [];
        if (electionsData && Array.isArray(electionsData)) {
          electionsArray = electionsData;
        } else if (electionsData) {
          electionsArray = [electionsData];
        }
        setElections(electionsArray);

        // Fetch candidates
        const candidatesData = await api.getCandidates();
        let allCandidates = [];

        // Handle both flat array and nested election structure
        if (candidatesData && Array.isArray(candidatesData)) {
          if (candidatesData.length > 0 && candidatesData[0].candidates) {
            // Nested structure - extract candidates from elections
            candidatesData.forEach((election) => {
              if (election.candidates && Array.isArray(election.candidates)) {
                // Add election info to each candidate
                const candidatesWithElection = election.candidates.map(
                  (candidate) => ({
                    ...candidate,
                    electionId: election.id,
                    electionTitle: election.title || election.name,
                    electionStatus: election.status,
                  })
                );
                allCandidates = [...allCandidates, ...candidatesWithElection];
              }
            });
          } else {
            // Flat array structure - try to match with elections
            allCandidates = candidatesData.map((candidate) => {
              const matchingElection = electionsArray.find(
                (election) => election.id === candidate.electionId
              );
              return {
                ...candidate,
                electionTitle:
                  matchingElection?.title ||
                  matchingElection?.name ||
                  "Unknown Election",
                electionStatus: matchingElection?.status || "active",
              };
            });
          }
        }

        if (!allCandidates || allCandidates.length === 0) {
          setCandidates([]);
          setFilteredCandidates([]);
        } else {
          const mappedCandidates = allCandidates.map((cand, index) => ({
            id: cand.id || index.toString(),
            name: cand.name || `Candidate ${index + 1}`,
            position: cand.position || "Candidate",
            imageUrl: cand.imageUrl || null,
            level: cand.level || null,
            campaignPromises: cand.campaignPromises || null,
            electionId: cand.electionId,
            electionTitle: cand.electionTitle,
            electionStatus: cand.electionStatus,
          }));
          setCandidates(mappedCandidates);
          setFilteredCandidates(mappedCandidates);
        }

        // Timer logic (keeping existing code)
        const electionData = await api.getElectionStatus();
        console.log("Fresh election data:", electionData);

        let endDate = null;
        let startDate = null;

        if (
          electionData &&
          Array.isArray(electionData) &&
          electionData.length > 0
        ) {
          const activeElection =
            electionData.find(
              (e) => e.status === "ACTIVE" || e.status === "ONGOING"
            ) || electionData[0];

          endDate = activeElection.endDate
            ? new Date(activeElection.endDate)
            : null;
          startDate = activeElection.startDate
            ? new Date(activeElection.startDate)
            : null;
        } else if (electionData && electionData.endDate) {
          endDate = new Date(electionData.endDate);
          startDate = electionData.startDate
            ? new Date(electionData.startDate)
            : null;
        }

        console.log("Parsed dates:", { startDate, endDate, now: new Date() });

        const updateTimer = () => {
          const now = new Date();

          if (startDate && startDate > now) {
            const timeDiff = startDate - now;
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
              (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
              (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            setTimeRemaining({ days, hours, minutes, seconds });
            return;
          }

          if (endDate && endDate > now) {
            const timeDiff = endDate - now;
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
              (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
              (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
            );
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            setTimeRemaining({ days, hours, minutes, seconds });
            return;
          }

          setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        };

        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);

        return () => clearInterval(timerInterval);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", error.message || "Failed to load data");
        setCandidates([]);
        setFilteredCandidates([]);
        setElections([]);
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    fetchData();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "" || !candidates.length) {
      setFilteredCandidates(candidates);
    } else {
      const filtered = candidates.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(query.toLowerCase()) ||
          candidate.position.toLowerCase().includes(query.toLowerCase()) ||
          (candidate.electionTitle &&
            candidate.electionTitle.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredCandidates(filtered);
    }
  };

  // Group candidates by election
  const groupedCandidates = filteredCandidates.reduce((acc, candidate) => {
    const electionTitle = candidate.electionTitle || "Other Elections";
    if (!acc[electionTitle]) {
      acc[electionTitle] = {
        candidates: [],
        status: candidate.electionStatus || "active",
        electionId: candidate.electionId,
      };
    }
    acc[electionTitle].candidates.push(candidate);
    return acc;
  }, {});

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "ongoing":
        return ["#4ECDC4", "#44A08D"];
      case "completed":
      case "ended":
        return ["#95A5A6", "#7F8C8D"];
      case "upcoming":
        return ["#FFD93D", "#FF9500"];
      default:
        return ["#6C4EF2", "#5A3ED9"];
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "ongoing":
        return "play-circle";
      case "completed":
      case "ended":
        return "checkmark-circle";
      case "upcoming":
        return "time";
      default:
        return "vote";
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14104D" />
      <LinearGradient
        colors={["#14104D", "#1a1461", "#241b7a"]}
        style={styles.headerGradient}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Good day!</Text>
              <Text style={styles.title}>Choose Your Candidate</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Timer Card */}
        <Animated.View style={[styles.timerCard, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={["#6236FF", "#4B2AFA", "#2C1994"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.timerGradient}
          >
            <View style={styles.timerHeader}>
              <View style={styles.timerIconContainer}>
                <Ionicons name="time-outline" size={24} color="#fff" />
              </View>
              <Text style={styles.timerLabel}>Election Countdown</Text>
            </View>
            <View style={styles.timerGrid}>
              <View style={styles.timeBlock}>
                <Text style={styles.timeValue}>{timeRemaining.days}</Text>
                <Text style={styles.timeLabel}>Days</Text>
              </View>
              <View style={styles.timeBlock}>
                <Text style={styles.timeValue}>{timeRemaining.hours}</Text>
                <Text style={styles.timeLabel}>Hours</Text>
              </View>
              <View style={styles.timeBlock}>
                <Text style={styles.timeValue}>{timeRemaining.minutes}</Text>
                <Text style={styles.timeLabel}>Minutes</Text>
              </View>
              <View style={styles.timeBlock}>
                <Text style={styles.timeValue}>{timeRemaining.seconds}</Text>
                <Text style={styles.timeLabel}>Seconds</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#B1A9FF"
            style={styles.searchIcon}
          />
          <TextInput
            placeholder="Search candidates, positions, or elections..."
            placeholderTextColor="#B1A9FF"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <Ionicons
              name="close-circle"
              size={20}
              color="#B1A9FF"
              onPress={() => handleSearch("")}
            />
          )}
        </View>

        {/* Elections and Candidates Section */}
        <View style={styles.candidatesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery
                ? `Search Results (${filteredCandidates.length})`
                : "Elections & Candidates"}
            </Text>
            {!searchQuery && (
              <Text style={styles.candidateCount}>
                {candidates.length} total candidates
              </Text>
            )}
          </View>

          {Object.keys(groupedCandidates).length > 0 ? (
            Object.entries(groupedCandidates).map(
              ([electionTitle, electionData]) => (
                <Animated.View
                  key={electionTitle}
                  style={[
                    styles.electionGroup,
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {/* Election Header */}
                  <View style={styles.electionHeader}>
                    <View style={styles.electionInfo}>
                      <View style={styles.electionIconContainer}>
                        <Ionicons
                          name={getStatusIcon(electionData.status)}
                          size={20}
                          color="#4ECDC4"
                        />
                      </View>
                      <View style={styles.electionDetails}>
                        <Text style={styles.electionTitle}>
                          {electionTitle}
                        </Text>
                        <Text style={styles.candidateCount}>
                          {electionData.candidates.length} candidate
                          {electionData.candidates.length !== 1 ? "s" : ""}
                        </Text>
                      </View>
                    </View>
                    <LinearGradient
                      colors={getStatusColor(electionData.status)}
                      style={styles.statusBadge}
                    >
                      <Text style={styles.statusText}>
                        {electionData.status?.charAt(0).toUpperCase() +
                          electionData.status?.slice(1) || "Active"}
                      </Text>
                    </LinearGradient>
                  </View>

                  {/* Candidates for this election */}
                  {electionData.candidates.map((candidate, index) => (
                    <View key={candidate.id} style={styles.candidateWrapper}>
                      <CandidateCard
                        name={candidate.name}
                        position={candidate.position}
                        imageUrl={candidate.imageUrl}
                        navigation={navigation}
                        candidateId={candidate.id}
                      />
                    </View>
                  ))}
                </Animated.View>
              )
            )
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="person-outline" size={64} color="#6236FF" />
              <Text style={styles.emptyTitle}>No candidates found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Candidates will appear here once added"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14104D",
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    color: "#B1A9FF",
    fontSize: 14,
    fontWeight: "500",
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 4,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#14104D",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  timerCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  timerGradient: {
    padding: 24,
  },
  timerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  timerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  timerLabel: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  timerGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeBlock: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 60,
  },
  timeValue: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  timeLabel: {
    color: "#E8E3FF",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(177, 169, 255, 0.2)",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#ffffff",
  },
  candidatesSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  candidateCount: {
    fontSize: 14,
    color: "#B1A9FF",
    fontWeight: "500",
  },
  electionGroup: {
    marginBottom: 24,
  },
  electionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  electionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  electionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(76, 205, 196, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  electionDetails: {
    flex: 1,
  },
  electionTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  candidateWrapper: {
    marginBottom: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#B1A9FF",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
