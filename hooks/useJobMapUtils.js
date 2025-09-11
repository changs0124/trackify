import { useCallback } from "react";

const PATH_MIN_DIST_M = 5;
const PATH_MIN_INTERVAL_MS = 3000;
const PATH_MAX_POINTS = 2000;

export const useJobMapUtils = ({ pathRef, lastSavedRef, lastTimeRef, resetForm }) => {
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

        return R * c;
    }, []);

    const pushPathPoint = useCallback((lat, lng) => {
        const now = Date.now();
        if (now - (lastTimeRef.current ?? 0) < PATH_MIN_INTERVAL_MS) return;

        if (lastSavedRef.current) {
            const d = haversineM(
                lastSavedRef.current.lat,
                lastSavedRef.current.lng,
                lat,
                lng
            );
            if (d < PATH_MIN_DIST_M) return;
        }
        const next = { latitude: lat, longitude: lng, ts: now };

        if (pathRef.current.length >= PATH_MAX_POINTS) {
            pathRef.current.shift();
        }
        pathRef.current.push(next);
        lastSavedRef.current = { lat, lng };
        lastTimeRef.current = now;
    }, [haversineM]);

    const resetPath = useCallback(() => {
        pathRef.current = [];
        lastSavedRef.current = null;
        lastTimeRef.current = 0;
    }, []);

    return { pushPathPoint, resetPath }
}   