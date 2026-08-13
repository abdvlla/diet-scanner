import ProductInfo from "@/components/ProductInfo";
import { Product } from "@/types/product";
import BottomSheet from "@gorhom/bottom-sheet";
import { useFocusEffect, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { Skeleton } from "moti/skeleton";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function getScoreColor(score: number): string {
  if (score >= 70) return "#3D7A5C";
  if (score >= 40) return "#D9A441";
  return "#C1473A";
}

const skeletonColors = ["#E5E3DC", "#EDEBE4", "#E5E3DC"];

function HistorySkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={styles.item}>
          <Skeleton
            colorMode="light"
            colors={skeletonColors}
            width={"60%"}
            height={18}
            radius={4}
          />
          <Skeleton
            colorMode="light"
            colors={skeletonColors}
            width={32}
            height={22}
            radius={4}
          />
        </View>
      ))}
    </>
  );
}

export default function History() {
  const [products, setProducts] = React.useState<Product[] | null>(null);
  const [product, setProduct] = React.useState<Product | null>(null);
  const [isLoading, setLoading] = React.useState(true);
  const [isLoadingProduct, setLoadingProduct] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const bottomSheetRef = React.useRef<BottomSheet>(null);

  useFocusEffect(
    React.useCallback(() => {
      setStatusBarStyle("dark");
    }, []),
  );

  const router = useRouter();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/products/`,
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const products = await response.json();
      setProducts(products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProducts();
    }, []),
  );

  const fetchProductByBarcode = async (barcode: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/products/${barcode}`,
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const product_data = await response.json();
      setProduct(product_data);
      bottomSheetRef.current?.expand();
      console.log(product_data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleSheetChanges = React.useCallback((index: number) => {
    if (index === -1) {
      setProduct(null);
    }
  }, []);

  function handleDisplaySheet(barcode: string) {
    setLoadingProduct(true);
    bottomSheetRef.current?.expand();
    fetchProductByBarcode(barcode);
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.header}>SCAN HISTORY</Text>

        {isLoading && <HistorySkeleton />}

        {!isLoading && error && (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyText}>
              Couldn&apos;t load your history: {error}
            </Text>
            <TouchableOpacity style={styles.scanButton} onPress={fetchProducts}>
              <Text style={styles.scanButtonText}>Reload history</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !error && products?.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyText}>No scanned items yet.</Text>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => router.push("/")}
            >
              <Text style={styles.scanButtonText}>Scan your first product</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading &&
          !error &&
          products?.map((item) => (
            <TouchableOpacity
              key={item.barcode}
              style={styles.item}
              onPress={() => handleDisplaySheet(item.barcode)}
            >
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <Text
                style={[
                  styles.score,
                  { color: getScoreColor(item.rating.score) },
                ]}
              >
                {Math.round(item.rating.score)}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
      <ProductInfo
        isLoading={isLoadingProduct}
        handleSheetChanges={handleSheetChanges}
        data={product}
        bottomSheetRef={bottomSheetRef}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAF7" },
  content: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  header: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: "#141414",
    marginBottom: 16,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E3DC",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#141414",
    flex: 1,
    marginRight: 12,
  },
  score: { fontSize: 22, fontWeight: "800" },
  emptyText: {
    fontSize: 14,
    color: "#3A3A3A",
    textAlign: "center",
    marginTop: 40,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 200,
    gap: 16,
  },
  scanButton: {
    backgroundColor: "#141414",
    padding: 14,
    borderRadius: 22,
  },
  scanButtonText: {
    color: "#FAFAF7",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
