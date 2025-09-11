import AsyncStorage from '@react-native-async-storage/async-storage';
import { userCodeAtom } from 'atom/userAtom';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = "userCode";

export const useStoredUserCode = () => {
    const [userCode, setUserCode] = useAtom(userCodeAtom);
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const code = await AsyncStorage.getItem(STORAGE_KEY);
            if (!cancelled) setUserCode(code);
            if (!cancelled) setIsChecked(true);
        })();

        return () => { cancelled = true; };
    }, [setUserCode])

    const save = useCallback(async (code) => {
        await AsyncStorage.setItem(STORAGE_KEY, code);
        setUserCode(code);
        setIsChecked(true);
    }, [setUserCode]);

    const clear = useCallback(async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setUserCode(null);
        setIsChecked(true);
    }, [setUserCode]);

    const refresh = useCallback(async () => {
        const code = await AsyncStorage.getItem(STORAGE_KEY);
        setUserCode(code);
        setIsChecked(true);
    }, [setUserCode]);

    return { userCode, isChecked, save, clear, refresh }
}