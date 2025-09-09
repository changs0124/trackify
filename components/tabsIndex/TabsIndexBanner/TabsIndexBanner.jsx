import { useState } from "react";
import { Banner } from "react-native-paper";

function TabsIndexBanner({ myLocation, socketStatus }) {
    const [banner, setBanner] = useState(true);

    return (
        <>
            {
                banner &&
                <Banner
                    visible
                    icon={
                        socketStatus === "connected"
                            ? "access-point-network"
                            : socketStatus === "connecting"
                                ? "lan-pending"
                                : "wifi-off"
                    }
                    actions={[{ label: "close", onPress: () => setBanner(false) }]}
                    style={{ borderRadius: 16 }}
                >
                    {socketStatus === "connected" &&
                        (myLocation
                            ? "Broker connected · My location received"
                            : "Broker connected · Waiting to receive my location")}
                    {socketStatus === "connecting" && "Connecting to broker..."}
                    {socketStatus === "disconnected" &&
                        "Disconnected · Attempting to automatically reconnect"}
                </Banner>
            }
        </>
    );
}

export default TabsIndexBanner;