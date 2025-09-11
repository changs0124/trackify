import { useQuery } from "@tanstack/react-query";
import { instance } from "apis/instance";
import { useMemo } from "react";

export const useCargoQuery = ({ userCode, cargoId }) => {
    //common
    const cargos = useQuery({
        queryKey: ["cargos"],
        queryFn: async () => await instance.get("/cargos").then((res) => res.data),
        enabled: !!userCode,
        refetchOnWindowFocus: false,
        retry: 0,
    });

    const cargoList = Array.isArray(cargos.data) ? cargos.data : [];

    const hisCargoList = useMemo(() => {
        const raw = Array.isArray(cargos.data) ? cargos.data : [];
        return [{ id: 0, cargoName: "all" }, ...raw];
    }, [cargos.data]);

    const selectedCargo = useMemo(
        () => cargoList.find((c) => c.id === cargoId),
        [cargoList, hisCargoList, cargoId]
    );

    const selectedHisCargo = useMemo(
        () => hisCargoList.find((c) => c.id === cargoId),
        [hisCargoList, cargoId]
    );

    // tabs/job.jsx
    const dest = useMemo(() => {
        if (!selectedCargo) return null;

        const lat = Number(selectedCargo.lat);
        const lng = Number(selectedCargo.lng);

        if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

        return {
            id: selectedCargo.id,
            label: selectedCargo.cargoName ?? `Cargo #${selectedCargo.id}`,
            lat,
            lng,
        };
    }, [selectedCargo]);

    return { cargos, cargoList, hisCargoList, selectedCargo, selectedHisCargo, dest }
}