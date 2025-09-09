import { useMemo } from "react";
import { useAuthQuery } from "./useAuthQuery";
import { useStoredUserCode } from "./useStoredUserCode";

export const useAuthGate = () => {
    const { userCode, isChecked, clear } = useStoredUserCode();
    const auth = useAuthQuery(userCode, { isChecked });

    const ui = useMemo(() => {
        if (!isChecked) return { state: "waitingStorage" };

        if (!userCode) return { state: "noUserCode" };

        if (auth.isLoading) return { state: "authLoading" };

        if (auth.isError) {
            const status = auth?.error?.response?.status;

            if (status === 404) {
                return { state: "invalidUserCode", onFix: clear };
            }

            return {
                state: "serverError"
            };
        }

        if (auth.isSuccess && auth.data) return { state: "authed", data: auth.data };

        return { state: "needRegister" };
    }, [isChecked, userCode, auth.isLoading, auth.isError, auth.isSuccess, auth.data, auth.error, clear])

    return { ui, userCode, auth };
}