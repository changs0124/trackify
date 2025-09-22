import { TouchableOpacity, View } from 'react-native';
import { Avatar, Card, Divider, IconButton, List, Text } from 'react-native-paper';

const UI_BY_WORKING = {
    stable: "#10b981",
    working: "#3b82f6",
};

function TabsIndexUserListBox({ mapRef, filtered, setVisible, setSelectedUserInfo, userInfo }) {

    const handleDetailedUserInfoOnPress = (data) => {
        setVisible(true);
        userInfo.mutate(data)
    }

    return (
        <Card style={{ borderRadius: 16 }}>
            <Card.Title
                title="User List"
                style={{ paddingHorizontal: 10, paddingTop: 8, paddingLeft: 20 }}
                titleStyle={{ opacity: 0.8, fontSize: 18, fontWeight: "600" }}
            />
            <Divider style={{ marginHorizontal: 10 }} />
            <View style={{ paddingLeft: 16 }}>
                {
                    filtered.sort((a, b) => (a.distanceKm ?? 1e9) - (b.distanceKm ?? 1e9))
                        .map((u, idx, arr) => {
                            return (
                                <View key={u.id}>
                                    <List.Item
                                        title={u.userName}
                                        description={
                                            u.distanceKm != null
                                                && `Distance: ${u.distanceKm} km\nState: ${u.working ? "working" : "stable"}`
                                        }
                                        style={{ paddingVertical: 6 }}
                                        containerStyle={{ paddingRight: 0 }}
                                        left={(props) => (
                                            <View style={{ justifyContent: "center", alignItems: "center" }}>
                                                <Avatar.Text
                                                    label={(u?.userName?.[0] ?? "U").toUpperCase()}
                                                    size={40}
                                                    style={{ backgroundColor: UI_BY_WORKING[u.working ? "working" : "stable"] }}
                                                    color="white"
                                                />
                                            </View>
                                        )}
                                        right={() => (
                                            <TouchableOpacity
                                                onPress={() => handleDetailedUserInfoOnPress(u.id)}
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    paddingLeft: 12,
                                                    paddingVertical: 6
                                                }}
                                                accessibilityLabel="Open user sheet"
                                            >
                                                <Divider style={{ width: 1, height: "100%", alignSelf: "stretch", marginRight: 12, }} />
                                                <IconButton icon="plus" size={22} />
                                            </TouchableOpacity>
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
                                    {
                                        idx < arr.length - 1 &&
                                        <Divider />
                                    }
                                </View>
                            );
                        })}
                {
                    filtered.length === 0 &&
                    <View style={{ boxSizing: "border-box", minHeight: 150, justifyContent: "center", alignItems: "center" }}>
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