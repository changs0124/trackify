import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client } from "@stomp/stompjs";
import { myPresenceAtom, otherPresenceAtom, publishAtom, socketStatusAtom, workingAtom } from "atom/stompAtom";
import * as Location from 'expo-location';
import { useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";

// 웹소켓 엔드포인트: .env에 없으면 로컬 기본값 사용

// STOMP 클라이언트 팩토리
function makeStompClient(url, userCode) {
    return new Client({
        webSocketFactory: () => new WebSocket(url, ['v12.stomp', 'v11.stomp']),
        forceBinaryWSFrames: true,
        appendMissingNULLonIncoming: true,
        connectHeaders: { host: 'renat-local' },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: (msg) => console.log('[STOMP]', msg),
        onWebSocketError: (e) => console.warn('[WS ERROR]', e?.message || e),
        onStompError: (f) => console.warn('[STOMP ERROR]', f?.headers, f?.body),
    });
}

function StompProvider({ children }) {
    const setMe = useSetAtom(myPresenceAtom);
    const setOthers = useSetAtom(otherPresenceAtom);      // 타 유저 모음
    const setSocketStatus = useSetAtom(socketStatusAtom);
    const setPublish = useSetAtom(publishAtom);
    const setWorkingFn = useSetAtom(workingAtom);

    const clientRef = useRef(null);
    const isConnectedRef = useRef(false);
    const pingRef = useRef(null);
    const locationWatchRef = useRef(null);

    const [ready, setReady] = useState(false);
    const [userCode, setUserCode] = useState(null);
    const [userName, setUserName] = useState(null);

    // 안전 퍼블리시
    const safePublish = (destination, body, attempt = 0) => {
        const client = clientRef.current;
        if (!client || !isConnectedRef.current || !client.connected) {
            if (attempt < 3) {
                setTimeout(() => safePublish(destination, body, attempt + 1), 150 * (attempt + 1));
            } else {
                console.warn("[PUBLISH DROPPED] not connected:", destination);
            }
            return;
        }
        try {
            client.publish({ destination, body });
        } catch (err) {
            console.warn("[PUBLISH ERROR]", err?.message || err);
            if (attempt < 3) {
                setTimeout(() => safePublish(destination, body, attempt + 1), 200 * (attempt + 1));
            }
        }
    };

    // working 토글 헬퍼: 내 것/남의 것 구분해서 반영
    const setWorking = (code, working) => {
        safePublish("/app/working", JSON.stringify({ userCode: code, working }));

        if (!code) return;

        setMe((prev) => {
            // 내 계정이면 myPresenceAtom 업데이트
            if (prev && prev.userCode === code) {
                return { ...prev, working: !!working };
            }
            return prev;
        });

        // 타 유저면 presenceAtom 업데이트
        setOthers((prev) => {
            if (!prev[code]) return prev;
            return {
                ...prev,
                [code]: {
                    ...prev[code],
                    working: !!working,
                },
            };
        });
    };

    useEffect(() => {
        setPublish(() => safePublish);
        setWorkingFn(() => setWorking);
    }, []);

    // AsyncStorage에서 userCode, userName 로드
    useEffect(() => {
        (async () => {
            try {
                const code = await AsyncStorage.getItem("userCode");
                setUserCode(code);
            } finally {
                setReady(true);
            }
        })();
    }, []);
    
    const WS_URL = `ws://192.168.0.7:8080/ws?userCode=${encodeURIComponent(userCode)}`;

    // 연결/워치/핑
    useEffect(() => {
        if (!ready || !userCode) return;

        setSocketStatus("connecting");
        console.log("[PRESENCE] Starting with", { userCode, userName, WS_URL });

        let cancelled = false;

        (async () => {
            let lat = 0, lng = 0;
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === "granted") {
                    const { coords } = await Location.getCurrentPositionAsync({});
                    lat = coords.latitude;
                    lng = coords.longitude;
                }
            } catch (e) {
                console.warn("Location error:", e);
            }

            // 내 초기 상태 세팅 (presenceAtom에는 넣지 않음)
            setMe((prev) => ({
                userCode,
                lat,
                lng,
                rtt: prev?.rtt || 0,
                working: prev?.working ?? false,
            }));

            const client = makeStompClient(WS_URL, userCode);
            clientRef.current = client;

            client.onConnect = () => {
                if (cancelled) return;

                console.log("[STOMP] CONNECTED ✅");
                isConnectedRef.current = true;
                setSocketStatus("connected");

                // 1) snapshot
                client.subscribe("/user/queue/presence", (msg) => {
                    try {
                        const arr = JSON.parse(msg.body) || [];
                        // console.log("[SNAPSHOT]", arr)
                        const meNorm = String(userCode).trim().toLowerCase();
                        const map = {};
                        arr
                            .filter((p) => String(p.userCode).trim().toLowerCase() !== meNorm)
                            .forEach((p) => {
                                map[p.userCode] = {
                                    userCode: p.userCode,
                                    userName: p.userName ?? p.userCode,
                                    lat: p.lat,
                                    lng: p.lng,
                                    rtt: p.rtt ?? 0,
                                    working: !!p.working,
                                };
                            });
                        setOthers((prev) => ({ ...prev, ...map }));
                    } catch (e) {
                        console.warn("STOMP snapshot parse error:", e);
                    }
                });

                // 2) 델타(others-only 개인 큐) — 서버가 이미 나를 빼고 보냄
                client.subscribe("/user/queue/events", (msg) => {
                    try {
                        const data = JSON.parse(msg.body);
                        console.log("[CONNECT / UPDATE / WORKING]", data)
                        // LEAVE 이벤트
                        if (data.type === "LEAVE") {
                            setOthers((prev) => {
                                const next = { ...prev };
                                delete next[data.userCode];
                                return next;
                            });
                            return;
                        }

                        // 일반 업데이트(타 유저만 온다)
                        setOthers((prev) => ({
                            ...prev,
                            [data.userCode]: {
                                userCode: data.userCode,
                                userName: data.userName ?? prev[data.userCode]?.userName ?? data.userCode,
                                lat: data.lat ?? prev[data.userCode]?.lat ?? 0,
                                lng: data.lng ?? prev[data.userCode]?.lng ?? 0,
                                rtt: data.rtt ?? prev[data.userCode]?.rtt ?? 0,
                                working:
                                    typeof data.working === "boolean"
                                        ? data.working
                                        : prev[data.userCode]?.working ?? false,
                            },
                        }));
                    } catch (e) {
                        console.warn("STOMP delta parse error:", e);
                    }
                });

                // 초기 connect: 스냅샷 요청 + 내 접속 알림
                setTimeout(() => {
                    safePublish("/app/connect", JSON.stringify({ userCode, userName, lat, lng }));
                    safePublish("/app/presence/snapshot", JSON.stringify({ userCode }));
                }, 300);
                // 위치 watch — 내 상태만 갱신 + 서버로 퍼블리시
                (async () => {
                    try {
                        locationWatchRef.current?.remove?.();
                        locationWatchRef.current = await Location.watchPositionAsync(
                            {
                                accuracy: Location.Accuracy.Balanced,
                                timeInterval: 4000,
                                distanceInterval: 5,
                            },
                            (loc) => {
                                const { latitude, longitude } = loc.coords;

                                // 내 상태 업데이트 (presenceAtom에는 넣지 않음)
                                setMe((prev) => ({
                                    userCode,
                                    userName: prev?.userName || userName || userCode,
                                    lat: latitude,
                                    lng: longitude,
                                    rtt: prev?.rtt || 0,
                                    working: prev?.working ?? false,
                                }));

                                // 서버에 위치 업데이트
                                safePublish(
                                    "/app/update",
                                    JSON.stringify({ userCode, userName, lat: latitude, lng: longitude })
                                );
                            }
                        );
                    } catch (e) {
                        console.warn("watchPosition error:", e);
                    }
                })();

                // ping 주기
                pingRef.current = setInterval(() => {
                    safePublish(
                        "/app/ping",
                        JSON.stringify({ userCode, userName, clientTime: Date.now() })
                    );
                }, 5000);
            };

            client.onWebSocketClose = (e) => {
                console.warn("[WS CLOSED]", e?.code, e?.reason);
                isConnectedRef.current = false;
                setSocketStatus("disconnected");

                if (pingRef.current) clearInterval(pingRef.current);
                pingRef.current = null;

                locationWatchRef.current?.remove?.();
                locationWatchRef.current = null;
            };

            client.activate();
        })();

        return () => {
            cancelled = true;
            setSocketStatus("disconnected");
            isConnectedRef.current = false;

            if (pingRef.current) clearInterval(pingRef.current);
            pingRef.current = null;

            locationWatchRef.current?.remove?.();
            locationWatchRef.current = null;

            clientRef.current?.deactivate();
            clientRef.current = null;
        };
    }, [ready, userCode, userName, setOthers, setMe, setSocketStatus]);

    return <>{children}</>;
}

export default StompProvider;