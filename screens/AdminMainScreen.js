import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getElections, getCandidates } from "../services/api"; // Adjust the import path as needed

const AdminMainScreen = ({ navigation }) => {
  const [stats, setStats] = useState([
    {
      title: "Active Elections",
      count: "0",
      icon: "checkmark-circle",
      color: ["#6C4EF2", "#5A3ED9"],
      loading: true,
    },
    {
      title: "Total Candidates",
      count: "0",
      icon: "people",
      color: ["#FF6B6B", "#FF5252"],
      loading: true,
    },
    {
      title: "Registered Voters",
      count: "0",
      icon: "person-circle",
      color: ["#4ECDC4", "#44A08D"],
      loading: true,
    },
  ]);

  const quickActions = [
    {
      title: "Create Election",
      icon: "add-circle",
      action: () => navigation.navigate("CreateElection"),
    },
    {
      title: "Create Candidate",
      icon: "person-add",
      action: () => navigation.navigate("CreateCandidate"),
    },
  ];

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch elections and count active ones
      const elections = await getElections();
      const activeElections = elections.filter(
        (election) => election.status === "ACTIVE"
      ).length;

      // Fetch all candidates
      const candidates = await getCandidates();
      const totalCandidates = candidates.length;

      // Note: Since there's no specific endpoint for registered voters count,
      // you might need to add one to your backend or use a placeholder
      // For now, I'll leave it as a placeholder that you can update
      const registeredVoters = "N/A"; // Replace with actual API call when available

      setStats((prevStats) => [
        {
          ...prevStats[0],
          count: activeElections.toString(),
          loading: false,
        },
        {
          ...prevStats[1],
          count: totalCandidates.toString(),
          loading: false,
        },
        {
          ...prevStats[2],
          count: registeredVoters,
          loading: false,
        },
      ]);
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Keep loading state or show error state
      setStats((prevStats) =>
        prevStats.map((stat) => ({
          ...stat,
          loading: false,
          count: "Error",
        }))
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14104D" />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day</Text>
          <Text style={styles.adminName}>Admin Panel</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate("AdminProfile")}
        >
          <LinearGradient
            colors={["#FF6B6B", "#FF5252"]}
            style={styles.profileGradient}
          >
            <Ionicons name="person" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <LinearGradient colors={stat.color} style={styles.statGradient}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name={stat.icon} size={28} color="#fff" />
                  </View>
                  {stat.loading ? (
                    <ActivityIndicator
                      color="#fff"
                      size="small"
                      style={styles.loader}
                    />
                  ) : (
                    <Text style={styles.statCount}>{stat.count}</Text>
                  )}
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={action.action}
                activeOpacity={0.8}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name={action.icon} size={24} color="#6C4EF2" />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Management Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          <View style={styles.managementContainer}>
            <TouchableOpacity
              style={styles.managementCard}
              onPress={() => navigation.navigate("ElectionManagement")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#6C4EF2", "#5A3ED9"]}
                style={styles.managementGradient}
              >
                <Ionicons name="checkmark-circle" size={32} color="#fff" />
                <Text style={styles.managementTitle}>Manage Elections</Text>
                <Text style={styles.managementSubtitle}>
                  Create, edit, and monitor elections
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.managementCard}
              onPress={() => navigation.navigate("CandidateManagement")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FF6B6B", "#FF5252"]}
                style={styles.managementGradient}
              >
                <Ionicons name="people" size={32} color="#fff" />
                <Text style={styles.managementTitle}>Manage Candidates</Text>
                <Text style={styles.managementSubtitle}>
                  Add and organize candidates
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingBottom: 30,
  },
  greeting: {
    color: "#B8B8B8",
    fontSize: 16,
  },
  adminName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  profileButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  profileGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 120,
  },
  statGradient: {
    padding: 16,
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  statIconContainer: {
    marginBottom: 8,
  },
  loader: {
    marginVertical: 8,
  },
  statCount: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statTitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 12,
    textAlign: "center",
    flexShrink: 1,
  },
  actionsContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 4,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(108, 78, 242, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  managementContainer: {
    gap: 16,
  },
  managementCard: {
    borderRadius: 16,
    overflow: "hidden",
    minHeight: 140,
  },
  managementGradient: {
    padding: 20,
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  managementTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
    textAlign: "center",
  },
  managementSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    textAlign: "center",
    flexShrink: 1,
  },
});

export default AdminMainScreen;
