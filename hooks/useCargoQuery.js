import { useQuery } from "@tanstack/react-query";
import { instance } from "apis/instance";
import { useMemo } from "react";

export const useCargoQuery = ({ userCode, cargoId }) => {
    const cargos = useQuery({
        queryKey: ["cargos"],
        queryFn: async () => await instance.get("/cargos").then((res) => res.data),
        enabled: !!userCode,
        refetchOnWindowFocus: false,
        retry: 0,
    });

    const cargoList = Array.isArray(cargos.data) ? cargos.data : [];

    const selectedCargo = useMemo(
        () => cargoList.find((c) => c.id === cargoId),
        [cargoList, cargoId]
    );

    return { cargos, cargoList, selectedCargo }
}