import { useModelQuery } from "hooks/useModelQuery";
import { registerUserMutation } from "hooks/useRegisterUserMutation";
import { useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, View } from "react-native";
import { ActivityIndicator, Button, Card, Menu, TextInput } from "react-native-paper";

function register() {
    const [userName, setUserName] = useState("");
    const [menuVisible, setMenuVisible] = useState(false);

    const { models, selectedId, setSelectedId, selectedModel } = useModelQuery(0);
    const register = registerUserMutation();

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
                                {models.isError && <Menu.Item onPress={() => models.refetch()} title="Load failed (try again)" />}
                                {models.isLoading && <ActivityIndicator style={{ margin: 8 }} />}
                                {models.data?.map(m => (
                                    <Menu.Item
                                        key={m.id}
                                        onPress={() => {
                                            setSelectedId(m.id);
                                            setMenuVisible(false);
                                        }}
                                        title={m.modelNumber}
                                    />
                                ))}
                            </Menu>
                        </Card.Content>

                        <Card.Actions>
                            <Button
                                mode="contained"
                                disabled={!userName || !selectedId || register.isLoading}
                                onPress={() => register.mutateAsync({ userName: userName.trim(), modelId: selectedId }).catch(() => {})}
                            >
                                {register.isLoading ? "Registering..." : "Register"}
                            </Button>
                        </Card.Actions>
                    </Card>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

export default register;