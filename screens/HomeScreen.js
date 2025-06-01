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
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [fadeAnim] = useState(new Animated.Value(0));

  // Updated useEffect in HomeScreen.js
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Add cache-busting timestamp to force fresh data
        const timestamp = new Date().getTime();

        const candidatesData = await api.getCandidates();
        let allCandidates = [];

        // Handle both flat array and nested election structure
        if (candidatesData && Array.isArray(candidatesData)) {
          if (candidatesData.length > 0 && candidatesData[0].candidates) {
            // Nested structure - extract candidates from elections
            candidatesData.forEach((election) => {
              if (election.candidates && Array.isArray(election.candidates)) {
                allCandidates = [...allCandidates, ...election.candidates];
              }
            });
          } else {
            // Flat array structure
            allCandidates = candidatesData;
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
          }));
          setCandidates(mappedCandidates);
          setFilteredCandidates(mappedCandidates);
        }

        // Force fresh election data
        const electionData = await api.getElectionStatus();
        console.log("Fresh election data:", electionData); // Debug log

        // Handle nested election data structure
        let endDate = null;
        let startDate = null;

        if (
          electionData &&
          Array.isArray(electionData) &&
          electionData.length > 0
        ) {
          // If it's an array of elections, find the active one or use the first one
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
          // If it's a flat object with endDate
          endDate = new Date(electionData.endDate);
          startDate = electionData.startDate
            ? new Date(electionData.startDate)
            : null;
        }

        console.log("Parsed dates:", { startDate, endDate, now: new Date() }); // Debug log

        const updateTimer = () => {
          const now = new Date();

          // If we have a start date and it's in the future, count down to start
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

          // If we have an end date and it's in the future, count down to end
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

          // Election has ended or no valid dates
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
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    fetchData();

    // Fade in animation
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
          candidate.position.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCandidates(filtered);
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
            placeholder="Search candidates or positions..."
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

        {/* Candidates Section */}
        <View style={styles.candidatesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery
                ? `Search Results (${filteredCandidates.length})`
                : "All Candidates"}
            </Text>
            {!searchQuery && (
              <Text style={styles.candidateCount}>
                {candidates.length} total
              </Text>
            )}
          </View>

          {filteredCandidates.length > 0 ? (
            filteredCandidates.map((candidate, index) => (
              <Animated.View
                key={candidate.id}
                style={[
                  styles.candidateWrapper,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <CandidateCard
                  name={candidate.name}
                  position={candidate.position}
                  imageUrl={candidate.imageUrl}
                  navigation={navigation}
                  candidateId={candidate.id}
                />
              </Animated.View>
            ))
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
    backgroundColor: "#14104D", // Changed to consistent background
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
  notificationBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#14104D", // Changed to consistent background
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
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Changed to semi-transparent for dark background
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(177, 169, 255, 0.2)", // Added subtle border
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#ffffff", // Changed to white for visibility on dark background
  },
  candidatesSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff", // Changed to white for visibility
  },
  candidateCount: {
    fontSize: 14,
    color: "#B1A9FF", // Changed to lighter purple for better contrast
    fontWeight: "500",
  },
  candidateWrapper: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff", // Changed to white for visibility
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#B1A9FF", // Changed to lighter purple for better contrast
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
