import { PUB } from "constants/stompConstants";

// Presence 상태 업데이트 유틸
// - working 토글 시 로컬 아톰과 서버를 일관성 있게 갱신
// - SNAPSHOT/DELTA를 전역 상태로 병합

// setWorking(code, working) 함수를 생성
// - 서버에 퍼블리시하고(my/others) 로컬 상태도 즉시 반영하여 UI 지연 줄임 
export const makeSetWorking = ({ safePublish, setMe, setOthers }) => {
    return function setWorking(code, working) {
        // 서버 알림(성공/실패와 무관하게 로컬은 낙관적 업데이트)
        safePublish(PUB.WORKING, JSON.stringify({ userCode: code, working }));

        if (!code) return;

        // 내 상태 갱신: updater 형태로 이전값 의존 안전 처리
        setMe((prev) => {
            if (prev && prev.userCode === code) {
                return { ...prev, working: !!working };
            }
            return prev;
        });

        // 타 유저 갱신: 존재할 때만 변경(없으면 기존 반환)
        setOthers((prev) => {
            if (!prev[code]) return prev;
            return {
                ...prev,
                [code]: { ...prev[code], working: !!working },
            };
        });
    };
}

// 서버가 내려주는 전체 스냅샷 배열을 others에 병합
// - 자신은 제외: 서버에서 자신을 제외한 나머지를 보내주지만 한번더 검사
// - 기존 덮어쓰기(새로 조인한 유저 추가, 동일 키는 최신값 갱신)
export const mergeSnapshotIntoOthers = ({ array, meCode, setOthers }) => {
    try {
        const meNorm = String(meCode).trim().toLowerCase();
        const map = {};
        (array || [])
            .filter((p) => String(p.userCode).trim().toLowerCase() !== meNorm)
            .forEach((p) => {
                map[p.userCode] = {
                    userCode: p.userCode,
                    userName: p.userName ?? p.userCode,
                    lat: p.lat,
                    lng: p.lng,
                    rtt: p.rtt ?? 0,
                    working: !!p.working,
                };
            });
        setOthers((prev) => ({ ...prev, ...map }));
    } catch (e) {
        console.warn('snapshot parse error:', e);
    }
}

// 증분 이벤트(delta)를 others에 반영
// - LEAVE: 해당 키 유저 키 제거
// - UPDATE/WORKING: 해당 유저 키를 병합(없으면 추가)
export const applyDeltaToOthers = ({ data, setOthers }) => {
    try {
        if (data.type === 'LEAVE') {
            setOthers((prev) => {
                const next = { ...prev };
                delete next[data.userCode];
                return next;
            });
            return;
        }
        setOthers((prev) => ({
            ...prev,
            [data.userCode]: {
                userCode: data.userCode,
                userName: data.userName ?? prev[data.userCode]?.userName ?? data.userCode,
                lat: data.lat ?? prev[data.userCode]?.lat ?? 0,
                lng: data.lng ?? prev[data.userCode]?.lng ?? 0,
                rtt: data.rtt ?? prev[data.userCode]?.rtt ?? 0,
                working: typeof data.working === 'boolean' ? data.working : prev[data.userCode]?.working ?? false,
            },
        }));
    } catch (e) {
        console.warn('delta parse error:', e);
    }
}