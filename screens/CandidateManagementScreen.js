import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { getCandidates, getElections, deleteCandidate } from "../services/api";

const CandidateManagementScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  };

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching candidates and elections...");

      // Fetch elections and candidates
      const [electionsResponse, candidatesResponse] = await Promise.all([
        getElections(),
        getCandidates(),
      ]);

      console.log("Elections Response:", electionsResponse);
      console.log("Candidates Response:", candidatesResponse);

      // Handle elections response
      const electionsData = Array.isArray(electionsResponse)
        ? electionsResponse
        : [];
      setElections(electionsData);

      // Handle candidates response
      const candidatesData = Array.isArray(candidatesResponse)
        ? candidatesResponse
        : [];

      // Transform candidates data to match your existing structure
      const transformedCandidates = candidatesData.map((candidate) => {
        // Try different possible field names for vote count
        const votesCount =
          candidate.votesCount ||
          candidate.votes_count ||
          candidate.totalVotes ||
          candidate.vote_count ||
          candidate.voteCount ||
          0;

        console.log(
          `Candidate ${candidate.name} votes:`,
          votesCount,
          "Raw candidate data:",
          candidate
        );

        return {
          id: candidate.id,
          name: candidate.name,
          campaignPromises:
            candidate.manifesto ||
            candidate.campaignPromises ||
            "No manifesto provided",
          manifesto:
            candidate.manifesto ||
            candidate.campaignPromises ||
            "No manifesto provided",
          electionId: candidate.electionId,
          electionTitle: candidate.electionName || "Unknown Election",
          profileImage:
            candidate.profileImageUrl || candidate.profileImage || null,
          status: candidate.status || "active",
          votesCount: votesCount,
          position: candidate.position || "Unknown Position",
          level: candidate.level || 1,
          createdAt: candidate.createdAt,
          updatedAt: candidate.updatedAt,
        };
      });

      setCandidates(transformedCandidates);
      console.log("Transformed candidates:", transformedCandidates);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to load data");

      Alert.alert(
        "Error",
        `Failed to load candidates: ${
          error.message || "Please check your connection and try again."
        }`
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data on component mount and when screen comes into focus
  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Pull to refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  // Create filter options based on fetched elections
  const filterOptions = [
    { key: "all", label: "All Elections" },
    ...elections.map((election) => ({
      key: election.id.toString(),
      label:
        election.name && election.name.length > 20
          ? election.name.substring(0, 20) + "..."
          : election.name || "Unknown Election",
    })),
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return ["#4ECDC4", "#44A08D"];
      case "completed":
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
        return "play-circle";
      case "completed":
        return "checkmark-circle";
      case "upcoming":
        return "time";
      default:
        return "person";
    }
  };

  const handleDeleteCandidate = (candidate) => {
    Alert.alert(
      "Delete Candidate",
      `Are you sure you want to delete "${candidate.name}" from "${candidate.electionTitle}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Deleting candidate:", candidate.id);

              // Call the delete API
              const result = await deleteCandidate(candidate.id);

              if (result.success) {
                // Remove from local state immediately for better UX
                setCandidates((prevCandidates) =>
                  prevCandidates.filter((c) => c.id !== candidate.id)
                );

                Alert.alert(
                  "Success",
                  result.message || "Candidate deleted successfully"
                );

                // Refresh data from backend to ensure consistency
                await fetchData();
              } else {
                Alert.alert(
                  "Error",
                  result.message || "Failed to delete candidate"
                );
              }
            } catch (error) {
              console.error("Error deleting candidate:", error);
              Alert.alert(
                "Error",
                error.message || "Failed to delete candidate. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name &&
      (candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.campaignPromises
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        candidate.electionTitle
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));

    const matchesFilter =
      selectedFilter === "all" ||
      candidate.electionId?.toString() === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  // Group candidates by election
  const groupedCandidates = filteredCandidates.reduce((acc, candidate) => {
    const electionTitle = candidate.electionTitle || "Unknown Election";
    if (!acc[electionTitle]) {
      acc[electionTitle] = [];
    }
    acc[electionTitle].push(candidate);
    return acc;
  }, {});

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#14104D" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Loading candidates...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14104D" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonRow}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("CreateCandidate")}
        >
          <LinearGradient
            colors={["#4ECDC4", "#44A08D"]}
            style={styles.addButtonGradient}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>Candidate Management</Text>
        <Text style={styles.screenSubtitle}>
          Manage all candidates ({candidates.length} total)
        </Text>
        {error && <Text style={styles.errorText}>⚠️ {error}</Text>}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search candidates..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterChip,
                selectedFilter === option.key && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(option.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === option.key && styles.filterChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4ECDC4"]}
            tintColor="#4ECDC4"
          />
        }
      >
        {Object.keys(groupedCandidates).length > 0 ? (
          Object.entries(groupedCandidates).map(
            ([electionTitle, electionCandidates]) => (
              <View key={electionTitle} style={styles.electionGroup}>
                <View style={styles.electionGroupHeader}>
                  <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                  <Text style={styles.electionGroupTitle}>{electionTitle}</Text>
                  <Text style={styles.candidateCount}>
                    {electionCandidates.length} candidate
                    {electionCandidates.length !== 1 ? "s" : ""}
                  </Text>
                </View>

                {electionCandidates.map((candidate) => (
                  <View key={candidate.id} style={styles.candidateCard}>
                    <View style={styles.candidateHeader}>
                      <View style={styles.candidateInfo}>
                        {candidate.profileImage ? (
                          <Image
                            source={{ uri: candidate.profileImage }}
                            style={styles.profileImage}
                            onError={(e) => {
                              console.log(
                                "Image load error:",
                                e.nativeEvent.error
                              );
                            }}
                          />
                        ) : (
                          <View style={styles.initialsContainer}>
                            <Text style={styles.initialsText}>
                              {getInitials(candidate.name)}
                            </Text>
                          </View>
                        )}
                        <View style={styles.candidateDetails}>
                          <Text style={styles.candidateName}>
                            {candidate.name}
                          </Text>
                          <Text style={styles.candidatePosition}>
                            {candidate.position}
                          </Text>
                          <Text
                            style={styles.candidateCampaignPromises}
                            numberOfLines={2}
                          >
                            {candidate.campaignPromises}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.statusContainer}>
                        <LinearGradient
                          colors={getStatusColor(candidate.status)}
                          style={styles.statusBadge}
                        >
                          <Ionicons
                            name={getStatusIcon(candidate.status)}
                            size={12}
                            color="#fff"
                            style={styles.statusIcon}
                          />
                          <Text style={styles.statusText}>
                            {candidate.status?.charAt(0).toUpperCase() +
                              candidate.status?.slice(1) || "Active"}
                          </Text>
                        </LinearGradient>
                      </View>
                    </View>

                    <View style={styles.candidateStats}>
                      {/* <View style={styles.statItem}>
                        <Ionicons name="thumbs-up" size={16} color="#6C4EF2" />
                        <Text style={styles.statText}>
                          {candidate.votesCount} votes
                        </Text>
                      </View> */}
                      <View style={styles.statItem}>
                        <Ionicons name="school" size={16} color="#4ECDC4" />
                        <Text style={styles.statText}>
                          Level {candidate.level || 1}
                        </Text>
                      </View>
                      {/* <View style={styles.statItem}>
                        <Ionicons name="person" size={16} color="#FFD93D" />
                        <Text style={styles.statText}>ID: {candidate.id}</Text>
                      </View> */}
                    </View>

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          console.log("Candidate ID:", candidate.id);
                          console.log("Full candidate object:", candidate);

                          if (!candidate.id) {
                            Alert.alert(
                              "Error",
                              "Candidate ID is missing. Cannot edit this candidate."
                            );
                            return;
                          }

                          navigation.navigate("EditCandidate", {
                            candidateId: candidate.id,
                          });
                        }}
                      >
                        <Ionicons name="create" size={20} color="#4ECDC4" />
                        <Text style={styles.actionButtonText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteCandidate(candidate)}
                      >
                        <Ionicons name="trash" size={20} color="#FF6B6B" />
                        <Text
                          style={[
                            styles.actionButtonText,
                            styles.deleteButtonText,
                          ]}
                        >
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )
          )
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={64} color="#666" />
            <Text style={styles.emptyTitle}>No Candidates Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Try adjusting your search or filter"
                : "Add candidates to get started"}
            </Text>
            <TouchableOpacity
              style={styles.addCandidateButton}
              onPress={() => navigation.navigate("CreateCandidate")}
            >
              <LinearGradient
                colors={["#4ECDC4", "#44A08D"]}
                style={styles.addCandidateButtonGradient}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addCandidateButtonText}>Add Candidate</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14104D",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButtonRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
  },
  addButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  addButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  screenTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
  screenSubtitle: {
    color: "#B8B8B8",
    fontSize: 16,
    marginTop: 4,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: 8,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    padding: 8,
    borderRadius: 6,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#333",
  },
  filterContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  filterChip: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  filterChipActive: {
    backgroundColor: "#6C4EF2",
  },
  filterChipText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  electionGroup: {
    marginBottom: 24,
  },
  electionGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  electionGroupTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginLeft: 8,
  },
  candidateCount: {
    color: "#B8B8B8",
    fontSize: 14,
  },
  candidateCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  candidateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  candidateInfo: {
    flexDirection: "row",
    flex: 1,
    marginRight: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  initialsContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4ECDC4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  initialsText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  candidateDetails: {
    flex: 1,
  },
  candidateName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  candidatePosition: {
    color: "#4ECDC4",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  candidateCampaignPromises: {
    color: "#B8B8B8",
    fontSize: 14,
    lineHeight: 18,
    marginTop: 4,
  },
  statusContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  candidateStats: {
    flexDirection: "row",
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  statText: {
    color: "#B8B8B8",
    fontSize: 14,
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 6,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
  deleteButtonText: {
    color: "#FF6B6B",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
  },
  emptySubtitle: {
    color: "#B8B8B8",
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
    marginBottom: 24,
  },
  addCandidateButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  addCandidateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addCandidateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default CandidateManagementScreen;
