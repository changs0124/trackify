import { useMutation } from "@tanstack/react-query";
import { instance } from "apis/instance";
import { myPresenceAtom, otherPresenceAtom, socketStatusAtom } from "atom/stompAtom";
import TabHeader from "components/TabHeader/TabHeader";
import TabLayout from "components/TabLayout/TabLayout";
import TabsIndexBanner from "components/tabsIndex/TabsIndexBanner/TabsIndexBanner";
import TabsIndexFilterButton from "components/tabsIndex/TabsIndexFilterButton/TabsIndexFilterButton";
import TabsIndexMapBox from "components/tabsIndex/TabsIndexMapBox/TabsIndexMapBox";
import TabsIndexUserInfoBox from "components/tabsIndex/TabsIndexUserInfoBox/TabsIndexUserInfoBox";
import TabsIndexUserListBox from "components/tabsIndex/TabsIndexUserListBox/TabsIndexUserListBox";
import { useFilteredUserList } from "hooks/useFilteredUserList";
import { useAtomValue } from "jotai";
import { useRef, useState } from "react";

function Index() {
    const myPresence = useAtomValue(myPresenceAtom);
    const otherPresence = useAtomValue(otherPresenceAtom);
    const socketStatus = useAtomValue(socketStatusAtom);

    const mapRef = useRef(null);

    const [filter, setFilter] = useState("all");
    const [visible, setVisible] = useState(false);
    const [selectedUserInfo, setSelectedUserInfo] = useState(null);

    const userInfo = useMutation({
        mutationFn: async (data) => await instance.get(`/job/${data}`).then(res => res.data),
        onSuccess: (res) => setSelectedUserInfo(res),
    });

    const filtered = useFilteredUserList({ otherPresence, filter, myPresence });

    return (
        <>
            <TabHeader title={"Home"} icon={"bell-outline"} />
            <TabLayout>
                <TabsIndexBanner myPresence={myPresence} socketStatus={socketStatus} />
                <TabsIndexFilterButton filter={filter} setFilter={setFilter} />
                <TabsIndexMapBox myPresence={myPresence} mapRef={mapRef} filtered={filtered} />
                <TabsIndexUserListBox mapRef={mapRef} filtered={filtered} setVisible={setVisible} userInfo={userInfo} />
            </TabLayout>
            <TabsIndexUserInfoBox visible={visible} setVisible={setVisible} selectedUserInfo={selectedUserInfo} userInfo={userInfo} />
        </>
    );
}

export default Index;