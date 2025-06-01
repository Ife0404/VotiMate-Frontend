import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const ElectionManagementScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Sample elections data - replace with actual data from your backend
  const [elections, setElections] = useState([
    {
      id: 1,
      title: "Student Union President 2025",
      campaignPromises:
        "Comprehensive election for the next student union president with focus on campus improvements",
      startDate: "2025-06-15",
      endDate: "2025-06-16",
      status: "upcoming",
      candidatesCount: 5,
      votersCount: 847,
    },
    {
      id: 2,
      title: "Faculty Representative Election",
      campaignPromises:
        "Selecting faculty representative for academic committee with emphasis on curriculum enhancement",
      startDate: "2025-06-10",
      endDate: "2025-06-11",
      status: "active",
      candidatesCount: 3,
      votersCount: 234,
    },
    {
      id: 3,
      title: "Sports Director Election",
      campaignPromises:
        "Choosing new sports director to oversee athletic programs and facility management",
      startDate: "2025-05-20",
      endDate: "2025-05-21",
      status: "completed",
      candidatesCount: 4,
      votersCount: 567,
    },
  ]);

  const filterOptions = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
  ];

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

  const handleDeleteElection = (election) => {
    Alert.alert(
      "Delete Election",
      `Are you sure you want to delete "${election.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setElections(elections.filter((e) => e.id !== election.id));
            Alert.alert("Success", "Election deleted successfully");
          },
        },
      ]
    );
  };

  const filteredElections = elections.filter((election) => {
    const matchesSearch =
      election.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      election.campaignPromises
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" || election.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

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
        <Text style={styles.screenSubtitle}>Manage all elections</Text>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
              <Text style={styles.electionCampaignPromises}>
                {election.campaignPromises}
              </Text>
            </View>

            <View style={styles.electionDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {election.startDate} - {election.endDate}
                </Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={16} color="#6C4EF2" />
                  <Text style={styles.statText}>
                    {election.candidatesCount} Candidates
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="person" size={16} color="#FF6B6B" />
                  <Text style={styles.statText}>
                    {election.votersCount} Voters
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  navigation.navigate("EditElection", { election })
                }
              >
                <Ionicons name="create" size={20} color="#4ECDC4" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteElection(election)}
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

        {filteredElections.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="ballot" size={64} color="#666" />
            <Text style={styles.emptyTitle}>No Elections Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Try adjusting your search"
                : "Create your first election"}
            </Text>
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
  electionCampaignPromises: {
    color: "#B8B8B8",
    fontSize: 14,
    lineHeight: 20,
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
  },
});

export default ElectionManagementScreen;
