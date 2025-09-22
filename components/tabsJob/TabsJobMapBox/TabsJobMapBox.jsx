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

    // 'route' 단계에서 현재 위치와 목적지를 화면에 같이 보이도록 카메라 맞춤
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

    // 'route' 진입 시 딱 1번: 경로 버퍼를 초기화하고, 현재 위치를 첫 포인트로 기록
    useEffect(() => {
        if (step === "route" && !didInitRouteRef.current) { // route에 처음 들어온 순간(가드 ref로 1회만)
            resetPath(); // 경로 초기화: pathRef=[], lastSavedRef=null, lastTimeRef=0

            const lat = myPresence?.lat;
            const lng = myPresence?.lng;
            if (lat != null && lng != null) {
                // 첫 점을 강제로 한 번 찍어 둠 (이후 비교 기준점)
                pushPathPoint(lat, lng);  // 내부에서 시간/거리 조건도 보지만, 첫 호출은 보통 통과됨
                lastSavedRef.current = { lat, lng };  // 명시적으로 마지막 저장점 갱신
                lastTimeRef.current = Date.now(); // 마지막 저장 시간 갱신ㄴ
            }

            didInitRouteRef.current = true; // "초기화 완료" 가드 ON > 같은 step에서 다시 실행되지 않도록
        }

        // route 벗어날 때 가드 리셋 (다음에 다시 들어오면 다시 1회 실행)
        if (step !== "route" && didInitRouteRef.current) {
            didInitRouteRef.current = false;
        }
    }, [step, myPresence?.lat, myPresence?.lng, resetPath, pushPathPoint]);

    // 위치가 바뀔 때마다: 시간/거리 조건을 충족하면 경로 포인트 누적
    useEffect(() => {
        if (step !== "route") return; // route가 아니면 경로 누적 중단

        const lat = myPresence?.lat;
        const lng = myPresence?.lng;
        if (lat == null || lng == null) return;

        const now = Date.now();
        const last = lastSavedRef.current; // 마지막으로 저장한 점 { lat, lng } 또는 null

        // 마지막 저장점과의 거리(m). (haversineKm가 이미 있다면 그걸 사용)
        const distM = last ? haversineKm(last, { lat, lng }) * 1000 : Infinity;

        // 시간/거리/최대포인트 조건
        const enoughTime = !lastTimeRef.current || (now - (lastTimeRef.current ?? 0)) >= PATH_MIN_INTERVAL_MS;
        const enoughDist = distM >= PATH_MIN_DIST_M;
        const underLimit = (pathRef.current?.length ?? 0) < PATH_MAX_POINTS;

        // 조건 통과 > 포인트 저장
        if (enoughTime && enoughDist && underLimit) {
            pushPathPoint(lat, lng);  // 내부에서도 동일한 조건(시간/거리/용량)을 한 번 더 체크함
            lastSavedRef.current = { lat, lng };
            lastTimeRef.current = now;
        }
    }, [step, myPresence?.lat, myPresence?.lng, pushPathPoint]);

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