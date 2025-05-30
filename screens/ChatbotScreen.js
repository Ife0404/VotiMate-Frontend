// screens/ChatbotScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as api from "../services/api";

const { width } = Dimensions.get("window");

const ChatbotScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hello! I'm your election assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSend = async () => {
    if (inputText.trim() === "") return;

    const newUserMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    const userInput = inputText.trim();
    setInputText("");
    setIsTyping(true);

    // Scroll to end after adding user message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await api.getChatbotResponse(userInput);

      // Debug: Log the full response to understand its structure
      console.log("Full chatbot response:", JSON.stringify(response, null, 2));

      // Try different possible response fields
      let botReply = null;

      if (response.reply) {
        botReply = response.reply;
      } else if (response.message) {
        botReply = response.message;
      } else if (response.text) {
        botReply = response.text;
      } else if (response.response) {
        botReply = response.response;
      } else if (typeof response === "string") {
        botReply = response;
      } else if (response.data && response.data.reply) {
        botReply = response.data.reply;
      } else if (response.data && response.data.message) {
        botReply = response.data.message;
      }

      // If still no reply found, check if it's an array of messages (Rasa format)
      if (!botReply && Array.isArray(response)) {
        const textResponse = response.find((r) => r.text);
        if (textResponse) {
          botReply = textResponse.text;
        }
      }

      // Handle the case where the backend returns a proper response but no recognizable reply
      if (!botReply) {
        console.warn("No recognizable reply field in response:", response);
        botReply = getDefaultResponse(userInput);
      }

      const newBotMessage = {
        id: (Date.now() + 1).toString(),
        text: botReply,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, newBotMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);

      let errorMessage =
        "Sorry, I'm having trouble connecting. Please try again.";

      // Check if it's a specific error from your backend
      if (error.message) {
        if (error.message.includes("User not logged in")) {
          errorMessage = "Please log in to continue using the chatbot.";
        } else if (error.status === 404) {
          errorMessage =
            "The chatbot service is currently unavailable. Please try again later.";
        } else if (error.status >= 500) {
          errorMessage =
            "The server is experiencing issues. Please try again in a moment.";
        } else if (error.message.includes("Network")) {
          errorMessage = "Please check your internet connection and try again.";
        }
      }

      const errorBotMessage = {
        id: (Date.now() + 2).toString(),
        text: errorMessage,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, errorBotMessage]);

      // Only show alert for unexpected errors
      if (error.status >= 500) {
        Alert.alert(
          "Server Error",
          "The server is experiencing issues. Please try again later."
        );
      }
    } finally {
      setIsTyping(false);
      // Scroll to end after bot response
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  // Function to provide contextual default responses
  const getDefaultResponse = (userInput) => {
    const input = userInput.toLowerCase();

    // Check for common election-related keywords
    if (input.includes("candidate") || input.includes("who is running")) {
      return "I can help you with information about candidates. Try asking 'Who are the candidates?' or 'Show me the candidate list.'";
    } else if (
      input.includes("election") ||
      input.includes("when") ||
      input.includes("date")
    ) {
      return "I can provide election details. Try asking 'When is the election?' or 'What are the election dates?'";
    } else if (input.includes("vote") || input.includes("voting")) {
      return "I can help with voting information. You can ask me about the voting process or navigate to the voting section.";
    } else if (input.includes("result")) {
      return "I can help you with election results. Try asking about results or navigate to the results section.";
    } else if (input.includes("help") || input.includes("what can you do")) {
      return "I can help you with:\n• Candidate information\n• Election dates and details\n• Voting guidance\n• Navigation to different sections\n• Election results\n\nJust ask me about any of these topics!";
    } else {
      return "I'm here to help with election-related questions. You can ask me about candidates, election dates, voting, or results. What would you like to know?";
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const TypingIndicator = () => {
    const dot1Anim = useRef(new Animated.Value(0.3)).current;
    const dot2Anim = useRef(new Animated.Value(0.3)).current;
    const dot3Anim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
      const animateDots = () => {
        const animateSequence = (dotAnim, delay) => {
          return Animated.loop(
            Animated.sequence([
              Animated.delay(delay),
              Animated.timing(dotAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(dotAnim, {
                toValue: 0.3,
                duration: 400,
                useNativeDriver: true,
              }),
            ])
          );
        };

        Animated.parallel([
          animateSequence(dot1Anim, 0),
          animateSequence(dot2Anim, 200),
          animateSequence(dot3Anim, 400),
        ]).start();
      };

      animateDots();
    }, []);

    return (
      <View
        style={[
          styles.messageContainer,
          styles.botMessage,
          styles.typingContainer,
        ]}
      >
        <View style={styles.typingDots}>
          <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
          <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
          <Animated.View style={[styles.dot, { opacity: dot3Anim }]} />
        </View>
        <Text style={styles.typingText}>Assistant is typing...</Text>
      </View>
    );
  };

  const renderMessage = ({ item, index }) => (
    <Animated.View style={[styles.messageWrapper, { opacity: fadeAnim }]}>
      <View
        style={[
          styles.messageContainer,
          item.isUser ? styles.userMessage : styles.botMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.isUser ? styles.userMessageText : styles.botMessageText,
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.timestampText,
            item.isUser ? styles.userTimestamp : styles.botTimestamp,
          ]}
        >
          {formatTime(item.timestamp)}
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerText}>Election Assistant</Text>
            <Text style={styles.headerSubtext}>AI Chatbot</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.onlineIndicator} />
          </View>
        </View>

        {/* Chat Area */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Typing Indicator */}
        {isTyping && <TypingIndicator />}

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about candidates, elections, or navigation..."
              placeholderTextColor="#888"
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                inputText.trim()
                  ? styles.sendButtonActive
                  : styles.sendButtonInactive,
              ]}
              onPress={handleSend}
              activeOpacity={0.8}
              disabled={!inputText.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? "#fff" : "#888"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#14104D",
  },
  container: {
    flex: 1,
    backgroundColor: "#14104D",
  },

  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#14104D",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 5,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  headerSubtext: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    fontWeight: "400",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "center",
    justifyContent: "center",
    width: 38,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
  },

  // Chat Styles
  chatArea: {
    flex: 1,
    backgroundColor: "#14104D",
  },
  chatContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageWrapper: {
    marginVertical: 4,
  },
  messageContainer: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userMessage: {
    backgroundColor: "#4B2AFA",
    alignSelf: "flex-end",
    borderBottomRightRadius: 8,
    marginLeft: 40,
  },
  botMessage: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 8,
    marginRight: 40,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "400",
  },
  userMessageText: {
    color: "#fff",
  },
  botMessageText: {
    color: "rgba(255, 255, 255, 0.9)",
  },
  timestampText: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: "300",
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "right",
  },
  botTimestamp: {
    color: "rgba(255, 255, 255, 0.5)",
  },

  // Typing Indicator Styles
  typingContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4B2AFA",
    marginHorizontal: 2,
  },
  typingText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    fontStyle: "italic",
  },

  // Input Styles
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#14104D",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    minHeight: 50,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 100,
    paddingVertical: 8,
    paddingRight: 10,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: "#4B2AFA",
  },
  sendButtonInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});

export default ChatbotScreen;
