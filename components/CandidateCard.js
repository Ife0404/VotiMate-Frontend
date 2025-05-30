// CandidateCard.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Default avatar component similar to WhatsApp
const DefaultAvatar = ({ name, style }) => {
  const getInitials = (fullName) => {
    if (!fullName) return "?";
    const names = fullName.trim().split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getAvatarColor = (name) => {
    if (!name) return "#6236FF";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "#6236FF",
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
      "#F8C471",
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <LinearGradient
      colors={[getAvatarColor(name), `${getAvatarColor(name)}CC`]}
      style={[style, styles.avatarGradient]}
    >
      <Text style={styles.avatarText}>{getInitials(name)}</Text>
    </LinearGradient>
  );
};

export default function CandidateCard({
  name,
  position,
  imageUrl,
  navigation,
  candidateId,
}) {
  const [imageError, setImageError] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    navigation.navigate("Candidate", { candidateId });
  };

  return (
    <Animated.View
      style={[styles.cardContainer, { transform: [{ scale: scaleValue }] }]}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          {imageUrl && !imageError ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              onError={() => setImageError(true)}
            />
          ) : (
            <DefaultAvatar name={name} style={styles.image} />
          )}
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.positionContainer}>
              <Ionicons name="briefcase-outline" size={14} color="#6236FF" />
              <Text style={styles.position} numberOfLines={1}>
                {position}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={handlePress}>
            <LinearGradient
              colors={["#6236FF", "#4B2AFA"]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>View</Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.cardDecoration}>
          <LinearGradient
            colors={["#6236FF20", "transparent"]}
            style={styles.decorationGradient}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 4,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: "#6236FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: "relative",
    overflow: "hidden",
  },
  imageContainer: {
    alignSelf: "flex-start",
    position: "relative",
    marginBottom: 16,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarGradient: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#14104D",
    marginBottom: 6,
  },
  positionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  position: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    fontWeight: "500",
  },
  actionButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginRight: 4,
  },
  cardDecoration: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 100,
    height: 100,
  },
  decorationGradient: {
    width: "100%",
    height: "100%",
    borderTopRightRadius: 20,
  },
});
