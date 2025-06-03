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
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const CandidateManagementScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Sample candidates data - replace with actual data from your backend
  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: "John Doe",
      campaignPromises:
        "Improve campus facilities, enhance student services, and promote academic excellence",
      electionId: 1,
      electionTitle: "Student Union President 2025",
      profileImage: "https://via.placeholder.com/60",
      status: "active",
      votesCount: 245,
    },
    {
      id: 2,
      name: "Jane Smith",
      campaignPromises:
        "Modernize campus infrastructure, create more study spaces, and improve dining options",
      electionId: 1,
      electionTitle: "Student Union President 2025",
      profileImage: "https://via.placeholder.com/60",
      status: "active",
      votesCount: 189,
    },
    {
      id: 3,
      name: "Mike Johnson",
      campaignPromises:
        "Increase student welfare programs, reduce fees, and enhance career services",
      electionId: 1,
      electionTitle: "Student Union President 2025",
      profileImage: "https://via.placeholder.com/60",
      status: "active",
      votesCount: 156,
    },
    {
      id: 4,
      name: "Dr. Sarah Wilson",
      campaignPromises:
        "Improve faculty-student relations, enhance research opportunities, and modernize curriculum",
      electionId: 2,
      electionTitle: "Faculty Representative Election",
      profileImage: "https://via.placeholder.com/60",
      status: "active",
      votesCount: 78,
    },
    {
      id: 5,
      name: "Alex Rodriguez",
      campaignPromises:
        "Upgrade sports facilities, create more athletic programs, and promote sports scholarships",
      electionId: 3,
      electionTitle: "Sports Director Election",
      profileImage: "https://via.placeholder.com/60",
      status: "completed",
      votesCount: 234,
    },
  ]);

  // Get unique elections for filter(Longer version for future purposes)
  // const getUniqueElections = () => {
  //   const seen = new Set();
  //   return candidates
  //     .filter((candidate) => {
  //       const key = `${candidate.electionId}-${candidate.electionTitle}`;
  //       if (seen.has(key)) {
  //         return false;
  //       }
  //       seen.add(key);
  //       return true;
  //     })
  //     .map((candidate) => ({
  //       id: candidate.electionId,
  //       title: candidate.electionTitle,
  //     }));
  // };
  // const elections = getUniqueElections();

  // Extract unique elections from candidates(shorter version)
  const elections = candidates.reduce((unique, candidate) => {
    const exists = unique.find(
      (election) => election.id === candidate.electionId
    );
    if (!exists) {
      unique.push({
        id: candidate.electionId,
        title: candidate.electionTitle,
      });
    }
    return unique;
  }, []);
  
  const filterOptions = [
    { key: "all", label: "All Elections" },
    ...elections.map((election) => ({
      key: election.id.toString(),
      label:
        election.title.length > 20
          ? election.title.substring(0, 20) + "..."
          : election.title,
    })),
  ];

  const getStatusColor = (status) => {
    switch (status) {
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
    switch (status) {
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
          onPress: () => {
            setCandidates(candidates.filter((c) => c.id !== candidate.id));
            Alert.alert("Success", "Candidate deleted successfully");
          },
        },
      ]
    );
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.campaignPromises
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      candidate.electionTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      candidate.electionId.toString() === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  // Group candidates by election
  const groupedCandidates = filteredCandidates.reduce((acc, candidate) => {
    const electionTitle = candidate.electionTitle;
    if (!acc[electionTitle]) {
      acc[electionTitle] = [];
    }
    acc[electionTitle].push(candidate);
    return acc;
  }, {});

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
        <Text style={styles.screenSubtitle}>Manage all candidates</Text>
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                        <Image
                          source={{ uri: candidate.profileImage }}
                          style={styles.profileImage}
                        />
                        <View style={styles.candidateDetails}>
                          <Text style={styles.candidateName}>
                            {candidate.name}
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
                            {candidate.status.charAt(0).toUpperCase() +
                              candidate.status.slice(1)}
                          </Text>
                        </LinearGradient>
                      </View>
                    </View>

                    <View style={styles.candidateStats}>
                      <View style={styles.statItem}>
                        <Ionicons name="thumbs-up" size={16} color="#6C4EF2" />
                        <Text style={styles.statText}>
                          {candidate.votesCount} votes
                        </Text>
                      </View>
                    </View>

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() =>
                          navigation.navigate("EditCandidate", { candidate })
                        }
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
                ? "Try adjusting your search"
                : "Add candidates to get started"}
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
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
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

export default CandidateManagementScreen;
