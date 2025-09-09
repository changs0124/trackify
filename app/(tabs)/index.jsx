import { useMutation } from "@tanstack/react-query";
import { instance } from "apis/instance";
import { presenceAtom, socketStatusAtom } from "atom/stompAtom";
import { userCodeAtom } from "atom/userAtom";
import TabHeader from "components/TabHeader/TabHeader";
import TabLayout from "components/TabLayout/TabLayout";
import TabsIndexBanner from "components/tabsIndex/TabsIndexBanner/TabsIndexBanner";
import TabsIndexFilterButton from "components/tabsIndex/TabsIndexFilterButton/TabsIndexFilterButton";
import TabsIndexMapBox from "components/tabsIndex/TabsIndexMapBox/TabsIndexMapBox";
import TabsIndexUserInfoBox from "components/tabsIndex/TabsIndexUserInfoBox/TabsIndexUserInfoBox";
import TabsIndexUserListBox from "components/tabsIndex/TabsIndexUserListBox/TabsIndexUserListBox";
import { useFilteredUserList } from "hooks/useFilteredUserList";
import { useInitialLocation } from "hooks/useInitialLocation";
import { useAtomValue } from "jotai";
import { useMemo, useRef, useState } from "react";

const SEOUL_CITY_HALL = { lat: 37.5665, lng: 126.9780 };

function index() {
    const userCode = useAtomValue(userCodeAtom);
    const presence = useAtomValue(presenceAtom);
    const socketStatus = useAtomValue(socketStatusAtom);

    const mapRef = useRef(null);
    const sheetRef = useRef(null);

    const [filter, setFilter] = useState("all");
    const [sheetData, setSheetData] = useState(null);

    const snapPoints = useMemo(() => ["28%", "55%"], []);
    const myLocation = useMemo(() => {
        return userCode ? presence[userCode] : undefined;
    }, [presence, userCode]);

    const userInfo = useMutation({
        mutationFn: async (data) => await instance.get(`/job/${data}`).then(res => res.data),
        onSuccess: (res) => setSheetData(res),
    });
  
    const initialRegion = useInitialLocation({ mapRef, myLocation });
    const filtered = useFilteredUserList({ presence, userCode, filter, myLocation });

    return (
        <>
            <TabHeader title={"Home"} icon={"bell-outline"} />
            <TabLayout>
                <TabsIndexBanner myLocation={myLocation} socketStatus={socketStatus} />
                <TabsIndexFilterButton filter={filter} setFilter={setFilter} />
                <TabsIndexMapBox mapRef={mapRef} sheetRef={sheetRef} setSheetData={setSheetData} initialRegion={initialRegion} myLocation={myLocation} filtered={filtered} userInfo={userInfo} />
                <TabsIndexUserListBox mapRef={mapRef} filtered={filtered} />
            </TabLayout>
            <TabsIndexUserInfoBox sheetRef={sheetRef} snapPoints={snapPoints} sheetData={sheetData} userInfo={userInfo} />
        </>

    );
}

export default index;