import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { instance } from "apis/instance";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useModelQuery } from "hooks/useModelQuery";
import { useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, View } from "react-native";
import { ActivityIndicator, Button, Card, Menu, TextInput } from "react-native-paper";
import uuid from 'react-native-uuid';

const STORAGE_KEY = "userCode"

function Register() {
    const router = useRouter();

    const [userName, setUserName] = useState("");
    const [menuVisible, setMenuVisible] = useState(false);

    const { models, selectedId, setSelectedId, selectedModel } = useModelQuery();

    const register = useMutation({
        mutationFn: async ({ userName, modelId }) => {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") throw new Error("Location permission denied.");

            const userCode = uuid.v4().toString();
            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const res = await instance.post("/user", {
                userCode,
                userName,
                modelId,
                lat: latitude,
                lng: longitude
            }).then(res => res.data)

            return { res, userCode }
        },
        onSuccess: async (data) => {
            await AsyncStorage.setItem(STORAGE_KEY, data.userCode);
            Alert.alert(
                data?.res,
                "",
                [
                    { text: "확인", onPress: () => router.replace("/") },
                ],
                { cancelable: false }
            )
        },
        onError: (err) => {
            Alert.alert(err?.response?.data?.message)
        }
    });

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={{ flex: 1, justifyContent: "center", padding: 16, backgroundColor: "#dbdbdb" }}>
                    <Card style={{ borderRadius: 16, elevation: 3, backgroundColor: "#ffffff" }}>
                        <Card.Title title="Register User" subtitle="Select a name and device" />
                        <Card.Content>
                            <TextInput
                                label="UserName"
                                value={userName}
                                onChangeText={setUserName}
                                mode="outlined"
                                style={{ marginBottom: 15, backgroundColor: "#ffffff" }}
                            />
                            <Menu
                                visible={menuVisible}
                                onDismiss={() => setMenuVisible(false)}
                                anchor={
                                    <Button mode="outlined" onPress={() => setMenuVisible(true)} style={{ marginBottom: 15, backgroundColor: "#ffffff" }}>
                                        {selectedModel?.modelNumber || "Select the model"}
                                    </Button>
                                }
                            >
                                {
                                    models.isError &&
                                    <Menu.Item onPress={() => models.refetch()} title="Load failed (try again)" />
                                }
                                {
                                    models.isLoading &&
                                    <ActivityIndicator style={{ margin: 8 }} />
                                }
                                {
                                    models.data?.map(m =>
                                        <Menu.Item
                                            key={m.id}
                                            onPress={() => {
                                                setSelectedId(m.id);
                                                setMenuVisible(false);
                                            }}
                                            title={m.modelNumber}
                                        />
                                    )
                                }
                            </Menu>
                        </Card.Content>
                        <Card.Actions>
                            <Button
                                mode="contained"
                                disabled={!userName || !selectedId || register.isLoading}
                                onPress={() => register.mutateAsync({ userName: userName.trim(), modelId: selectedId }).catch(() => { })}
                            >
                                {
                                    register.isLoading
                                        ? "Registering..."
                                        : "Register"
                                }
                            </Button>
                        </Card.Actions>
                    </Card>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

export default Register;