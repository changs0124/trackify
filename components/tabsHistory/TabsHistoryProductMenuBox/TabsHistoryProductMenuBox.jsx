import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Button, Divider, Menu, Text } from 'react-native-paper';

function TabsHistoryProductMenuBox({ setProductId, products, productList, selectedProduct }) {
    const [productMenuVisible, setProductMenuVisible] = useState(false);

    const handleProductChange = useCallback((id) => {
        setProductId(id);
        setProductMenuVisible(false);
    }, []);

    return (
        <>
            <Text variant="labelLarge" style={{ opacity: 0.8, fontSize: 18, fontWeight: "600" }}>
                Product
            </Text>
            <Menu
                visible={productMenuVisible}
                onDismiss={() => setProductMenuVisible(false)}
                anchor={
                    <Button
                        mode="outlined"
                        onPress={() => setProductMenuVisible(true)}
                        disabled={products.isLoading || products.isError}
                        style={{ marginBottom: 4, borderRadius: 16 }}
                        labelStyle={{ fontSize: 16, fontWeight: "600" }}
                    >
                        {selectedProduct?.productName ?? "Select the Product"}
                    </Button>
                }
            >
                {products.isLoading && <ActivityIndicator style={{ margin: 8 }} />}
                {products.isError && <Menu.Item onPress={() => products.refetch()} title="Load failed (try again)" />}
                {productList.map((p, idx) => (
                    <React.Fragment key={p.id}>
                        <Menu.Item
                            onPress={() => handleProductChange(p.id)}
                            title={p.productName ?? `Product #${p.id}`}
                            titleStyle={{ opacity: 0.8, fontSize: 14, fontWeight: "600" }}
                            style={{ paddingVertical: 4 }}
                        />
                        {idx < productList.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </Menu>
        </>
    );
}

export default TabsHistoryProductMenuBox;