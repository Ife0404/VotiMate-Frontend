// screens/CandidateScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  StatusBar,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ConfirmationScreen from "./ConfirmationScreen";
import * as api from "../services/api";

const CandidateScreen = ({ navigation, route }) => {
  const { candidateId } = route.params || { candidateId: "1" };
  const [modalVisible, setModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [electionId, setElectionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setImageLoadError(false);
      try {
        // Fetch candidates first
        const candidates = await api.getCandidates();

        const selectedCandidate = candidates.find(
          (cand) => cand.id === candidateId
        );

        if (!selectedCandidate) {
          throw new Error("Candidate not found");
        }
        setCandidate(selectedCandidate);

        // Try to get election ID from candidate data
        let electionIdToUse = null;

        // Check multiple possible election ID sources
        if (selectedCandidate.election?.id) {
          electionIdToUse = selectedCandidate.election.id;
        } else if (selectedCandidate.electionId) {
          electionIdToUse = selectedCandidate.electionId;
        } else if (selectedCandidate.election_id) {
          electionIdToUse = selectedCandidate.election_id;
        }

        // If we got an election ID from candidate, use it
        if (electionIdToUse) {
          setElectionId(electionIdToUse);
        } else {
          // Fallback: Get active elections and use the first one
          // This is not ideal but works as a fallback
          try {
            const activeElections = await api.getActiveElections();
            if (activeElections && activeElections.length > 0) {
              electionIdToUse = activeElections[0].id;
              setElectionId(electionIdToUse);
            } else {
              throw new Error("No active elections found");
            }
          } catch (activeElectionsError) {
            // If getActiveElections fails, try getting all elections
            try {
              const allElections = await api.getAllElections();
              if (allElections && allElections.length > 0) {
                // Find the most recent election (assuming higher ID = more recent)
                const mostRecentElection = allElections.reduce(
                  (latest, current) =>
                    current.id > latest.id ? current : latest
                );
                electionIdToUse = mostRecentElection.id;
                setElectionId(electionIdToUse);
              } else {
                throw new Error("No elections found");
              }
            } catch (allElectionsError) {
              throw new Error(
                "Unable to determine election for this candidate"
              );
            }
          }
        }
      } catch (error) {
        Alert.alert(
          "Error",
          error.message || "Failed to load candidate details"
        );
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [candidateId, navigation]);

  const handleVote = () => {
    if (candidate && electionId) {
      setModalVisible(true);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleVoteError = (error) => {
    console.log("Handling vote error:", error);

    // Check specifically for "already voted" error
    if (
      error.status === 400 &&
      error.details &&
      (error.details.includes("already voted") ||
        error.details.includes("already cast") ||
        error.details.includes("duplicate vote"))
    ) {
      // Show custom error modal for already voted
      setErrorModalVisible(true);
    } else {
      // Show generic error alert for all other errors (including voting period errors)
      Alert.alert(
        "Error",
        error.details ||
          error.message ||
          "Failed to submit vote. Please try again."
      );
    }
  };

  const handleErrorModalClose = () => {
    setErrorModalVisible(false);
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#14104D" />
        <LinearGradient
          colors={["#14104D", "#1a1461", "#241b7a"]}
          style={styles.loadingGradient}
        >
          <View style={styles.loadingContent}>
            <View style={styles.loadingSpinner}>
              <Ionicons name="person-outline" size={32} color="#B1A9FF" />
            </View>
            <Text style={styles.loadingText}>Loading candidate...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (!candidate) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14104D" />

      {/* Header with gradient */}
      <LinearGradient
        colors={["#14104D", "#1a1461", "#241b7a"]}
        style={styles.headerGradient}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backButtonContainer}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        <Animated.View style={[styles.profileSection, { opacity: fadeAnim }]}>
          {candidate.imageUrl && !imageLoadError ? (
            <Image
              source={{ uri: candidate.imageUrl }}
              style={styles.profileImage}
              onError={() => setImageLoadError(true)}
              onLoad={() => setImageLoadError(false)}
            />
          ) : (
            <LinearGradient
              colors={["#6236FF", "#4B2AFA"]}
              style={styles.profileImagePlaceholder}
            >
              <Text style={styles.initials}>{getInitials(candidate.name)}</Text>
            </LinearGradient>
          )}

          <Text style={styles.candidateName}>{candidate.name}</Text>
          <View style={styles.positionBadge}>
            <Text style={styles.positionText}>
              {candidate.position || "Candidate"}
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.detailsContainer, { opacity: fadeAnim }]}>
          {/* Vote Button */}
          <TouchableOpacity
            style={styles.voteButton}
            onPress={handleVote}
            disabled={!candidate || !electionId}
          >
            <LinearGradient
              colors={["#6236FF", "#4B2AFA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.voteButtonGradient}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#fff"
                style={styles.voteIcon}
              />
              <Text style={styles.voteButtonText}>Vote Now</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Details Cards */}
          <View style={styles.detailsGrid}>
            {/* Level Card */}
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Ionicons name="bar-chart-outline" size={20} color="#6236FF" />
                <Text style={styles.detailLabel}>Level</Text>
              </View>
              <Text style={styles.detailValue}>
                {candidate.level || "Not specified"}
              </Text>
            </View>

            {/* Position Card */}
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <Ionicons name="ribbon-outline" size={20} color="#6236FF" />
                <Text style={styles.detailLabel}>Position</Text>
              </View>
              <Text style={styles.detailValue}>
                {candidate.position || "Not specified"}
              </Text>
            </View>

            {/* Campaign Promises Card */}
            <View style={[styles.detailCard, styles.fullWidthCard]}>
              <View style={styles.detailHeader}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#6236FF"
                />
                <Text style={styles.detailLabel}>Campaign Promises</Text>
              </View>
              <Text style={styles.detailValue}>
                {candidate.campaignPromises ||
                  "No campaign promises have been shared yet. Check back later for updates on this candidate's platform and commitments."}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationScreen
        visible={modalVisible}
        onCancel={handleCancel}
        onError={handleVoteError}
        candidateId={candidateId}
        electionId={electionId}
        navigation={navigation}
      />

      {/* Error Modal for Already Voted */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={errorModalVisible}
        onRequestClose={handleErrorModalClose}
      >
        <View style={styles.errorModalOverlay}>
          <View style={styles.errorModalContainer}>
            <LinearGradient
              colors={["#FF6B6B", "#FF5252"]}
              style={styles.errorIconContainer}
            >
              <Ionicons name="close-circle" size={40} color="#fff" />
            </LinearGradient>

            <Text style={styles.errorModalTitle}>Already Voted</Text>
            <Text style={styles.errorModalMessage}>
              You have already cast your vote in this election. Each voter is
              allowed only one vote per election.
            </Text>

            <TouchableOpacity
              style={styles.errorModalButton}
              onPress={handleErrorModalClose}
            >
              <LinearGradient
                colors={["#6236FF", "#4B2AFA"]}
                style={styles.errorModalButtonGradient}
              >
                <Text style={styles.errorModalButtonText}>Understood</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  },
  loadingGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingText: {
    color: "#B1A9FF",
    fontSize: 16,
    fontWeight: "500",
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileSection: {
    alignItems: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  initials: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
  },
  candidateName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  positionBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(177, 169, 255, 0.3)",
  },
  positionText: {
    color: "#B1A9FF",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  detailsContainer: {
    padding: 20,
  },
  voteButton: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#6236FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  voteButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  voteIcon: {
    marginRight: 8,
  },
  voteButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  detailsGrid: {
    gap: 16,
  },
  detailCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(177, 169, 255, 0.1)",
  },
  fullWidthCard: {
    width: "100%",
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  detailValue: {
    color: "#E8E3FF",
    fontSize: 15,
    lineHeight: 22,
  },
  // Error Modal Styles
  errorModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorModalContainer: {
    backgroundColor: "#1E1B4B",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    maxWidth: 350,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  errorModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  errorModalMessage: {
    fontSize: 16,
    color: "#E8E3FF",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
  },
  errorModalButton: {
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
  },
  errorModalButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  errorModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default CandidateScreen;
