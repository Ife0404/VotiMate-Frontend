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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ConfirmationScreen from "./ConfirmationScreen";
import * as api from "../services/api";

const CandidateScreen = ({ navigation, route }) => {
  const { candidateId } = route.params || { candidateId: "1" };
  const [modalVisible, setModalVisible] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchCandidate = async () => {
      setLoading(true);
      setImageLoadError(false);
      try {
        const candidates = await api.getCandidates();
        const selectedCandidate = candidates.find(
          (cand) => cand.id === candidateId
        );
        if (!selectedCandidate) {
          throw new Error("Candidate not found");
        }
        setCandidate(selectedCandidate);
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

    fetchCandidate();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [candidateId, navigation]);

  const handleVote = () => {
    if (candidate) {
      setModalVisible(true);
    }
  };

  const handleCancel = () => {
    setModalVisible(false);
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
            disabled={!candidate}
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

      <ConfirmationScreen
        visible={modalVisible}
        onCancel={handleCancel}
        candidateId={candidateId}
        navigation={navigation}
      />
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
});

export default CandidateScreen;
