import { useQuery } from "@tanstack/react-query";
import { instance } from "apis/instance";
import { useEffect } from "react";
import { Alert } from "react-native";

export const useRunningJobQuery = ({ setStep, runningJobId, setCargoId, setProductId, setProductCount, clearActiveJobId }) => {
    const runningJob = useQuery({
        queryKey: ["runningJob", runningJobId],
        queryFn: async () => await instance.get(`/job/running/${runningJobId}`).then((res) => res.data),
        enabled: !!runningJobId,
        retry: 0,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (!runningJob.isSuccess || !runningJob.data) return;

        const data = runningJob.data;
        const hasCargo = data.cargoId != null;
        const hasProduct = data.productId != null;
        const hasCount = data.productCount != null && !Number.isNaN(Number(data.productCount));

        if (hasCargo) setCargoId(data.cargoId);
        if (hasProduct) setProductId(data.productId);
        if (hasCount) setProductCount(String(data.productCount));
        if (hasCargo && hasProduct && hasCount) setStep("route");
    }, [runningJob.isSuccess, runningJob.data]);

    useEffect(() => {
        if (!runningJob.isError) return;

        const status = runningJob.error?.response?.status;

        if (status === 404) void clearActiveJobId();

        Alert.alert(runningJob.error);
        setStep("form");
    }, [runningJob.isError, runningJob.error, clearActiveJobId]);

    return runningJob
}