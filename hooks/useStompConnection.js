import { PUB, SUB, TIMING, WS_BASE_URL } from "constants/stompConstants";
import { useEffect, useRef } from "react";
import { getInitialCoords, startLocationWatch } from "utils/location";
import { makeSafePublish } from "utils/makeSafePublish";
import { makeStompClient } from "utils/makeStompClient";
import { applyDeltaToOthers, makeSetWorking, mergeSnapshotIntoOthers } from "utils/presenceStore";

// 연결: Presence 라이프사이클 전체 관리
// 1. ready && userCode가 준비될 때까지 대기
// 2. 초기 좌표 1회 조회 후 내 로컬 상태 세팅(setMe)
// 3. STOMP Client 생성 및 safePublish/setWorking 함수 주입
// 4. SNAPSHOT/DELTA 구독 > setOthers 상태 갱신
// 5. CONNECT/PRESENCE SNAPSHOT 요청
// 6. 위치 워치 시작 > setMe 업데이트 + 서버 UPDATE PUBLISH
// 7. PING 주기 시작
// 8. 언마운트/의존 변경 시 정리(client.deactivate, 타이머/워치 해제)

// setPublish: 안전 퍼블리시 함수 주입
// setWorking: setWorkingFn 함수 주입
export const useStompConnection = ({ ready, userCode, setMe, setOthers, setSocketStatus, setPublish, setWorkingFn }) => {
    // 외부 노출이 없는 내부제어 Ref
    const clientRef = useRef(null);
    const isConnectedRef = useRef(false);
    const pingRef = useRef(null);
    const locationWatchRef = useRef(null);

    useEffect(() => {
        if (!ready || !userCode) return; // 준비 전에는 아무 것도 하지 않음

        setSocketStatus("connecting");
        const url = `${WS_BASE_URL}?userCode=${encodeURIComponent(userCode)}`;
        console.log("[PRESENCE] Starting with", { userCode, url });

        let cancelled = false; // effect 중첩 방지 플래그

        (async () => {
            // 1. 초기좌표 1회 조회(권한 없으면 0,0)
            const { lat, lng } = await getInitialCoords();

            // 2. 내 로컬 상태만 세팅(others에는 미반영)
            setMe((prev) => ({
                userCode,
                lat,
                lng,
                rtt: prev?.rtt || 0,
                working: prev?.working ?? false,
            }));

            // 3. STOMP Client 생성 및 안전 퍼블리시/세터 주입
            const client = makeStompClient(url, userCode);
            clientRef.current = client;

            const safePublish = makeSafePublish(clientRef, isConnectedRef);
            setPublish(() => safePublish); // setPublish 상태에 함수 주입 > 전역에서 사용 가능

            const setWorking = makeSetWorking({ safePublish, setMe, setOthers });
            setWorkingFn(() => setWorking); // setWorking 상태에 함수 주입 > 전역에서 사용 가능

            // 4. 연결 성공 시 구독/퍼블리시/워치/핑 설정
            client.onConnect = () => {
                if (cancelled) return;

                console.log("[STOMP] CONNECTED ✅");
                isConnectedRef.current = true;
                setSocketStatus("connected");

                // SNAPSHOT: 전체 접속자(본인 제외)를 setOthers에 병합
                client.subscribe(SUB.SNAPSHOT, (msg) => {
                    const arr = JSON.parse(msg.body || '[]');
                    mergeSnapshotIntoOthers({ array: arr, meCode: userCode, setOthers });
                });

                // 2) DELTA: 조인/업데이트/워킹/리브 등 증분 반영
                client.subscribe(SUB.EVENTS, (msg) => {
                    const data = JSON.parse(msg.body || '{}');
                    applyDeltaToOthers({ data, setOthers });
                });

                // 초기 알림 + 스냅샷 요청(셋타임아웃으로 여유있게 서버 준비)
                setTimeout(() => {
                    safePublish(PUB.CONNECT, JSON.stringify({ userCode, lat, lng }));
                    safePublish(PUB.SNAPSHOT, JSON.stringify({ userCode }));
                }, TIMING.snapshotDelay);

                // 위치 워치 시작: setMe 상태 업데이트 + 서버 UPDATE 퍼블리시
                (async () => {
                    if (locationWatchRef.current?.remove) {
                        locationWatchRef.current.remove();
                    }
                    locationWatchRef.current = await startLocationWatch(({ lat: nlat, lng: nlng }) => {
                        setMe((prev) => ({
                            userCode,
                            lat: nlat,
                            lng: nlng,
                            rtt: prev?.rtt || 0,
                            working: prev?.working ?? false,
                        }));
                        safePublish(PUB.UPDATE, JSON.stringify({ userCode, lat: nlat, lng: nlng }));
                    });
                })();

                // PING 루프 시작(서버 RTT/세션 활성 유지)
                pingRef.current = setInterval(() => {
                    safePublish(PUB.PING, JSON.stringify({ userCode, clientTime: Date.now() }));
                }, TIMING.pingInterval);
            };

            // 5. 소켓이 닫혔을 때 정리 및 상태 전이
            client.onWebSocketClose = (e) => {
                console.warn("[WS CLOSED]", e?.code, e?.reason);
                isConnectedRef.current = false;
                setSocketStatus("disconnected");

                if (pingRef.current) clearInterval(pingRef.current);
                pingRef.current = null;

                if (locationWatchRef.current?.remove) {
                    locationWatchRef.current.remove();
                }
                locationWatchRef.current = null;
            };

            // 실제 연결 시작
            client.activate();
        })();

        // 6. 언마운트/의존 변경 시 완전한 정리(메모리/배터리 누수 방지)
        return () => {
            cancelled = true;
            setSocketStatus("disconnected");
            isConnectedRef.current = false;

            if (pingRef.current) clearInterval(pingRef.current);
            pingRef.current = null;

            if (locationWatchRef.current?.remove) {
                locationWatchRef.current.remove();
            }
            locationWatchRef.current = null;

            clientRef.current?.deactivate();
            clientRef.current = null;
        };
    }, [ready, userCode, setMe, setOthers, setSocketStatus, setPublish, setWorkingFn]);
}