import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { ActivityIndicator, Button, Card, Divider, IconButton, List, Modal, Portal, Text } from 'react-native-paper';

function ProductMenuBox({ setProductId, products, productList, selectedProduct }) {
    const [pickerVisible, setPickerVisible] = useState(false);

    const openPicker = useCallback(() => setPickerVisible(true));
    const closePicker = useCallback(() => setPickerVisible(false));

    const handleProductChange = useCallback((id) => {
        setProductId(id);
        setProductMenuVisible(false);
    }, [setProductId, closePicker]);

    return (
        <>
            <Text variant="labelLarge" style={{ opacity: 0.8, fontSize: 18, fontWeight: "600" }}>
                Product
            </Text>
            <Button
                mode="outlined"
                onPress={openPicker}
                disabled={products.isLoading || products.isError}
                style={{ marginBottom: 4, borderRadius: 16 }}
                labelStyle={{ fontSize: 16, fontWeight: "600" }}
            >
                {selectedProduct?.productName ?? "Select the Product"}
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
                                <Text style={{ fontSize: 18, fontWeight: "700" }}>Select Product</Text>
                            </View>
                            <IconButton icon="close" onPress={closePicker} accessibilityLabel="Close product picker" />
                        </View>
                        <Divider />
                        <View style={{ maxHeight: 420 }}>
                            {
                                products.isLoading &&
                                <ActivityIndicator style={{ margin: 16 }} />
                            }
                            {
                                products.isError &&
                                <List.Item
                                    title="Load failed (try again)"
                                    onPress={() => products.refetch()}
                                    left={(props) => <List.Icon {...props} icon="reload" />}
                                />
                            }
                            {
                                (!products.isLoading && !products.isError) &&
                                <FlatList
                                    data={productList}
                                    keyExtractor={(item) => String(item.id)}
                                    ItemSeparatorComponent={() => <Divider />}
                                    renderItem={({ item }) =>
                                        <List.Item
                                            onPress={() => handleCargoChange(item.id)}
                                            title={item.productName ?? `Product #${item.id}`}
                                            titleStyle={{ opacity: 0.9, fontSize: 15, fontWeight: "600" }}
                                            right={(props) =>
                                                selectedProduct?.id === item.id ? <List.Icon {...props} icon="check" /> : null
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

export default ProductMenuBox;