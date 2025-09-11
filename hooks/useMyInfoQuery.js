import { useQuery } from "@tanstack/react-query";
import { instance } from "apis/instance";
import { useMemo } from "react";

export const useMyInfoQuery = ({ userCode }) => {
    const myInfo = useQuery({
        queryKey: ["myInfo", userCode],
        queryFn: async () =>
            await instance.get(`/user/my/${userCode}`).then((res) => res.data),
        enabled: !!userCode,
        retry: 0,
        refetchOnWindowFocus: false,
    });

    const myVolume = useMemo(() => {
        const v = Number(myInfo?.data?.modelVolume);
        return Number.isFinite(v) ? v : null;
    }, [myInfo?.data]);

    return { myInfo, myVolume }
}