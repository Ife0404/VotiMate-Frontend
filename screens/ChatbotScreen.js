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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ChatbotScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    { id: "1", text: "Hello! How can I assist you today?", isUser: false },
  ]);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef(null);

  // Mock bot response
  const getBotResponse = (userMessage) => {
    return `I received your message: "${userMessage}". How can I help you further?`;
  };

  const handleSend = () => {
    if (inputText.trim() === "") return;

    // Add user message
    const newUserMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(inputText);
      const newBotMessage = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isUser: false,
      };
      setMessages((prevMessages) => [...prevMessages, newBotMessage]);

      // Scroll to the latest message
      flatListRef.current.scrollToEnd({ animated: true });
    }, 500);

    setInputText("");
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Votebot</Text>
          {/* Fixed: Wrapped in <Text> */}
          <View style={{ width: 28 }} /> {/* Placeholder for alignment */}
        </View>

        {/* Chat Area */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() =>
            flatListRef.current.scrollToEnd({ animated: true })
          }
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#14104D",
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  userMessage: {
    backgroundColor: "#4B2AFA", // Purple for user messages
    alignSelf: "flex-end",
  },
  botMessage: {
    backgroundColor: "#555555", // Gray for bot messages
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#1E1E3F",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  input: {
    flex: 1,
    backgroundColor: "#333",
    color: "#fff",
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#4B2AFA",
    padding: 10,
    borderRadius: 20,
  },
});

export default ChatbotScreen;
