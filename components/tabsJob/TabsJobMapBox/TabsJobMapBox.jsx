import { myPresenceAtom, otherPresenceAtom } from "atom/stompAtom";
import { userCodeAtom } from "atom/userAtom";
import { useInitialLocation } from "hooks/useInitialLocation";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useRef } from "react";
import { View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Button, Card, Divider, Text } from "react-native-paper";
import { haversineKm } from "utils/geoUtils";

const FALLBACK = { lat: 37.5665, lng: 126.978 };
const SPEED_KMPH = 10;

const PATH_MIN_DIST_M = 5;
const PATH_MIN_INTERVAL_MS = 3000;
const PATH_MAX_POINTS = 2000;

function TabsJobMapBox({ pathRef, lastSavedRef, lastTimeRef, step, setStep, productCount, hasRunningJob, runningJobId, resetPath, pushPathPoint, completeJob, dest, selectedProduct, pending }) {
    const userCode = useAtomValue(userCodeAtom);
    const myPresence = useAtomValue(myPresenceAtom);
    const otherPresence = useAtomValue(otherPresenceAtom);

    const mapRef = useRef(null);
    const didInitRouteRef = useRef(false);

    // dest와 현재 위치를 화면에 맞춰 줌
    useEffect(() => {
        if (step !== "route" || !mapRef.current || !dest) return;

        const lat = myPresence?.lat;
        const lng = myPresence?.lng;
        if (lat == null || lng == null) return;

        mapRef.current.fitToCoordinates(
            [
                { latitude: lat, longitude: lng },
                { latitude: dest.lat, longitude: dest.lng },
            ],
            { edgePadding: { top: 60, left: 40, right: 40, bottom: 40 }, animated: true }
        );
    }, [step, dest, myPresence?.lat, myPresence?.lng]);

    // route 진입 시 1회만 경로 초기화 + 시작점 저장
    useEffect(() => {
        if (step === "route" && !didInitRouteRef.current) {
            resetPath();

            const lat = myPresence?.lat;
            const lng = myPresence?.lng;
            if (lat != null && lng != null) {
                pushPathPoint(lat, lng);
                lastSavedRef.current = { lat, lng };
                lastTimeRef.current = Date.now();
            }

            didInitRouteRef.current = true;
        }

        // route 벗어날 때 가드 리셋
        if (step !== "route" && didInitRouteRef.current) {
            didInitRouteRef.current = false;
        }
    }, [step, myPresence?.lat?.lat, myPresence?.lat?.lng, resetPath, pushPathPoint, lastSavedRef, lastTimeRef]);

    // 위치 변화 시 조건 충족하면 누적 저장
    useEffect(() => {
        if (step !== "route") return;

        const lat = myPresence?.lat?.lat;
        const lng = myPresence?.lat?.lng;
        if (lat == null || lng == null) return;

        const now = Date.now();
        const last = lastSavedRef.current; // { lat, lng } | null
        const distM = last ? haversineKm(last, { lat, lng }) * 1000 : Infinity;

        const enoughTime = !lastTimeRef.current || (now - (lastTimeRef.current ?? 0)) >= PATH_MIN_INTERVAL_MS;
        const enoughDist = distM >= PATH_MIN_DIST_M;
        const underLimit = (pathRef.current?.length ?? 0) < PATH_MAX_POINTS;

        if (enoughTime && enoughDist && underLimit) {
            pushPathPoint(lat, lng);
            lastSavedRef.current = { lat, lng };
            lastTimeRef.current = now;
        }
    }, [step, myPresence?.lat?.lat, myPresence?.lat?.lng, pushPathPoint, lastSavedRef, lastTimeRef, pathRef]);

    const distanceKm = useMemo(() => {
        if (!dest) return 0;
        return Number(haversineKm(myPresence, dest).toFixed(2));
    }, [dest, myPresence]);

    const etaMin = useMemo(() => {
        if (!dest || !distanceKm) return 0;
        return Math.max(1, Math.round((distanceKm / SPEED_KMPH) * 60));
    }, [dest, distanceKm]);

    const initialRegion = useInitialLocation({ mapRef, myPresence })

    return (
        <View style={{ flex: 1 }}>
            <MapView ref={mapRef} style={{ flex: 1 }} initialRegion={initialRegion}>
                <Marker
                    coordinate={{ latitude: myPresence?.lat ?? FALLBACK.lat, longitude: myPresence?.lng ?? FALLBACK.lng }}
                    pinColor="dodgerblue"
                />
                {
                    dest &&
                    <Marker
                        coordinate={{ latitude: dest.lat, longitude: dest.lng }}
                        title={dest.label}
                    />
                }
            </MapView>
            <Card style={{ position: "absolute", left: 16, right: 16, bottom: 16 }}>
                <Card.Content>
                    <Text variant="titleMedium">{dest?.label ?? "No destination selected"}</Text>
                    <Text style={{ paddingVertical: 4, opacity: 0.6, fontSize: 14, fontWeight: 400 }}>
                        Product: {selectedProduct?.productName || "-"}
                    </Text>
                    <Text style={{ opacity: 0.6, fontSize: 14, fontWeight: 400 }}>
                        Quantity: {productCount || 0}
                    </Text>
                    <Divider style={{ marginVertical: 4 }} />
                    <Text style={{ paddingBottom: 4, opacity: 0.6, fontSize: 14, fontWeight: 400 }}>
                        Distance: {distanceKm} km
                    </Text>
                    <Text style={{ opacity: 0.6, fontSize: 14, fontWeight: 400 }}>
                        ETA: approximately {etaMin} minutes
                    </Text>
                    <View style={{ justifyContent: "flex-end", flexDirection: "row", gap: 12, marginTop: 12, flexWrap: "wrap", }}>
                        <Button
                            mode="outlined"
                            icon="arrow-left"
                            onPress={() => setStep("form")}
                            disabled={pending}
                            style={{ flex: 1 }}
                            labelStyle={{ fontSize: 14, fontWeight: "400" }}
                        >
                            correction
                        </Button>
                        {
                            hasRunningJob &&
                            <Button
                                mode="contained"
                                icon="check-circle"
                                onPress={() => {
                                    const pathsJson = JSON.stringify(pathRef.current ?? []);
                                    completeJob.mutate({ jobId: runningJobId, paths: pathsJson });
                                }}
                                disabled={pending}
                                labelStyle={{ fontSize: 14, fontWeight: "400" }}
                            >
                                Complete
                            </Button>
                        }
                    </View>
                </Card.Content>
            </Card>
        </View >
    );
}

export default TabsJobMapBox;