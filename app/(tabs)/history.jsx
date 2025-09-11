import { useMutation } from "@tanstack/react-query";
import { instance } from "apis/instance";
import { userCodeAtom } from "atom/userAtom";
import CargoMenuBox from "components/common/CargoMenuBox/CargoMenuBox";
import ProductMenuBox from "components/common/ProductMenuBox/ProductMenuBox";
import TabHeader from "components/TabHeader/TabHeader";
import TabLayout from "components/TabLayout/TabLayout";
import TabsHistoryMapBox from "components/tabsHistory/TabsHistoryMapBox/TabsHistoryMapBox";
import TabsHistoryResultBox from "components/tabsHistory/TabsHistoryResultBox/TabsHistoryResultBox";
import TabsHistoryTopCargoBox from "components/tabsHistory/TabsHistoryTopCargoBox/TabsHistoryTopCargoBox";
import { useCargoQuery } from "hooks/useCargoQuery";
import { useProductQuery } from "hooks/useProductQuery";
import { useTopCargoQuery } from "hooks/useTopCargoQuery";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { Button, Card } from "react-native-paper";

function History() {
    const userCode = useAtomValue(userCodeAtom);

    const [cargoId, setCargoId] = useState(null);
    const [productId, setProductId] = useState(null);

    const [isSearching, setIsSearching] = useState(false);
    const [historyList, setHistoryList] = useState([]);

    const [mapVisible, setMapVisible] = useState(false);
    const [mapCoords, setMapCoords] = useState([]);
    const [mapTitle, setMapTitle] = useState("");

    const getHistorys = useMutation({
        mutationFn: async () => {
            const params = {};
            params.cargoId = cargoId;
            params.productId = productId;
            return instance.get("/historys", { params }).then(res => res?.data ?? []);
        },
        onMutate: () => setIsSearching(true),
        onSettled: () => setIsSearching(false),
        onSuccess: (res) => setHistoryList(Array.isArray(res) ? res : [])
    });

    const { cargos, hisCargoList, selectedHisCargo } = useCargoQuery({ userCode, cargoId });
    const { products, hisProductList, selectedHisProduct } = useProductQuery({ userCode, productId });
    const topCargoList = useTopCargoQuery({ userCode });
    
    return (
        <>
            <TabHeader title={"History & Paths"} />
            <TabLayout>
                <Card style={{ borderRadius: 16 }}>
                    <Card.Content style={{ gap: 12 }}>
                        <CargoMenuBox setCargoId={setCargoId} cargos={cargos} cargoList={hisCargoList} selectedCargo={selectedHisCargo} />
                        <ProductMenuBox setProductId={setProductId} products={products} productList={hisProductList} selectedProduct={selectedHisProduct} />
                        <TabsHistoryTopCargoBox setCargoId={setCargoId} topCargoList={topCargoList} />
                        <Button
                            mode="contained"
                            disabled={!selectedHisCargo || !selectedHisProduct}
                            onPress={() => getHistorys.mutateAsync().catch(() => { })}
                            loading={isSearching}
                            style={{ marginBottom: 4 }}
                            labelStyle={{ fontSize: 16, fontWeight: "600" }}
                        >
                            Search
                        </Button>
                    </Card.Content>
                </Card>
                <TabsHistoryResultBox isSearching={isSearching} historyList={historyList} setMapVisible={setMapVisible} setMapCoords={setMapCoords} setMapTitle={setMapTitle} />
            </TabLayout>
            <TabsHistoryMapBox mapVisible={mapVisible} setMapVisible={setMapVisible} mapCoords={mapCoords} setMapCoords={setMapCoords} mapTitle={mapTitle} setMapTitle={setMapTitle} />
        </>
    );
}

export default History;