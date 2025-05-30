import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function ChatbotWelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation for avatar
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14104D" />

      {/* Background Gradient */}
      <LinearGradient
        colors={["#14104D", "#1a1461", "#241b7a", "#2d1f8a"]}
        style={styles.backgroundGradient}
      />

      {/* Decorative Background Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Avatar Container */}
        <Animated.View
          style={[
            styles.avatarContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <LinearGradient
            colors={["#6236FF", "#4B2AFA", "#3d22c7"]}
            style={styles.avatarGradient}
          >
            <Image
              source={require("../assets/chatbot.png")}
              style={styles.avatar}
            />
          </LinearGradient>

          {/* Status indicator */}
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
          </View>
        </Animated.View>

        {/* Greeting Section */}
        <Animated.View
          style={[
            styles.greetingSection,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.greeting}>Hello there! 👋</Text>
          <Text style={styles.subtext}>
            I'm your AI assistant, ready to help with your voting questions and
            provide election information.
          </Text>

          {/* Feature highlights */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="help-circle-outline" size={20} color="#B1A9FF" />
              <Text style={styles.featureText}>Ask questions</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#B1A9FF"
              />
              <Text style={styles.featureText}>Get info</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="flash-outline" size={20} color="#B1A9FF" />
              <Text style={styles.featureText}>Quick answers</Text>
            </View>
          </View>
        </Animated.View>

        {/* Chat Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => navigation.navigate("ChatbotView")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#6236FF", "#4B2AFA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.chatButtonGradient}
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color="#fff"
                style={styles.chatIcon}
              />
              <Text style={styles.chatButtonText}>Start Conversation</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Secondary action */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Maybe later</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14104D",
  },
  backgroundGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  decorativeCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(98, 54, 255, 0.1)",
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(177, 169, 255, 0.05)",
    bottom: 100,
    left: -30,
  },
  decorativeCircle3: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(98, 54, 255, 0.08)",
    top: height * 0.3,
    left: width * 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
  },
  avatarContainer: {
    marginBottom: 40,
    position: "relative",
  },
  avatarGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#6236FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
  },
  greetingSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  greeting: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtext: {
    color: "#E8E3FF",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 8,
  },
  featureItem: {
    alignItems: "center",
    flex: 1,
  },
  featureText: {
    color: "#B1A9FF",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  chatButton: {
    width: "100%",
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#6236FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  chatButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  chatIcon: {
    marginRight: 12,
  },
  chatButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    color: "#B1A9FF",
    fontSize: 16,
    fontWeight: "500",
  },
});
