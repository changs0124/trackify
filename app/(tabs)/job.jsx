import AsyncStorage from "@react-native-async-storage/async-storage";
import { userCodeAtom } from "atom/userAtom";
import CargoMenuBox from "components/common/CargoMenuBox/CargoMenuBox";
import ProductMenuBox from "components/common/ProductMenuBox/ProductMenuBox";
import TabHeader from "components/TabHeader/TabHeader";
import TabLayout from "components/TabLayout/TabLayout";
import TabsJobBanner from "components/tabsJob/TabsJobBanner/TabsJobBanner";
import TabsJobButtonBox from "components/tabsJob/TabsJobButtonBox/TabsJobButtonBox";
import TabsJobMapBox from "components/tabsJob/TabsJobMapBox/TabsJobMapBox";
import TabsJobModalBox from "components/tabsJob/TabsJobModalBox/TabsJobModalBox";
import { useCargoQuery } from "hooks/useCargoQuery";
import { useJobMapUtils } from "hooks/useJobMapUtils";
import { useJobQuery } from "hooks/useJobQuery";
import { useMyInfoQuery } from "hooks/useMyInfoQuery";
import { useProductQuery } from "hooks/useProductQuery";
import { useRunningJobQuery } from "hooks/useRunningJobQuery";
import { useAtomValue } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";

const STORAGE_KEY = "jobId";

function Job() {
    const userCode = useAtomValue(userCodeAtom);

    const pathRef = useRef([]);
    const lastSavedRef = useRef(null);
    const lastTimeRef = useRef(0);

    const [step, setStep] = useState("form");
    const [banner, setBanner] = useState(false);

    const [cargoId, setCargoId] = useState(null);
    const [productId, setProductId] = useState(null);
    const [productCount, setProductCount] = useState(null);
    const productCountNum = Number(productCount);

    const [runningJobId, setRunningJobId] = useState(null);
    const hasRunningJob = !!runningJobId;

    useEffect(() => {
        (async () => {
            const idStr = await AsyncStorage.getItem(STORAGE_KEY);
            
            if (!idStr) return;

            const idNum = Number(idStr);

            if (Number.isNaN(idNum)) {
                await AsyncStorage.removeItem(STORAGE_KEY);
                return;
            }

            setRunningJobId(idNum);
        })();
    }, [])

    const clearActiveJobId = useCallback(async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setRunningJobId(null);
    }, []);

    const { myInfo, myVolume } = useMyInfoQuery({ userCode });
    const { cargos, cargoList, selectedCargo, dest } = useCargoQuery({ userCode, cargoId });
    const { products, productList, selectedProduct, productUnitVolume, totalVolume, maxAllowedCount } = useProductQuery({ userCode, productId, productCount, myVolume });
    const fieldsValid = !!userCode && !!dest && !!selectedProduct && productCountNum > 0;

    const { pushPathPoint, resetPath } = useJobMapUtils({ pathRef, lastSavedRef, lastTimeRef });

    const resetForm = useCallback(() => {
        setStep("form");
        setCargoId(null);
        setProductId(null);
        setProductCount("");
        resetPath();
    }, [resetPath]);

    const runningJob = useRunningJobQuery({ runningJobId, setCargoId, setProductId, setProductCount, setStep, clearActiveJobId });
    const syncing = !!runningJobId && (runningJob.isLoading || runningJob.isFetching);

    const { registerJob, updateJob, cancelJob, completeJob } = useJobQuery({ userCode, setStep, setRunningJobId, clearActiveJobId, resetForm });
    const pending = registerJob.isPending || updateJob.isPending || cancelJob.isPending || completeJob.isPending || runningJob.isFetching;

    const handleStartOrUpdateOnPress = useCallback(() => {
        if (!fieldsValid) return;
        if (myVolume && productUnitVolume && productUnitVolume > 0) {
            const total = productUnitVolume * productCountNum;

            if (total > myVolume) {
                const capped = Math.max(0, Math.floor(myVolume / productUnitVolume));
                Alert.alert(
                    "Capacity exceeded",
                    `The selected quantity exceeds your device capacity.\n\nMax allowed: ${capped}`,
                    [{ text: "OK" }]
                );
                setProductCount(String(capped));
                return;
            }
        }
        const base = { cargoId, productId, productCount: productCountNum, paths: "[]" };
        hasRunningJob
            ? updateJob.mutate({ ...base, jobId: runningJobId })
            : registerJob.mutate({
                userCode,
                cargoId,
                productId,
                productCount: productCountNum,
            });
    }, [userCode, cargoId, productId, runningJobId, hasRunningJob, myVolume, registerJob, updateJob, productUnitVolume, fieldsValid])

    return (
        <>
            <TabHeader title={"Job"} icon={"information-outline"} onPress={() => setBanner((v) => !v)} />
            {
                step === "form"
                    ? <TabLayout>
                        <TabsJobBanner banner={banner} setBanner={setBanner} runningJobId={runningJobId} hasRunningJob={hasRunningJob} />
                        <Card style={{ borderRadius: 16 }}>
                            <Card.Content style={{ gap: 12 }}>
                                <CargoMenuBox setCargoId={setCargoId} cargos={cargos} cargoList={cargoList} selectedCargo={selectedCargo} />
                                <ProductMenuBox setProductId={setProductId} products={products} productList={productList} selectedProduct={selectedProduct} />
                                <TextInput
                                    label="Quantity"
                                    placeholder="Enter numbers"
                                    value={productCount}
                                    onChangeText={setProductCount}
                                    keyboardType="numeric"
                                    left={<TextInput.Icon icon="counter" />}
                                    disabled={pending}
                                    style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, opacity: 0.8, fontSize: 16, fontWeight: "600", }}
                                />
                                {
                                    (myVolume || productUnitVolume) &&
                                    <Text style={{ marginBottom: 4, paddingLeft: 4, opacity: 0.6, fontSize: 14, fontWeight: 400, }}>
                                        {myVolume ? `Capacity: ${myVolume}` : ""}
                                        {myVolume && productUnitVolume ? " · " : ""}
                                        {productUnitVolume ? `Unit Volume: ${productUnitVolume}` : ""}
                                        {typeof maxAllowedCount === "number" ? ` · Max Qty: ${maxAllowedCount}` : ""}
                                    </Text>
                                }
                                <Button
                                    mode="contained"
                                    disabled={!fieldsValid || pending}
                                    onPress={handleStartOrUpdateOnPress}
                                    style={{ marginBottom: 4 }}
                                    labelStyle={{ fontSize: 16, fontWeight: "600" }}
                                >
                                    {
                                        (registerJob.isPending || updateJob.isPending)
                                            ? hasRunningJob ? "Updating..." : "Starting..."
                                            : hasRunningJob ? "Update" : "Start"
                                    }
                                </Button>
                                <TabsJobButtonBox setStep={setStep} runningJobId={runningJobId} hasRunningJob={hasRunningJob} cancelJob={cancelJob} pending={pending} />
                            </Card.Content>
                        </Card>
                    </TabLayout >
                    : <TabsJobMapBox
                        pathRef={pathRef}
                        lastSavedRef={lastSavedRef}
                        lastTimeRef={lastTimeRef}
                        step={step}
                        setStep={setStep}
                        productCount={productCount}
                        runningJobId={runningJobId}
                        hasRunningJob={hasRunningJob}
                        pushPathPoint={pushPathPoint}
                        resetPath={resetPath}
                        selectedProduct={selectedProduct}
                        completeJob={completeJob}
                        dest={dest}
                        pending={pending}

                    />
            }
            <TabsJobModalBox syncing={syncing} />
        </>
    );
}

export default Job;