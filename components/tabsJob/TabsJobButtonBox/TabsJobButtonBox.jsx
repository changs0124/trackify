import { View } from "react-native";
import { Button } from "react-native-paper";

function TabsJobButtonBox({ setStep, runningJobId, hasRunningJob, cancelJob, pending }) {
    return (
        <>
            {
                hasRunningJob &&
                <View style={{ boxShadow: "borderBox", flexDirection: "row", justifyContent: "space-between", }}>
                    <Button
                        mode="outlined"
                        icon="map"
                        onPress={() => setStep("route")}
                        disabled={pending}
                        labelStyle={{ fontSize: 14, fontWeight: "400" }}
                    >
                        Go to route
                    </Button>
                    <Button
                        mode="contained"
                        icon="cancel"
                        onPress={() => cancelJob.mutate({ jobId: runningJobId })}
                        disabled={pending}
                        labelStyle={{ fontSize: 14, fontWeight: "400" }}
                    >
                        Cancel delivery
                    </Button>
                </View>
            }
        </>
    );
}

export default TabsJobButtonBox;