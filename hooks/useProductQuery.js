import { useQuery } from "@tanstack/react-query";
import { instance } from "apis/instance";
import { useMemo } from "react";

export const useProductQuery = ({ userCode, productId }) => {
    const products = useQuery({
        queryKey: ["products"],
        queryFn: async () => await instance.get("/products").then((res) => res.data),
        enabled: !!userCode,
        refetchOnWindowFocus: false,
        retry: 0,
    });

    const productList = Array.isArray(products.data) ? products.data : [];

    const selectedProduct = useMemo(
        () => productList.find((p) => p.id === productId),
        [productList, productId]
    );

    return { products, productList, selectedProduct }
}