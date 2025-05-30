// navigation/TabNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import ChartScreen from "../screens/ChartScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChatbotWelcomeScreen from "../screens/ChatbotWelcomeScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Chart") {
            iconName = focused ? "bar-chart" : "bar-chart-outline";
          } else if (route.name === "Chatbot") {
            iconName = focused ? "chatbox" : "chatbox-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#6C4EF2",
        tabBarInactiveTintColor: "#999",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chart" component={ChartScreen} />
      <Tab.Screen name="Chatbot" component={ChatbotWelcomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
