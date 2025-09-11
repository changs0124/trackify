import { useInitialLocation } from 'hooks/useInitialLocation';
import { useCallback } from 'react';
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Card, IconButton } from 'react-native-paper';

export const UI_BY_WORKING = {
    stable: { color: "#10b981", icon: "check-circle" },
    working: { color: "#3b82f6", icon: "progress-clock" },
};

function TabsIndexMapBox({ myPresence, mapRef, filtered }) {
    const initialRegion = useInitialLocation({ mapRef, myPresence });

    const handleFocusOnMeOnPress = useCallback(() => {
        if (myPresence?.lat && myPresence?.lng) {
            mapRef.current?.animateToRegion(
                {
                    latitude: myPresence.lat,
                    longitude: myPresence.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                },
                600
            );
        }
    }, [myPresence])

    return (
        <Card style={{ overflow: "hidden", borderRadius: 16 }}>
            <View style={{ minHeight: 250 }}>
                <MapView ref={mapRef} style={{ flex: 1 }} initialRegion={initialRegion}>
                    {
                        (myPresence?.lat && myPresence?.lng) &&
                        <Marker
                            coordinate={{ latitude: myPresence.lat, longitude: myPresence.lng }}
                            pinColor="purple"
                        />
                    }
                    {
                        filtered?.map((u) =>
                            <Marker
                                key={u.id}
                                coordinate={{ latitude: u.lat, longitude: u.lng }}
                                pinColor={u.working ? UI_BY_WORKING.working.color : UI_BY_WORKING.stable.color}
                            />
                        )
                    }
                </MapView>
                <View
                    pointerEvents="box-none"
                    style={{ position: "absolute", bottom: 5, right: 5, zIndex: 2 }}
                >
                    <IconButton
                        mode="contained"
                        icon="crosshairs-gps"
                        size={25}
                        onPress={handleFocusOnMeOnPress}
                        containerColor="#dbdbdb"
                        iconColor="#222"
                        style={{ elevation: 3 }}
                    />
                </View>
            </View>
        </Card>
    );
}

export default TabsIndexMapBox;