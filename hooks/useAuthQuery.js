import { useQuery } from "@tanstack/react-query";
import { instance } from "apis/instance";

export const useAuthQuery = (userCode, enabledFlags = { isChecked: false }) => {
    const enabled = enabledFlags.isChecked && !!userCode;
    
    const auth = useQuery({
        queryKey: ["auth", userCode],
        queryFn: async () => await instance.get(`/user/${userCode}`).then(res => res.data),
        enabled: enabled,
        retry: 0,
        refetchOnWindowFocus: false
    })

    return auth;
}