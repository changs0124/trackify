import { TIMING } from "constants/stompConstants";

// 안전 퍼블리시(safePublish) 유틸
// - 연결 상태가 아닐 때 자동 재시도
// - 예외 발생 시에도 재시도(백오프)
// - 연결 직후 타이밍 경합으로 인한 초기 손실 줄임

// clientRef: STOMP Client Ref
// isConnectedRef: 연결 여부 Ref
// destination, body, attempt: 각 보낼 경로, 무엇을 담아서 보낼지, 시도 횟수
export const makeSafePublish = (clientRef, isConnectedRef) => {
    const safePublish = (destination, body, attempt = 0) => {
        const client = clientRef.current;
        const connected = !!(client && isConnectedRef.current && client.connected);

        // 아직 연결 전이면 선형 백오프 기반 재시도
        if (!connected) {
            if (attempt < TIMING.publishRetryMaxAttempts) {
                setTimeout(
                    () => safePublish(destination, body, attempt + 1),
                    TIMING.publishRetryBaseMs * (attempt + 1)
                );
            } else {
                console.warn('[PUBLISH DROPPED] not connected:', destination);
            }
            return;
        }

        // 연결되어 있으면 퍼블리시 시도
        try {
            client.publish({ destination, body });
        } catch (err) {
            // 퍼블리시 중 예외 발생 시 재시도(별도 백오프)
            console.warn('[PUBLISH ERROR]', err?.message || err);
            if (attempt < TIMING.publishRetryMaxAttempts) {
                setTimeout(
                    () => safePublish(destination, body, attempt + 1),
                    TIMING.publishRetryOnErrorBaseMs * (attempt + 1)
                );
            }
        }
    };

    return safePublish;
}