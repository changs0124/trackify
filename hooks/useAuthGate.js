import { useMemo } from "react";
import { useAuthQuery } from "./useAuthQuery";
import { useStoredUserCode } from "./useStoredUserCode";

export const useAuthGate = () => {
    const { userCode, isChecked, clear } = useStoredUserCode();
    const auth = useAuthQuery(userCode, isChecked);

    const ui = useMemo(() => {
        // 1) 로컬 저장소 확인 전
        if (!isChecked) return { state: "waitingStorage" };

        // 2) 로컬에 userCode 자체가 없음
        if (!userCode) return { state: "noUserCode" };

        // 3) 네트워크 진행중
        if (auth.isLoading || auth.isPending) return { state: "authLoading" };

        // 4) 에러 분기
        if (auth.isError) {
            const status = auth?.error?.response?.status;

            // 저장된 userCode가 서버에 없음
            if (status === 404) {
                return { state: "invalidUserCode", onFix: clear };
            }

            // 토큰/세션 만료 등: 재등록 유도
            if (status === 401 || status === 403) {
                return { state: "needRegister" };
            }

            // 기타 서버 에러
            return { state: "serverError" };
        }

        if (auth.isSuccess) {
            return auth.data ? { state: "authed", data: auth.data } : { state: "invalidUserCode", onFix: clear };
        }

    }, [isChecked, userCode, auth.isLoading, auth.isError, auth.isSuccess, auth.data, auth.error, clear])

    return { ui, userCode, auth };
}