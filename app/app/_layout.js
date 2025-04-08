import { Stack } from "expo-router";
import Colors from "../../constants/colors";
import { UnderstandMeProvider } from "../UnderstandMeContext";

export default function AppLayout() {
  return (
    <UnderstandMeProvider>
      <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name="understand-me"
        options={{
          headerShown: false,
        }}
      />
      </Stack>
    </UnderstandMeProvider>
  );
}