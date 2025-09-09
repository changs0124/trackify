import { useCallback } from 'react';
import { View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Button, Card, Divider, Modal, Portal, Text } from 'react-native-paper';
import { computeRegion, totalPathKm } from 'utils/geoUtils';

function TabsHistoryMapBox({ mapVisible, setMapVisible, mapCoords, setMapCoords, mapTitle, setMapTitle }) {
    const closeMap = useCallback(() => {
        setMapVisible(false);
        setMapCoords([]);
        setMapTitle("");
    }, []);

    return (
        <Portal>
            <Modal visible={mapVisible} onDismiss={closeMap} contentContainerStyle={{ margin: 16, borderRadius: 16, overflow: "hidden" }}>
                <Card>
                    <Card.Title title={mapTitle || "paths"} right={(props) => <Button onPress={closeMap}>close</Button>} />
                    <Divider />
                    <View style={{ height: 380 }}>
                        <MapView
                            style={{ flex: 1 }}
                            initialRegion={computeRegion(mapCoords)}
                        >
                            {
                                mapCoords.length > 1 &&
                                <Polyline coordinates={mapCoords} strokeWidth={4} />
                            }
                            {
                                mapCoords[0] &&
                                <Marker coordinate={mapCoords[0]} title="Departure" />
                            }
                            {
                                mapCoords[mapCoords.length - 1] &&
                                <Marker coordinate={mapCoords[mapCoords.length - 1]} title="Arrival" />
                            }
                        </MapView>
                    </View>
                    <Card.Content style={{ paddingVertical: 12 }}>
                        <Text style={{ opacity: 0.8, textAlign: "center" }}>
                            {
                                mapCoords?.length > 1
                                    ? `Path points: ${mapCoords.length} · Total ${totalPathKm(mapCoords)} km`
                                    : "Not enough path data."

                            }
                        </Text>
                    </Card.Content>
                </Card>
            </Modal>
        </Portal>
    );
}

export default TabsHistoryMapBox;