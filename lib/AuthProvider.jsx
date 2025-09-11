import { useRouter } from "expo-router";
import { useAuthGate } from "hooks/useAuthGate";
import { useEffect, useRef } from "react";
import { AppState, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";

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

    const movedRef = useRef(false);
    useEffect(() => {
        if (movedRef.current) return;
        if (ui.state === "noUserCode" || ui.state === "invalidUserCode" || ui.state === "needRegister") {
            movedRef.current = true;
            router.replace("/register");
        }
    }, [ui.state, router]);

    // ------- 여기서 '렌더링 분기'를 반환으로 처리 -------
    if (ui.state === "waitingStorage" || ui.state === "authLoading") {
        return (
            <Center>
                <ActivityIndicator />
                <Text style={{ marginTop: 8 }}>
                    {ui.state === "waitingStorage" ? "Waiting Storage" : "Auth is Loading"}
                </Text>
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

    if (ui.state === "noUserCode" || ui.state === "invalidUserCode" || ui.state === "needRegister") {
        return null;
    }

    // 인증 완료
    return <>{children}</>;
}

export default AuthProvider