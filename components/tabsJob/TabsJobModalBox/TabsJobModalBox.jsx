import { ActivityIndicator, Card, Modal, Portal, Text } from "react-native-paper";

function TabsJobModalBox({ syncing }) {
    return (
        <Portal>
            <Modal
                visible={syncing}
                dismissable={false}
                contentContainerStyle={{ marginHorizontal: 24 }}
            >
                <Card style={{ padding: 16, borderRadius: 12, alignItems: "center" }}>
                    <ActivityIndicator />
                    <Text style={{ marginTop: 12 }}>Synchronizing work in progress.</Text>
                </Card>
            </Modal>
        </Portal>
    );
}

export default TabsJobModalBox;