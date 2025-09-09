import { useMemo } from "react";
import { haversine } from "utils/geoUtils";

export const useFilteredUserList = ({ presence, userCode, filter, myLocation }) => {
    const users = useMemo(() => {
        const entries = Object.entries(presence);

        return entries
            .filter(([code]) => code !== userCode)
            .map(([code, p]) => {
                const distanceKm =
                    myLocation?.lat != null && myLocation?.lng != null
                        ? Number(haversine(myLocation.lat, myLocation.lng, p.lat, p.lng).toFixed(2))
                        : null;

                return {
                    id: code,
                    userName: p.userName,
                    lat: p.lat,
                    lng: p.lng,
                    working: !!p.working, // 핵심 불린
                    distanceKm,
                };
            });
    }, [presence, userCode, myLocation?.lat, myLocation?.lng]);

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