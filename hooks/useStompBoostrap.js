import AsyncStorage from "@react-native-async-storage/async-storage";
import { userCodeAtom } from "atom/userAtom";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

// 부트스트랩: AsyncStorage에서 사용자 식별정보를 읽고 준비 완료 플래그 제공
// - ready: 저장소 IO가 끝났음을 의미(값 존재 여부와 무관)
// - userCode: 이후 연결 훅에서 사용
export const useStompBoostrap = () => {
    const [userCode, setUserCode] = useAtom(userCodeAtom);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const code = await AsyncStorage.getItem('userCode');
                setUserCode(code);
            } finally {
                // 에러여도 준비 완료(상위에서 userCode의 여부에 따라 등록페이지나 메인페이지로 이동)
                setReady(true);
            }
        })();
    }, []);

    return { ready, userCode };
}