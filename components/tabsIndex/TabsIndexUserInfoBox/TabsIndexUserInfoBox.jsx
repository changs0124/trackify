import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useCallback } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, Divider, Text } from 'react-native-paper';

function TabsIndexUserInfoBox({ sheetRef, snapPoints, sheetData, userInfo }) {
    const backdrop = useCallback((props) => (
        <BottomSheetBackdrop
            {...props}
            pressBehavior="close"
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            opacity={0.25}
        />
    ), [])

    return (
        <BottomSheet
            ref={sheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
            handleIndicatorStyle={{ backgroundColor: "#bbbbbb" }}
            backdropComponent={backdrop}
        >
            <BottomSheetView style={{ padding: 16, gap: 8 }}>
                {
                    userInfo.isPending &&
                    <View style={{ paddingVertical: 8 }}><ActivityIndicator /></View>
                }

                {
                    !!sheetData &&
                    <>
                        <Text style={{ opacity: 0.8, fontSize: 16, fontWeight: "600" }}>
                            {sheetData.userName || "No userName"}
                        </Text>
                        <Text style={{ opacity: 0.6, fontSize: 14, fontWeight: "400" }}>
                            Model: {sheetData.modelNumber || "-"}
                        </Text>
                        <Text style={{ opacity: 0.6, fontSize: 14, fontWeight: "400" }}>
                            Volume: {sheetData.modelVolume ?? 0}
                        </Text>
                        <Divider />

                        {
                            sheetData?.status === 1
                                ? <View style={{ marginTop: 8 }}>
                                    <Text style={{ marginTop: 8, opacity: 0.6, fontSize: 14, fontWeight: "400" }}>
                                        Cargo: {sheetData.cargoName || "-"}
                                    </Text>
                                    <Text style={{ opacity: 0.6, fontSize: 14, fontWeight: "400" }}>
                                        Product: {sheetData.productName || "-"} x {sheetData.productCount ?? 0}
                                    </Text>
                                    <Text style={{ opacity: 0.6, fontSize: 14, fontWeight: "400" }}>
                                        Volume: {sheetData.productVolume ?? 0}
                                    </Text>
                                </View>
                                : <Text style={{ marginTop: 8, opacity: 0.6, fontSize: 14, fontWeight: "400" }}>
                                    Not in progress
                                </Text>
                        }
                    </>
                }
                {
                    (userInfo.isError && !userInfo.isPending && !sheetData) &&
                    <View style={{ minHeight: 150, justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ opacity: 0.6, fontSize: 14, fontWeight: "400" }}>
                            Failed to retrieve information. Please try again.
                        </Text>
                    </View>
                }
            </BottomSheetView>
        </BottomSheet>
    );
}

export default TabsIndexUserInfoBox;