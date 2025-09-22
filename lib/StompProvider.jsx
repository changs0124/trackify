import { myPresenceAtom, otherPresenceAtom, publishAtom, socketStatusAtom, workingAtom } from "atom/stompAtom";
import { useStompBoostrap } from "hooks/useStompBoostrap";
import { useStompConnection } from "hooks/useStompConnection";
import { useSetAtom } from "jotai";

// Provider
// - Jotai 아톰 setter들을 모아 연결 훅에 전달
// - 실제 연결/워치/구독/핑 로직은 모두 훅으로 이동 > Provider는 트리 상단에서 한 번만 감싸기
function StompProvider({ children }) {
    // Jotai setter 모음: 훅 내부에서 updater 형태로 안전하게 사용
    const setMe = useSetAtom(myPresenceAtom);
    const setOthers = useSetAtom(otherPresenceAtom);
    const setSocketStatus = useSetAtom(socketStatusAtom);
    const setPublish = useSetAtom(publishAtom);
    const setWorkingFn = useSetAtom(workingAtom);

    // Storage에서 userCode를 읽고 준비 상태 반환
    const { ready, userCode } = useStompBoostrap();

    // 연결 라이프사이클 전체 관리
    useStompConnection({ ready, userCode, setMe, setOthers, setSocketStatus, setPublish, setWorkingFn });

    return <>{children}</>; // 상태 주입만 담당
}

export default StompProvider;