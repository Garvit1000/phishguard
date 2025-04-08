import { Stack } from "expo-router";
import { UnderstandMeProvider } from "../../UnderstandMeContext.jsx";
import SafeAreaWrapper from "../../../components/SafeAreaWrapper";
import Colors from "../../../constants/colors";

export default function UnderstandMeLayout() {
  return (
    <UnderstandMeProvider>
      <SafeAreaWrapper>
        <Stack
          initialRouteName="module-one"
          screenOptions={{
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.text,
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="module-one" options={{ title: "Personality Assessment" }} />
          <Stack.Screen name="module-two" options={{ title: "Phishing Susceptibility" }} />
          <Stack.Screen name="module-three" options={{ title: "Behavioral Assessment" }} />
          <Stack.Screen name="results" options={{ title: "Results" }} />
        </Stack>
      </SafeAreaWrapper>
    </UnderstandMeProvider>
  );
}