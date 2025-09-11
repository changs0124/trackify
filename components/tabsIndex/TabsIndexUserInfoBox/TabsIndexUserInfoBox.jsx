import { useCallback, useMemo } from 'react';
import { Dimensions, Platform, ScrollView, View } from 'react-native';
import { ActivityIndicator, Avatar, Card, Chip, Divider, IconButton, Modal, Portal, Text } from 'react-native-paper';

function InfoRow({ label, value }) {
    return (
        <View style={{ paddingVertical: 8 }}>
            <Text style={{ opacity: 0.6, fontSize: 13, marginBottom: 2 }}>{label}</Text>
            <Text style={{ opacity: 0.9, fontSize: 15, fontWeight: "600" }}>{value ?? "-"}</Text>
            <Divider style={{ marginTop: 10 }} />
        </View>
    );
}

function SectionTitle({ children }) {
    return (
        <Text style={{ opacity: 0.9, fontSize: 16, fontWeight: "700", marginBottom: 10 }}>{children}</Text>
    );
}

function TabsIndexUserInfoBox({ visible, setVisible, selectedUserInfo, userInfo }) {
    const { width, height } = Dimensions.get("window");

    const statusMeta = useMemo(() => {
        const working = selectedUserInfo?.status === 1;
        return working
            ? { label: "WORKING", bg: "#e9f3ff", color: "#2563eb" }
            : { label: "STABLE", bg: "#eef7f1", color: "#16a34a" };
    }, [selectedUserInfo]);

    const close = useCallback(() => {
        setVisible(false);
    }, [])

    return (
        <Portal>
            <Modal visible={visible} onDismiss={close} dismissable={!userInfo.isPending} dismissableBackButton contentContainerStyle={{ justifyContent: "center", alignItems: "center", padding: 16 }}>
                <Card style={{ width: Math.min(width * 0.96, 720), height: height * 0.5, borderRadius: 16, overflow: "hidden", alignSelf: "center" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
                        <Avatar.Text
                            label={(selectedUserInfo?.userName?.[0] ?? "U").toUpperCase()}
                            size={40}
                            style={{ backgroundColor: statusMeta.color }}
                            color="white"
                        />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={{ fontSize: 18, fontWeight: "700", opacity: 0.95 }}>
                                {selectedUserInfo?.userName ?? "User-Info"}
                            </Text>
                        </View>
                        <Chip style={{ backgroundColor: statusMeta.bg }} textStyle={{ color: statusMeta.color, fontWeight: "700" }}>
                            {statusMeta.label}
                        </Chip>
                        <IconButton icon="close" onPress={close} accessibilityLabel="close" />
                    </View>
                    <Divider />
                    <ScrollView
                        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 24 }}
                        showsVerticalScrollIndicator
                        bounces={Platform.OS === "ios"}
                    >
                        {
                            (userInfo.isPending || userInfo.isLoading) &&
                            <View style={{ paddingVertical: 24 }}>
                                <ActivityIndicator />
                            </View>
                        }
                        {
                            (!!selectedUserInfo && !userInfo.isPending) &&
                            <View style={{ gap: 18 }}>
                                <View style={{ flexDirection: width > 520 ? "row" : "column", gap: 18 }}>
                                    <View style={{ flex: 1 }}>
                                        <SectionTitle>User info</SectionTitle>
                                        <InfoRow label="Model Number" value={selectedUserInfo.modelNumber} />
                                        <InfoRow label="Model Volume" value={selectedUserInfo.modelVolume.toFixed(2) ?? "0.00"} />
                                        <InfoRow label="Volume" value={(selectedUserInfo.productVolume).toFixed(2) ?? "0.00"} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <SectionTitle>Current Job</SectionTitle>
                                        {
                                            selectedUserInfo?.status === 1
                                                ? <>
                                                    <InfoRow label="Cargo" value={selectedUserInfo.cargoName} />
                                                    <InfoRow label="Product" value={`${selectedUserInfo.productName ?? "-"} x ${selectedUserInfo.productCount ?? 0}`} />
                                                    <InfoRow label="Volume" value={(selectedUserInfo.productVolume).toFixed(2) ?? "0.00"} />
                                                </>
                                                : <Text style={{ opacity: 0.6, fontSize: 14 }}>Not in progress</Text>
                                        }
                                    </View>
                                </View>
                            </View>
                        }
                        {
                            userInfo.isError && !userInfo.isPending && !selectedUserInfo &&
                            <View style={{ minHeight: 160, justifyContent: "center", alignItems: "center" }}>
                                <Text style={{ opacity: 0.6, fontSize: 14 }}>Failed to retrieve information. Please try again.</Text>
                            </View>
                        }
                    </ScrollView>
                </Card>
            </Modal>
        </Portal>
    );
}

export default TabsIndexUserInfoBox;