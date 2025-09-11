import { useMemo } from "react";
import { haversineKm } from "utils/geoUtils";

export const useFilteredUserList = ({ otherPresence, filter, myPresence }) => {
    const users = useMemo(() => {
        const entries = Object.entries(otherPresence ?? {});

        return entries.map(([code, p]) => {
            const hasMyLoc = myPresence?.lat != null && myPresence?.lng != null;
            const d = hasMyLoc ? haversineKm(myPresence, p) : null;

            return {
                id: code,
                userName: p.userName,
                lat: p.lat,
                lng: p.lng,
                working: p.working,                       // 핵심 불린
                distanceKm: d == null ? null : Number(d.toFixed(2)), // NaN 방지
            };
        });
    }, [otherPresence, myPresence?.lat, myPresence?.lng]);

    const filtered = useMemo(() => {
        return users.filter((u) => {
            if (filter === "all") return true;
            if (filter === "stable") return !u.working;
            if (filter === "working") return u.working;
            return true;
        });
    }, [users, filter]);

    return filtered
}