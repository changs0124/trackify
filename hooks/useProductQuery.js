import { useQuery } from "@tanstack/react-query";
import { instance } from "apis/instance";
import { useMemo } from "react";

export const useProductQuery = ({ userCode, productId, productCount, myVolume }) => {
    // common
    const products = useQuery({
        queryKey: ["products"],
        queryFn: async () => await instance.get("/products").then((res) => res.data),
        enabled: !!userCode,
        refetchOnWindowFocus: false,
        retry: 0,
    });

    const productList = Array.isArray(products.data) ? products.data : [];

    const hisProductList = useMemo(() => {
        const raw = Array.isArray(products.data) ? products.data : [];
        return [{ id: 0, productName: "all" }, ...raw];
    }, [products.data]);

    const selectedProduct = useMemo(
        () => productList.find((p) => p.id === productId),
        [productList, hisProductList, productId]
    );

    const selectedHisProduct = useMemo(
        () => hisProductList.find((p) => p.id === productId),
        [hisProductList, productId]
    );

    // tabs/job.jsx
    const productUnitVolume = useMemo(() => {
        const v = Number(selectedProduct?.volume);

        return Number.isFinite(v) ? v : null;
    }, [selectedProduct]);

    const totalVolume = useMemo(() => {
        const cnt = Number(productCount);

        if (!productUnitVolume || !Number.isFinite(cnt)) return null;

        return productUnitVolume * cnt;
    }, [productUnitVolume, productCount]);

    const maxAllowedCount = useMemo(() => {
        if (!myVolume || !productUnitVolume || productUnitVolume <= 0) return null;

        return Math.floor(myVolume / productUnitVolume);
    }, [myVolume, productUnitVolume]);

    return { products, productList, hisProductList, selectedProduct, selectedHisProduct, productUnitVolume, totalVolume, maxAllowedCount }
}