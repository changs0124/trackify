import * as Location from 'expo-location';

// 위치 관련 유틸(Expo Location)
// - 초기 좌표 1회 조회
// - 지속 워치 시작 해제

// 최초 진입 시 위치 권한을 요청 > 사용자의 현재 좌표를 1회 반환
// 권환 거부/오류 시 (0,0)을 반환하여 상위 레이어가 안전하게 처리
export const getInitialCoords = async () => {
    let lat = 0, lng = 0;
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            const { coords } = await Location.getCurrentPositionAsync({});
            lat = coords.latitude; lng = coords.longitude;
        }
    } catch (e) {
        console.warn('Location error:', e);
    }
    return { lat, lng };
}

// 지속적인 위치 변화를 구독
// onChange: 자표 변경 콜백
// 구독 핸들
export const startLocationWatch = async (onChange) => {
    try {
        const sub = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.Balanced, // 배터리/정확도 균형
                timeInterval: 4000, // 최소 호출 간견(ms)
                distanceInterval: 5, // 최소 이동거리(m)
            },
            (loc) => {
                const { latitude, longitude } = loc.coords;
                onChange({ lat: latitude, lng: longitude });
            }
        );
        return sub; // sub.remove() 로 해제 가능
    } catch (e) {
        console.warn('watchPosition error:', e);
        return null;
    }
}