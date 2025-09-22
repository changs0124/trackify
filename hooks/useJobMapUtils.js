import { useCallback } from "react";

const PATH_MIN_DIST_M = 5;
const PATH_MIN_INTERVAL_MS = 3000;
const PATH_MAX_POINTS = 2000;

export const useJobMapUtils = ({ pathRef, lastSavedRef, lastTimeRef, resetForm }) => {
    // 거리 계산 util: 두 좌표(위/경도) 간 대원거리(m) 반환
    const haversineM = useCallback((lat1, lng1, lat2, lng2) => {
        const R = 6371000;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.asin(Math.sqrt(a));

        return R * c; // 두 점 사이 거리(m)
    }, []);

    // 경로 누적 함수: 시간/거리/용량 조건을 충족할 때만 최근 경로 버퍼에 push
    const pushPathPoint = useCallback((lat, lng) => {
        const now = Date.now();

        // 시간 간격 필터: 마지막 저장 시점 이후 최소 간격 미만이면 저장하지 않음
        if (now - (lastTimeRef.current ?? 0) < PATH_MIN_INTERVAL_MS) return;


        // 거리 필터: 마지막 저장점과의 이동 거리가 너무 짧으면 저장하지 않음
        if (lastSavedRef.current) {
            const d = haversineM(
                lastSavedRef.current.lat,
                lastSavedRef.current.lng,
                lat,
                lng
            );
            if (d < PATH_MIN_DIST_M) return;
        }

        // 저장할 포인트 구성 (지도 Polyline 등에 쓰기 좋은 필드명으로 latitude/longitude 사용)
        const next = { latitude: lat, longitude: lng, ts: now };


        // 용량 관리: 최대 포인트 수를 넘으면 가장 오래된 점을 제거 (슬라이딩 윈도우)
        if (pathRef.current.length >= PATH_MAX_POINTS) {
            pathRef.current.shift();
        }

        // 버퍼에 push + 마지막 저장점/시간 갱신
        pathRef.current.push(next);
        lastSavedRef.current = { lat, lng };
        lastTimeRef.current = now;
    }, [haversineM]);

    // 경로 초기화: route 시작 전 깨끗한 상태로
    const resetPath = useCallback(() => {
        pathRef.current = []; // 버퍼 비우기
        lastSavedRef.current = null; // 마지막 저장점 초기화
        lastTimeRef.current = 0; // 마지막 저장 시각 초기화
    }, []);

    return { pushPathPoint, resetPath }
}   