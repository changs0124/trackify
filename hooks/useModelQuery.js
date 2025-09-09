import { useQuery } from "@tanstack/react-query";
import { instance } from "apis/instance";
import { useEffect, useMemo, useState } from "react";

export const useModelQuery = () => {
    const [selectedId, setSelectedId] = useState(0);

    const models = useQuery({
        queryKey: ["models"],
        queryFn: async () => instance.get("/models").then(res => res.data),
        enabled: true,
        retry: 0,
        refetchOnWindowFocus: false
    });

    useEffect(() => {
        if(models.isSuccess && models.data?.length > 0 && setSelectedId === 0) {
            setSelectedId(models.data[0].id);
        }
    }, [models.isSuccess, models.data, selectedId])

    const selectedModel = useMemo(
        () => models.data?.find(m => m.id === selectedId) ?? null,
        [models?.data, selectedId]
    );

    return {models, selectedId, setSelectedId, selectedModel};
}