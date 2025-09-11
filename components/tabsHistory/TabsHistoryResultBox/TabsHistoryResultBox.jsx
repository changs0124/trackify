import { useCallback } from "react";
import { View } from "react-native";
import { Badge, Card, Chip, Divider, List, Text } from "react-native-paper";
import { calcElapsedMs, formatDuration, parsePaths, totalPathKm } from "utils/geoUtils";

const STATUS_META = {
    0: { label: "cancel", icon: "close-circle", mode: "outlined", badge: "error" },
    1: { label: "working", icon: "progress-clock", mode: "outlined", badge: "primary" },
    2: { label: "complete", icon: "check-circle", mode: "contained", badge: "success" },
};

function TabsHistoryResultBox({ isSearching, historyList, setMapVisible, setMapCoords, setMapTitle }) {

    const openMapForItem = useCallback((item) => {
        const coords = parsePaths(item?.paths);

        setMapCoords(coords);
        setMapTitle(`${item?.cargoName ?? "목적지"} · ${item?.userName ?? ""}`);
        setMapVisible(true);
    }, []);

    return (
        <Card style={{ borderRadius: 16 }}>
            <Card.Title title="Search results" />
            <Divider />
            {
                !isSearching && (!historyList || historyList.length === 0) &&
                <List.Item
                    title="No search results"
                    description="Try changing the filter or press Search to refresh."
                    left={(props) => <List.Icon {...props} icon="magnify" />}
                />
            }
            {
                historyList?.map((item, idx) => {
                    const meta = STATUS_META[Number(item?.status) ?? 1] ?? STATUS_META[1];
                    const elapsedMs = calcElapsedMs(item?.startDate, item?.endDate, item?.status);
                    const elapsedText = formatDuration(elapsedMs);
                    const coords = parsePaths(item?.paths);
                    const distKm = totalPathKm(coords);
                    const hasPath = coords.length > 1;

                    return (
                        <View key={item?.id ?? idx}>
                            <List.Item
                                title={`${item?.cargoName ?? "Unknown destination"}`}
                                description={() => (
                                    <View style={{ gap: 4 }}>
                                        <Text style={{ opacity: 0.8 }}>
                                            {item?.userName ? `Handler: ${item.userName}` : "Handler: -"}
                                        </Text>
                                        <Text style={{ opacity: 0.8 }}>
                                            {item?.productName
                                                ? `Item: ${item.productName} · Qty: ${item?.productCount ?? "-"}`
                                                : `Qty: ${item?.productCount ?? "-"}`}
                                        </Text>
                                        <Text style={{ opacity: 0.8 }}>
                                            {item?.status === 2 ? `Duration: ${elapsedText}` : `Elapsed: ${elapsedText}`}
                                            {distKm > 0 ? ` · Distance: ${distKm} km` : ""}
                                        </Text>
                                    </View>
                                )}
                                left={(props) => <List.Icon {...props} icon={meta.icon} />}
                                right={() => (
                                    <View style={{ alignItems: "flex-end", justifyContent: "center" }}>
                                        <Chip
                                            mode={meta.mode}
                                            icon={meta.icon}
                                            compact
                                            style={{ alignSelf: "flex-end" }}
                                        >
                                            {meta.label}
                                        </Chip>
                                        {hasPath && (
                                            <Badge style={{ marginTop: 6 }} size={20}>
                                                path
                                            </Badge>
                                        )}
                                    </View>
                                )}
                                onPress={() => hasPath && openMapForItem(item)}
                            />
                            {
                                idx < historyList.length - 1 &&
                                <Divider />
                            }
                        </View>
                    );
                })
            }
        </Card>
    );
}

export default TabsHistoryResultBox;