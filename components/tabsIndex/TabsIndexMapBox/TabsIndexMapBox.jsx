import { UI_BY_WORKING } from 'constants/tabsIndexConstants';
import { useCallback } from 'react';
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Card, IconButton } from 'react-native-paper';

function TabsIndexMapBox({ mapRef, sheetRef, initialRegion, myLocation, filtered, setSheetData, userInfo }) {
    const handleDetailedUserInfoOnPress = useCallback((id) => {
        setSheetData(null);
        try {
            sheetRef.current?.snapToIndex(1);
        } catch {
            sheetRef.current?.expand?.();
        }
        if (!userInfo.isPending) userInfo.mutate(id);
    }, [setSheetData, userInfo]);

    const handleFocusOnMeOnPress = useCallback(() => {
        if (myLocation?.lat && myLocation?.lng) {
            mapRef.current?.animateToRegion(
                {
                    latitude: myLocation.lat,
                    longitude: myLocation.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                },
                600
            );
        }
    }, [myLocation])

    return (
        <Card style={{ overflow: "hidden", borderRadius: 16 }}>
            <View style={{ minHeight: 250 }}>
                <MapView ref={mapRef} style={{ flex: 1 }} initialRegion={initialRegion}>
                    {
                        (myLocation?.lat && myLocation?.lng) &&
                        <Marker
                            coordinate={{ latitude: myLocation.lat, longitude: myLocation.lng }}
                            pinColor="purple"
                        />
                    }
                    {
                        filtered?.map((u) =>
                            <Marker
                                key={u.id}
                                coordinate={{ latitude: u.lat, longitude: u.lng }}
                                pinColor={u.working ? UI_BY_WORKING.working.color : UI_BY_WORKING.stable.color}
                                onPress={() => handleDetailedUserInfoOnPress(u.id)}
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