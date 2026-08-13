import { Overlay } from "@/components/Overlay";
import ProductInfo from "@/components/ProductInfo";
import { Product } from "@/types/product";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { Stack, useFocusEffect } from "expo-router";
import { setStatusBarStyle, StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { Button, Platform, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [data, setData] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [flashMode, setFlashMode] = useState(false);

  const barcodeLock = useRef(false);
  const bottomSheetRef = useRef<BottomSheet>(null);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
    }, []),
  );

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      barcodeLock.current = false;
      setData(null);
      console.log("barcode lock", barcodeLock.current);
    }
  }, []);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const toggleFlashMode = () => {
    setFlashMode(!flashMode);
  };

  async function handleBarcodeScanned(
    result: BarcodeScanningResult,
  ): Promise<void> {
    if (barcodeLock.current) return;
    barcodeLock.current = true;
    setFlashMode(false);
    setIsLoading(true);
    bottomSheetRef.current?.expand();

    console.log("Scanned:", result.data);
    const barcode = result.data;
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/products/${barcode}`,
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const product_data = await response.json();
      setData(product_data);
      bottomSheetRef.current?.expand();
      console.log(product_data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Stack.Screen
        options={{
          title: "Scan",
          headerShown: false,
        }}
      />
      {Platform.OS === "android" ? <StatusBar hidden /> : null}
      <CameraView
        style={styles.camera}
        facing={"back"}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
        }}
        onBarcodeScanned={handleBarcodeScanned}
        enableTorch={flashMode}
        // zoom={0.1}
      />
      <Overlay toggleFlashMode={toggleFlashMode} flashMode={flashMode} />
      <ProductInfo
        isLoading={isLoading}
        handleSheetChanges={handleSheetChanges}
        data={data}
        bottomSheetRef={bottomSheetRef}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
});
