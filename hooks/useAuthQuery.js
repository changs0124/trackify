import { useQuery } from "@tanstack/react-query";
import { instance } from "apis/instance";

export const useAuthQuery = (userCode, isChecked) => {
    const enabled = isChecked && !!userCode;
    
    const auth = useQuery({
        queryKey: ["auth", userCode],
        queryFn: async () => await instance.get(`/user/${userCode}`).then(res => res.data),
        enabled: enabled,
        retry: 0,
        refetchOnWindowFocus: false
    })

    return auth;
}