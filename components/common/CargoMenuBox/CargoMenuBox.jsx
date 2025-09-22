import { useCallback, useState } from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { ActivityIndicator, Button, Card, Divider, IconButton, List, Modal, Portal, Text } from "react-native-paper";

function CargoMenuBox({ setCargoId, cargos, cargoList, selectedCargo }) {
    const [pickerVisible, setPickerVisible] = useState(false);

    const openPicker = useCallback(() => setPickerVisible(true));
    const closePicker = useCallback(() => setPickerVisible(false));

    const handleCargoChange = useCallback((id) => {
        setCargoId(id);
        closePicker();
    }, [setCargoId, closePicker]);

    return (
        <>
            <Text variant="labelLarge" style={{ opacity: 0.8, fontSize: 18, fontWeight: "600" }}>
                Cargo
            </Text>
            <Button
                mode="outlined"
                onPress={openPicker}
                disabled={cargos.isLoading || cargos.isError}
                style={{ marginBottom: 4, borderRadius: 16 }}
                labelStyle={{ fontSize: 16, fontWeight: "600" }}
            >
                {selectedCargo?.cargoName ?? "Select the Cargo"}
            </Button>
            <Portal>
                <Modal
                    visible={pickerVisible}
                    onDismiss={closePicker}
                    contentContainerStyle={{
                        marginHorizontal: 16,
                        borderRadius: 16,
                    }}
                >
                    <Card style={{ borderRadius: 16, overflow: "hidden" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4 }}>
                            <View style={{ flex: 1, paddingHorizontal: 8, paddingVertical: 12 }}>
                                <Text style={{ fontSize: 18, fontWeight: "700" }}>Select Cargo</Text>
                            </View>
                            <IconButton icon="close" onPress={closePicker} accessibilityLabel="Close cargo picker" />
                        </View>
                        <Divider />
                        <View style={{ maxHeight: 420 }}>
                            {
                                cargos.isLoading &&
                                <ActivityIndicator style={{ margin: 16 }} />
                            }
                            {
                                cargos.isError &&
                                <List.Item
                                    title="Load failed (try again)"
                                    onPress={() => cargos.refetch()}
                                    left={(props) => <List.Icon {...props} icon="reload" />}
                                />
                            }
                            {
                                (!cargos.isLoading && !cargos.isError) &&
                                <FlatList
                                    data={cargoList}
                                    keyExtractor={(item) => String(item.id)}
                                    ItemSeparatorComponent={() => <Divider />}
                                    renderItem={({ item }) =>
                                        <List.Item
                                            onPress={() => handleCargoChange(item.id)}
                                            title={item.cargoName ?? `Cargo #${item.id}`}
                                            titleStyle={{ opacity: 0.9, fontSize: 15, fontWeight: "600" }}
                                            right={(props) =>
                                                selectedCargo?.id === item.id ? <List.Icon {...props} icon="check" /> : null
                                            }
                                            style={{ paddingVertical: 12, paddingHorizontal: 6 }}
                                        />
                                    }
                                />
                            }
                        </View>
                    </Card>
                </Modal>
            </Portal>
        </>
    );
}

export default CargoMenuBox;