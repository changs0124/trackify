import { Banner, Text } from "react-native-paper";

function TabsJobBanner({ banner, setBanner, runningJobId, hasRunningJob }) {
    return (
        <>
            {
                banner &&
                <Banner
                    visible
                    icon="lightbulb-on-outline"
                    actions={[{ label: "Close", onPress: () => setBanner(false) }]}
                    style={{ borderRadius: 16 }}
                >
                    After selecting Cargo, Product, and Quantity, press{" "}
                    <Text style={{ fontWeight: "bold" }}>
                        {hasRunningJob ? "Update" : "Start"}
                    </Text>{" "}
                    to proceed to the map.
                    {
                        hasRunningJob &&
                        <Text> (Active Job ID: {runningJobId})</Text>
                    }
                </Banner>
            }
        </>
    );
}

export default TabsJobBanner;