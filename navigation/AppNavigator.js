// navigation/AppNavigator.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import SplashScreen from "../screens/SplashScreen";
import Onboarding1 from "../screens/Onboarding1";
import Onboarding2 from "../screens/Onboarding2";
import Onboarding3 from "../screens/Onboarding3";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import FaceRecognitionIntro from "../screens/FaceRecognitionScreen";
import FaceRecognitionCamera from "../screens/CameraScreen";
import CandidateScreen from "../screens/CandidateScreen";
import ConfirmationScreen from "../screens/ConfirmationScreen";
import ThanksScreen from "../screens/ThanksScreen";
import ChartScreen from "../screens/ChartScreen";
import TabNavigator from "./TabNavigator";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChatbotScreen from "../screens/ChatbotScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding1" component={Onboarding1} />
        <Stack.Screen name="Onboarding2" component={Onboarding2} />
        <Stack.Screen name="Onboarding3" component={Onboarding3} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="FaceIntro" component={FaceRecognitionIntro} />
        <Stack.Screen name="FaceCamera" component={FaceRecognitionCamera} />
        <Stack.Screen name="Candidate" component={CandidateScreen} />
        <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
        <Stack.Screen name="Thanks" component={ThanksScreen} />
        <Stack.Screen name="ChartView" component={ChartScreen} />
        <Stack.Screen name="HomeView" component={HomeScreen} />
        <Stack.Screen name="ChatbotView" component={ChatbotScreen} />
        <Stack.Screen name="ProfileView" component={ProfileScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Chart" component={TabNavigator} />
        <Stack.Screen name="Chatbot" component={TabNavigator} />
        <Stack.Screen name="Profile" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
