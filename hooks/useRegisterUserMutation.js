import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { instance } from "apis/instance";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import uuid from 'react-native-uuid';

const STORAGE_KEY = "userCode";

export const registerUserMutation = () => {
    const router = useRouter();

    const register = useMutation({
        mutationFn: async ({ userName, modelId }) => {
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") throw new Error("Location permission denied.");

            const userCode = uuid.v4().toString();
            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            const res = await instance.post("/user", {
                userCode,
                userName,
                modelId,
                lat: latitude,
                lng: longitude
            }).then(res => res.data)

            return { res, userCode }
        },
        onSuccess: async (data) => {
            await AsyncStorage.setItem(STORAGE_KEY, data.userCode);
            Alert.alert(
                data?.res,
                "",
                [
                    { text: "확인", onPress: () => router.replace("/") }, // ← 여기서 이동
                ],
                { cancelable: false }
            )
        },
        onError: (err) => {
            Alert.alert(err?.response?.data?.message)
        }
    });

    return register
}