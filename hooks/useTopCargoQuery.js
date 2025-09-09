import { useQuery } from "@tanstack/react-query";
import { instance } from "apis/instance";

export const useTopCargoQuery = ({ userCode }) => {
    const topCargos = useQuery({
        queryKey: ["topCargos"],
        queryFn: async () => await instance.get("/cargos/top").then((res) => res.data),
        enabled: !!userCode,
        refetchOnWindowFocus: false,
        retry: 0,
    });

    const topCargoList = Array.isArray(topCargos.data) ? topCargos.data : [];

    return topCargoList;
}