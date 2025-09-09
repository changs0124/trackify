import { useRouter } from "expo-router";
import { useAuthGate } from "hooks/useAuthGate";
import { useEffect } from "react";
import { AppState, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

function Center({ children }) {
    return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>{children}</View>;
}

function AuthProvider({ children }) {
    const router = useRouter();
    
    const { ui, auth } = useAuthGate();

    useEffect(() => {
        const sub = AppState.addEventListener("change", s => {
            if (s === "active") auth.refetch?.();
        });
        return () => sub.remove();
    }, [auth]);

    useEffect(() => {
        if (ui.state === "noUserCode" || ui.state === "invalidUserCode" || ui.state === "needRegister") {
            router.replace({ pathname: "/register" });
        }
    }, [ui.state])

    if (ui.state === "waitingStorage" || ui.state === "authLoading") {
        return (
            <Center>
                <ActivityIndicator />
                <Text style={{ marginTop: 8 }}>{ui.state === "waitingStorage" ? "Waiting Storage" : "Auth is Loading"}</Text>
            </Center>
        );
    }

    if (ui.state === "serverError") {
        return (
            <Center>
                <Text style={{ paddingBottom: 12 }}>Auth error. Check server.</Text>
                <Button mode="contained" onPress={() => auth.refetch?.()} loading={auth.isFetching} style={{ marginBottom: 8 }}>
                    retry
                </Button>
                <Button mode="text" onPress={() => router.replace("/register")}>register</Button>
            </Center>
        );
    }

    return <>{children}</>;
}

export default AuthProvider