import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const dotAnimations = useRef([
    new Animated.Value(1),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]).current;
  const scaleAnimations = useRef([
    new Animated.Value(1),
    new Animated.Value(0.8),
    new Animated.Value(0.8),
  ]).current;

  const onboardingData = [
    {
      image: require("../assets/welcome.png"),
      title: "Welcome to VotiMate",
      description:
        "The online voting application. Create your account and stay tuned.",
      imageStyle: { width: 250, height: 250 },
    },
    {
      image: require("../assets/stay_tuned.png"),
      title: "Stay tuned",
      description: "Follow each candidate's election campaign.",
      imageStyle: { width: 260, height: 253 },
    },
    {
      image: require("../assets/vote.png"),
      title: "Make your choice",
      description:
        "Vote for your favorite candidate, and view the results in real time.",
      imageStyle: { width: 252, height: 264 },
    },
  ];

  const animateDots = (index) => {
    dotAnimations.forEach((animation, i) => {
      Animated.timing(animation, {
        toValue: i === index ? 1 : 0.3,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    scaleAnimations.forEach((animation, i) => {
      Animated.timing(animation, {
        toValue: i === index ? 1 : 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);

    if (index !== currentIndex && index >= 0 && index < onboardingData.length) {
      setCurrentIndex(index);
      animateDots(index);
    }
  };

  const goToNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
      setCurrentIndex(nextIndex);
      animateDots(nextIndex);
    } else {
      navigation.replace("Selection");
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      scrollViewRef.current?.scrollTo({
        x: prevIndex * screenWidth,
        animated: true,
      });
      setCurrentIndex(prevIndex);
      animateDots(prevIndex);
    }
  };

  useEffect(() => {
    animateDots(0);
  }, []);

  const renderDot = (index) => {
    const isActive = index === currentIndex;

    return (
      <Animated.View
        key={index}
        style={[
          styles.dot,
          {
            opacity: dotAnimations[index],
            backgroundColor: isActive ? "#4B2AFA" : "#666",
            transform: [
              {
                scale: isActive ? 1.2 : 1,
              },
            ],
          },
        ]}
      />
    );
  };

  const renderOnboardingScreen = (item, index) => (
    <View key={index} style={[styles.slide, { width: screenWidth }]}>
      <Animated.View
        style={[
          styles.contentContainer,
          {
            transform: [{ scale: scaleAnimations[index] }],
          },
        ]}
      >
        <View style={styles.imageContainer}>
          <Image source={item.image} style={[styles.image, item.imageStyle]} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {onboardingData.map((item, index) =>
          renderOnboardingScreen(item, index)
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <View style={styles.dotsContainer}>
          {onboardingData.map((_, index) => renderDot(index))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={goToNext} style={styles.primaryButton}>
            <Text style={styles.buttonText}>
              {currentIndex === onboardingData.length - 1
                ? "Get Started"
                : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14104D",
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  imageContainer: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  image: {
    resizeMode: "contain",
  },
  textContainer: {
    flex: 0.3,
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "Poppins",
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  description: {
    textAlign: "center",
    color: "#B8B8D1",
    fontFamily: "Poppins",
    fontSize: 18,
    fontWeight: "300",
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  bottomContainer: {
    paddingBottom: 50,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: -150,
    marginBottom: 80,
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: "#4B2AFA",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  primaryButton: {
    backgroundColor: "#6C4EF2",
    paddingVertical: 16,
    paddingHorizontal: 45,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#6C4EF2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    alignSelf: "center",
    minWidth: 120,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#6C4EF2",
    flex: 1,
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  secondaryButtonText: {
    color: "#6C4EF2",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4B2AFA",
    borderRadius: 2,
  },
});

export default OnboardingScreen;
