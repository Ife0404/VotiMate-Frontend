import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  getElections,
  deleteElection,
  updateElection,
  getResultsByElection,
} from "../services/api";

const ElectionManagementScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const filterOptions = [
    { key: "all", label: "All" },
    { key: "ACTIVE", label: "Active" },
    { key: "UPCOMING", label: "Upcoming" },
    { key: "COMPLETED", label: "Completed" },
  ];

  // Map backend status to display status
  const mapElectionStatus = (election) => {
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);

    if (now < startDate) {
      return "upcoming";
    } else if (now >= startDate && now <= endDate) {
      return "active";
    } else {
      return "completed";
    }
  };

  // Get vote count for an election
  const getVoteCountForElection = async (electionId) => {
    try {
      const results = await getResultsByElection(electionId);
      // Sum up all votes from all candidates in this election
      if (results && Array.isArray(results)) {
        return results.reduce(
          (total, candidate) => total + (candidate.voteCount || 0),
          0
        );
      }
      return 0;
    } catch (error) {
      console.log(`No results found for election ${electionId}:`, error);
      return 0;
    }
  };

  // Transform backend data to match UI expectations
  const transformElectionData = async (backendElections) => {
    const transformedElections = await Promise.all(
      backendElections.map(async (election) => {
        const voteCount = await getVoteCountForElection(election.id);

        return {
          id: election.id,
          title: election.name,
          startDate: election.startDate?.split("T")[0] || election.startDate,
          endDate: election.endDate?.split("T")[0] || election.endDate,
          status: mapElectionStatus(election),
          candidatesCount: election.candidates?.length || 0,
          votersCount: voteCount, // Actual vote count instead of total registered voters
          backendStatus: election.status,
          originalData: election,
        };
      })
    );

    return transformedElections;
  };

  // Fetch elections from backend
  const fetchElections = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await getElections();
      console.log("Fetched elections:", response);

      // Handle both array response and object with data property
      const electionsArray = Array.isArray(response)
        ? response
        : response.data || [];
      const transformedElections = await transformElectionData(electionsArray);

      setElections(transformedElections);
    } catch (error) {
      console.error("Error fetching elections:", error);
      setError(error.message || "Failed to fetch elections");

      // Show user-friendly error
      Alert.alert(
        "Connection Error",
        "Unable to fetch elections. Please check your connection and try again.",
        [
          { text: "Retry", onPress: () => fetchElections() },
          { text: "Cancel", style: "cancel" },
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchElections(false);
  };

  // Load elections on component mount
  useEffect(() => {
    fetchElections();
  }, []);

  // Handle election deletion
  const handleDeleteElection = (election) => {
    Alert.alert(
      "Delete Election",
      `Are you sure you want to delete "${election.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const result = await deleteElection(election.id);

              if (result.success) {
                // Remove from local state
                setElections(elections.filter((e) => e.id !== election.id));
                Alert.alert("Success", "Election deleted successfully");
              } else {
                Alert.alert(
                  "Error",
                  result.message || "Failed to delete election"
                );
              }
            } catch (error) {
              console.error("Delete election error:", error);
              Alert.alert(
                "Error",
                error.message || "Failed to delete election"
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Handle view results navigation
  const handleViewResults = (election) => {
    navigation.navigate("ChartView", {
      electionId: election.id,
      electionName: election.title,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return ["#4ECDC4", "#44A08D"];
      case "upcoming":
        return ["#FFD93D", "#FF9500"];
      case "completed":
        return ["#95A5A6", "#7F8C8D"];
      default:
        return ["#6C4EF2", "#5A3ED9"];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return "play-circle";
      case "upcoming":
        return "time";
      case "completed":
        return "checkmark-circle";
      default:
        return "ballot";
    }
  };

  // Filter elections based on search and filter selection
  const filteredElections = elections.filter((election) => {
    const matchesSearch = election.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "ACTIVE" && election.status === "active") ||
      (selectedFilter === "UPCOMING" && election.status === "upcoming") ||
      (selectedFilter === "COMPLETED" && election.status === "completed");

    return matchesSearch && matchesFilter;
  });

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading && elections.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#14104D" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C4EF2" />
          <Text style={styles.loadingText}>Loading elections...</Text>
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
          onPress={() => navigation.navigate("CreateElection")}
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
        <Text style={styles.screenTitle}>Election Management</Text>
        <Text style={styles.screenSubtitle}>
          Manage all elections ({elections.length})
        </Text>
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
            placeholder="Search elections..."
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
            tintColor="#6C4EF2"
            colors={["#6C4EF2"]}
          />
        }
      >
        {loading && elections.length > 0 && (
          <View style={styles.refreshingIndicator}>
            <ActivityIndicator size="small" color="#6C4EF2" />
            <Text style={styles.refreshingText}>Updating...</Text>
          </View>
        )}

        {filteredElections.map((election) => (
          <View key={election.id} style={styles.electionCard}>
            <View style={styles.electionHeader}>
              <View style={styles.electionTitleRow}>
                <Text style={styles.electionTitle}>{election.title}</Text>
                <View style={styles.statusContainer}>
                  <LinearGradient
                    colors={getStatusColor(election.status)}
                    style={styles.statusBadge}
                  >
                    <Ionicons
                      name={getStatusIcon(election.status)}
                      size={12}
                      color="#fff"
                      style={styles.statusIcon}
                    />
                    <Text style={styles.statusText}>
                      {election.status.charAt(0).toUpperCase() +
                        election.status.slice(1)}
                    </Text>
                  </LinearGradient>
                </View>
              </View>
            </View>

            <View style={styles.electionDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {formatDate(election.startDate)} -{" "}
                  {formatDate(election.endDate)}
                </Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={16} color="#6C4EF2" />
                  <Text style={styles.statText}>
                    {election.candidatesCount} Candidates
                  </Text>
                </View>
                {/* <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#4ECDC4" />
                  <Text style={styles.statText}>
                    {election.votersCount} Votes Cast
                  </Text>
                </View> */}
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  navigation.navigate("EditElection", {
                    electionId: election.id,
                    onUpdate: fetchElections,
                  })
                }
              >
                <Ionicons name="create" size={20} color="#4ECDC4" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.viewButton]}
                onPress={() => handleViewResults(election)}
              >
                <Ionicons name="bar-chart" size={20} color="#FFD93D" />
                <Text style={[styles.actionButtonText, styles.viewButtonText]}>
                  View
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteElection(election)}
                disabled={loading}
              >
                <Ionicons name="trash" size={20} color="#FF6B6B" />
                <Text
                  style={[styles.actionButtonText, styles.deleteButtonText]}
                >
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredElections.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={error ? "cloud-offline" : "ballot"}
              size={64}
              color="#666"
            />
            <Text style={styles.emptyTitle}>
              {error ? "Connection Error" : "No Elections Found"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {error
                ? "Unable to load elections. Pull down to retry."
                : searchQuery
                ? "Try adjusting your search"
                : "Create your first election"}
            </Text>
            {error && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchElections()}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            )}
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
    marginTop: 12,
    fontSize: 16,
  },
  refreshingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginBottom: 10,
  },
  refreshingText: {
    color: "#6C4EF2",
    marginLeft: 8,
    fontSize: 14,
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
  electionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  electionHeader: {
    marginBottom: 16,
  },
  electionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  electionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginRight: 12,
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
  electionDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    color: "#B8B8B8",
    fontSize: 14,
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
    marginHorizontal: 2,
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 6,
    fontWeight: "500",
  },
  viewButton: {
    backgroundColor: "rgba(255, 217, 61, 0.1)",
  },
  viewButtonText: {
    color: "#FFD93D",
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
  },
  retryButton: {
    backgroundColor: "#6C4EF2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ElectionManagementScreen;
