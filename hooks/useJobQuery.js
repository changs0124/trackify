import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { instance } from "apis/instance";
import { workingAtom } from "atom/stompAtom";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { Alert } from "react-native";

const STORAGE_KEY = "jobId";

export const useJobQuery = ({ userCode, setStep, setRunningJobId, clearActiveJobId, resetForm }) => {
    const setWorking = useAtomValue(workingAtom);

    const saveActiveJobId = useCallback(async (id) => {
        await AsyncStorage.setItem(STORAGE_KEY, String(id));
        setRunningJobId(Number(id));
    }, []);

    const registerJob = useMutation({
        mutationFn: async (payload) => await instance.post("/job/register", payload).then(res => res.data),
        onSuccess: async (res) => {
            const jobId =
                typeof res === "number" ? res : null;

            if (jobId == null) return;
            await saveActiveJobId(jobId);

            if (typeof setWorking === "function") {
                setWorking(userCode, true); // working=true 선반영 + /app/working 전송
            } else {
                console.warn(
                    "setWorking helper is not ready. Did you wrap with PresenceProvider?"
                );
            }
            setStep("route");
        },
        onError: (err) => Alert.alert(err?.response?.data?.message)
    });

    const updateJob = useMutation({
        mutationFn: (payload) =>
            instance.put("/job/update", payload).then((res) => res.data),
        onSuccess: () => setStep("route"),
        onError: (err) => Alert.alert(err?.response?.data?.message)
    });

    const cancelJob = useMutation({
        mutationFn: ({ jobId }) =>
            instance.put(`/job/cancel/${jobId}`).then((res) => res.data),
        onSuccess: async () => {
            await clearActiveJobId();

            if (typeof setWorking === "function") {
                setWorking(userCode, false);
            } else {
                console.warn(
                    "setWorking helper is not ready. Did you wrap with PresenceProvider?"
                );
            }
            resetForm();
        },
        onError: (err) => Alert.alert(err?.response?.data?.message)
    });

    const completeJob = useMutation({
        mutationFn: ({ jobId, paths }) =>
            instance.put("/job/complete", { jobId, paths }).then((res) => res.data),
        onSuccess: async () => {
            await clearActiveJobId();

            if (typeof setWorking === "function") {
                setWorking(userCode, false);
            } else {
                console.warn(
                    "setWorking helper is not ready. Did you wrap with PresenceProvider?"
                );
            }
            resetForm();
        },
        onError: (err) => Alert.alert(err?.response?.data?.message)
    });

    return { registerJob, updateJob, cancelJob, completeJob }
}