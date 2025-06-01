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
import CandidateScreen from "../screens/CandidateScreen";
import ThanksScreen from "../screens/ThanksScreen";
import ChartScreen from "../screens/ChartScreen";
import TabNavigator from "./TabNavigator";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChatbotScreen from "../screens/ChatbotScreen";
import ChatbotWelcomeScreen from "../screens/ChatbotWelcomeScreen";
import UserTypeSelectionScreen from "../screens/UserTypeSelectionScreen";
import AdminLoginScreen from "../screens/AdminLoginScreen";
import AdminMainScreen from "../screens/AdminMainScreen";
import AdminRegisterScreen from "../screens/AdminRegisterScreen";
import CreateElectionScreen from "../screens/CreateElectionScreen";
import CreateCandidateScreen from "../screens/CreateCandidateScreen";
import ElectionManagementScreen from "../screens/ElectionManagementScreen"
import EditElectionScreen from "../screens/EditElectionScreen";
import AdminProfileScreen from "../screens/AdminProfileScreen";
import CandidateManagementScreen from "../screens/CandidateManagementScreen";
import EditCandidateScreen from "../screens/EditCandidateScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding1" component={Onboarding1} />
        <Stack.Screen name="Onboarding2" component={Onboarding2} />
        <Stack.Screen name="Onboarding3" component={Onboarding3} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Candidate" component={CandidateScreen} />
        <Stack.Screen name="Thanks" component={ThanksScreen} />
        <Stack.Screen name="ChartView" component={ChartScreen} />
        <Stack.Screen name="HomeView" component={HomeScreen} />
        <Stack.Screen name="ChatbotWelcome" component={ChatbotWelcomeScreen} />
        <Stack.Screen name="ChatbotView" component={ChatbotScreen} />
        <Stack.Screen name="ProfileView" component={ProfileScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Selection" component={UserTypeSelectionScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="AdminHome" component={AdminMainScreen} />
        <Stack.Screen name="AdminRegister" component={AdminRegisterScreen} />
        <Stack.Screen name="CreateElection" component={CreateElectionScreen} />
        <Stack.Screen name="CreateCandidate" component={CreateCandidateScreen} />
        <Stack.Screen name="ElectionManagement" component={ElectionManagementScreen} />
        <Stack.Screen name="EditElection" component={EditElectionScreen} />
        <Stack.Screen name="EditCandidate" component={EditCandidateScreen} />
        <Stack.Screen name="AdminProfile" component={AdminProfileScreen} />
        <Stack.Screen name="CandidateManagement" component={CandidateManagementScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
