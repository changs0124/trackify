export const haversine = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const formatDuration = (ms) => {
    if (!ms || ms < 0) return "-";
    const totalMin = Math.round(ms / 60000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h > 0) return `약 ${h}시간 ${m}분`;
    return `약 ${m}분`;
}

export const parsePaths = (pathsStr) => {
    if (!pathsStr || typeof pathsStr !== "string") return [];
    // 1) JSON 배열 시도
    try {
        const j = JSON.parse(pathsStr);
        if (Array.isArray(j)) {
            return j
                .map((p) => {
                    if (typeof p?.lat === "number" && typeof p?.lng === "number") {
                        return { latitude: p.lat, longitude: p.lng };
                    }
                    if (typeof p?.latitude === "number" && typeof p?.longitude === "number") {
                        return { latitude: p.latitude, longitude: p.longitude };
                    }
                    return null;
                })
                .filter(Boolean);
        }
    } catch (_) {
        // 통과 (다음 포맷 시도)
    }
    // 2) "lat,lng;lat,lng" or 줄바꿈 분리
    const parts = pathsStr
        .split(/[;\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
    const coords = parts
        .map((token) => {
            const [latStr, lngStr] = token.split(",").map((s) => s.trim());
            const lat = Number(latStr);
            const lng = Number(lngStr);
            if (Number.isFinite(lat) && Number.isFinite(lng)) {
                return { latitude: lat, longitude: lng };
            }
            return null;
        })
        .filter(Boolean);
    return coords;
}

/** 좌표 배열의 바운딩 박스로 초기 region 계산 */
export const computeRegion = (coords) => {
    if (!coords?.length) {
        return {
            latitude: 37.5665,
            longitude: 126.9780,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
        };
    }
    let minLat = coords[0].latitude,
        maxLat = coords[0].latitude,
        minLng = coords[0].longitude,
        maxLng = coords[0].longitude;
    for (const c of coords) {
        if (c.latitude < minLat) minLat = c.latitude;
        if (c.latitude > maxLat) maxLat = c.latitude;
        if (c.longitude < minLng) minLng = c.longitude;
        if (c.longitude > maxLng) maxLng = c.longitude;
    }
    const latMid = (minLat + maxLat) / 2;
    const lngMid = (minLng + maxLng) / 2;
    const latDelta = Math.max((maxLat - minLat) * 1.4, 0.01);
    const lngDelta = Math.max((maxLng - minLng) * 1.4, 0.01);
    return { latitude: latMid, longitude: lngMid, latitudeDelta: latDelta, longitudeDelta: lngDelta };
}

/** 소요/경과 시간(ms) 계산: status=2면 endDate - startDate, 그 외는 now - startDate */
export const calcElapsedMs = (startDate, endDate, status) => {
    const s = startDate ? new Date(startDate).getTime() : null;
    const e = endDate ? new Date(endDate).getTime() : null;
    const now = Date.now();
    if (!s) return null;
    if (status === 2 && e) return e - s; // 완료
    return now - s; // 진행중/취소시 경과로 표시(원하면 취소는 "-" 처리 가능)
}

export const haversineDistanceKm = (a, b) => {
    const R = 6371;
    const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
    const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
    const lat1 = (a.latitude * Math.PI) / 180;
    const lat2 = (b.latitude * Math.PI) / 180;
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.asin(Math.sqrt(h));
    return R * c;
}

export const totalPathKm = (coords) => {
    if (!coords || coords.length < 2) return 0;
    let sum = 0;
    for (let i = 1; i < coords.length; i++) sum += haversineDistanceKm(coords[i - 1], coords[i]);
    return Math.round(sum * 10) / 10; // 소수 1자리 반올림
}