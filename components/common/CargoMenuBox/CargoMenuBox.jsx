import React, { useCallback, useState } from "react";
import { ActivityIndicator, Button, Divider, Menu, Text } from "react-native-paper";

function CargoMenuBox({ setCargoId, cargos, cargoList, selectedCargo }) {
    const [cargoMenuVisible, setCargoMenuVisible] = useState(false);

    const handleCargoChange = useCallback((id) => {
        setCargoId(id);
        setCargoMenuVisible(false);
    }, []);

    return (
        <>
            <Text variant="labelLarge" style={{ opacity: 0.8, fontSize: 18, fontWeight: "600" }}>
                Cargo
            </Text>
            <Menu
                visible={cargoMenuVisible}
                onDismiss={() => setCargoMenuVisible(false)}
                anchor={
                    <Button
                        mode="outlined"
                        onPress={() => setCargoMenuVisible(true)}
                        disabled={cargos.isLoading || cargos.isError}
                        style={{ marginBottom: 4, borderRadius: 16 }}
                        labelStyle={{ fontSize: 16, fontWeight: "600" }}
                    >
                        {selectedCargo?.cargoName ?? "Select the Cargo"}
                    </Button>
                }
            >
                {
                    cargos.isLoading &&
                    <ActivityIndicator style={{ margin: 8 }} />
                }
                {
                    cargos.isError &&
                    <Menu.Item onPress={() => cargos.refetch()} title="Load failed (try again)" />
                }
                {
                    cargoList.map((c, idx) =>
                        <React.Fragment key={c.id}>
                            <Menu.Item
                                onPress={() => handleCargoChange(c.id)}
                                title={c.cargoName ?? `Cargo #${c.id}`}
                                titleStyle={{ opacity: 0.8, fontSize: 14, fontWeight: "600" }}
                                style={{ paddingVertical: 4 }}
                            />
                            {idx < cargoList.length - 1 && <Divider />}
                        </React.Fragment>
                    )
                }
            </Menu>
        </>
    );
}

export default CargoMenuBox;