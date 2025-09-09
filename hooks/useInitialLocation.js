import { useEffect, useMemo, useRef } from "react";

const SEOUL_CITY_HALL = { lat: 37.5665, lng: 126.9780 };

export const useInitialLocation = ({ mapRef, myLocation }) => {
    const focusRef = useRef(false);

    const initialRegion = useMemo(
        () => ({
            latitude: myLocation?.lat ?? SEOUL_CITY_HALL.lat,
            longitude: myLocation?.lng ?? SEOUL_CITY_HALL.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
        }),
        [] // 초기 렌더에만 사용
    );

    useEffect(() => {
        if (
            !focusRef.current &&
            myLocation?.lat != null &&
            myLocation?.lng != null &&
            mapRef.current
        ) {
            focusRef.current = true;
            mapRef.current.animateToRegion(
                {
                    latitude: myLocation.lat,
                    longitude: myLocation.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                },
                600
            );
        }
    }, [myLocation?.lat, myLocation?.lng]);

    return initialRegion
}