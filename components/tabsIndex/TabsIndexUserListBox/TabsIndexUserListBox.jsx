import { View } from 'react-native';
import { Avatar, Card, Divider, List, Text } from 'react-native-paper';

const UI_BY_WORKING = {
    stable: { color: "#10b981", icon: "check-circle" },
    working: { color: "#3b82f6", icon: "progress-clock" },
};

function TabsIndexUserListBox({ mapRef, filtered }) {

    return (
        <Card style={{ borderRadius: 16 }}>
            <Card.Title
                title="User-List"
                style={{ paddingHorizontal: 10, paddingTop: 8, paddingLeft: 20 }}
                titleStyle={{ opacity: 0.8, fontSize: 18, fontWeight: "600" }}
            />
            <Divider style={{ marginHorizontal: 10 }} />
            <View style={{ paddingHorizontal: 10 }}>
                {
                    filtered.sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9))
                        .map((u, idx, arr) => {
                            const ui = u.working ? UI_BY_WORKING.working : UI_BY_WORKING.stable;
                            return (
                                <View key={u.id}>
                                    <List.Item
                                        title={u.userName}
                                        description={
                                            u.distanceKm != null
                                                ? `Distance ${u.distanceKm} km · ${u.working ? "working" : "stable"}`
                                                : `${u.working ? "working" : "stable"}`
                                        }
                                        style={{ paddingLeft: 6, paddingVertical: 6 }}
                                        left={(props) => (
                                            <Avatar.Icon
                                                {...props}
                                                icon={ui.icon}
                                                color="white"
                                                size={50}
                                                style={{ backgroundColor: ui.color }}
                                            />
                                        )}
                                        onPress={() => {
                                            mapRef.current?.animateToRegion(
                                                {
                                                    latitude: u.lat,
                                                    longitude: u.lng,
                                                    latitudeDelta: 0.01,
                                                    longitudeDelta: 0.01,
                                                },
                                                500
                                            );
                                        }}
                                        titleStyle={{ opacity: 0.8, fontSize: 16, fontWeight: "600" }}
                                        descriptionStyle={{ opacity: 0.6, fontSize: 14, fontWeight: "400" }}
                                    />
                                    {idx < arr.length - 1 && <Divider />}
                                </View>
                            );
                        })}
                {
                    filtered.length === 0 &&
                    <View
                        style={{
                            boxSizing: "border-box",
                            minHeight: 150,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ opacity: 0.6, fontSize: 16, fontWeight: 600 }}>
                            There are no matching users.
                        </Text>
                    </View>
                }
            </View>
        </Card>
    );
}

export default TabsIndexUserListBox;