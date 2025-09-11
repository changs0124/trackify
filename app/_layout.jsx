import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { darkTheme, lightTheme } from "styles/theme";

const queryClient = new QueryClient();
function RootLayout() {
    const scheme = useColorScheme() ?? "light";

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <PaperProvider theme={scheme === "dark" ? darkTheme : lightTheme}>
                    <QueryClientProvider client={queryClient}>
                        <Stack screenOptions={{ headerShown: false }} />
                    </QueryClientProvider>
                </PaperProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>

    );
}

export default RootLayout;