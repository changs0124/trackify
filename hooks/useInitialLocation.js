import { useEffect, useMemo, useRef } from "react";

const SEOUL_CITY_HALL = { lat: 37.5665, lng: 126.9780 };

export const useInitialLocation = ({ mapRef, myPresence }) => {
    const focusRef = useRef(false);

    const initialRegion = useMemo(
        () => ({
            latitude: myPresence?.lat ?? SEOUL_CITY_HALL.lat,
            longitude: myPresence?.lng ?? SEOUL_CITY_HALL.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
        }),
        [] // 초기 렌더에만 사용
    );

    useEffect(() => {
        if (
            !focusRef.current &&
            myPresence?.lat != null &&
            myPresence?.lng != null &&
            mapRef.current
        ) {
            focusRef.current = true;
            mapRef.current.animateToRegion(
                {
                    latitude: myPresence.lat,
                    longitude: myPresence.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                },
                600
            );
        }
    }, [myPresence?.lat, myPresence?.lng]);

    return initialRegion
}