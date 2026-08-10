import { Overlay } from "@/components/Overlay";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import { Stack } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Button,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

export default function HomeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState<Product | null>(null);
  const [cameraKey, setCameraKey] = useState(0);

  const barcodeLock = useRef(false);

  const bottomSheetRef = useRef<BottomSheet>(null);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      barcodeLock.current = false;
      setScanned(false);
      setData(null);
      setCameraKey((k) => k + 1);
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

  interface Nutrients {
    calories: number;
    fat: number;
    saturated_fat: number;
    carbohydrates: number;
    sugars: number;
    protein: number;
    fiber: number;
    salt: number;
    sodium: number;
  }

  interface RatingBreakdown {
    energy_points: number;
    sugar_points: number;
    satfat_points: number;
    sodium_points: number;
    fiber_points: number;
    protein_points: number;
  }

  interface Rating {
    score: number;
    breakdown: RatingBreakdown;
  }

  interface Product {
    barcode: string;
    name: string;
    ingredients: string[];
    nutrients: Nutrients;
    rating: Rating;
    serving_quantity: number;
    serving_size: number;
    additives_n: number;
  }

  async function handleBarcodeScanned(
    result: BarcodeScanningResult,
  ): Promise<void> {
    if (barcodeLock.current) return;
    barcodeLock.current = true;
    setScanned(true);

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
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 70) return "#3D7A5C";
    if (score >= 40) return "#D9A441";
    return "#C1473A";
  }

  function NutrientRow({
    label,
    value,
    unit,
  }: {
    label: string;
    value: number;
    unit: string;
  }) {
    return (
      <View style={styles.nutrientRow}>
        <Text style={styles.nutrientLabel}>{label}</Text>
        <Text style={styles.nutrientValue}>
          {value}
          {unit}
        </Text>
      </View>
    );
  }

  function calculateByServingSize(
    nutrition: number,
    serving_quantity?: number,
  ) {
    if (serving_quantity !== undefined && serving_quantity !== null) {
      return (nutrition / 100) * serving_quantity;
    }
    return nutrition;
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
        key={cameraKey}
        onBarcodeScanned={handleBarcodeScanned}
      />
      <Overlay />
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["80%"]}
        onChange={handleSheetChanges}
        enablePanDownToClose
      >
        <BottomSheetView style={styles.contentContainer}>
          {data && (
            <>
              <Text style={styles.nameText}>{data.name}</Text>

              <View style={styles.scoreBlock}>
                <Text
                  style={[
                    styles.scoreNumber,
                    { color: getScoreColor(data.rating.score) },
                  ]}
                >
                  {Math.round(data.rating.score)}
                </Text>
                <Text style={styles.scoreLabel}>DIET SCORE</Text>
              </View>

              <Text style={{ marginBottom: -10 }}>
                Per {data.serving_size ? data.serving_size : "100g"}
              </Text>
              <View style={styles.thickRule} />

              <View style={styles.nutrientsSection}>
                <NutrientRow
                  label="Calories"
                  value={Math.round(
                    calculateByServingSize(
                      data.nutrients.calories,
                      data.serving_quantity,
                    ),
                  )}
                  unit=""
                />
                <NutrientRow
                  label="Protein"
                  value={Math.round(
                    calculateByServingSize(
                      data.nutrients.protein,
                      data.serving_quantity,
                    ),
                  )}
                  unit="g"
                />
                <NutrientRow
                  label="Carbohydrates"
                  value={Math.round(
                    calculateByServingSize(
                      data.nutrients.carbohydrates,
                      data.serving_quantity,
                    ),
                  )}
                  unit="g"
                />
                <NutrientRow
                  label="Fiber"
                  value={Math.round(
                    calculateByServingSize(
                      data.nutrients.fiber,
                      data.serving_quantity,
                    ),
                  )}
                  unit="g"
                />
                <NutrientRow
                  label="Sugars"
                  value={Math.round(
                    calculateByServingSize(
                      data.nutrients.sugars,
                      data.serving_quantity,
                    ),
                  )}
                  unit="g"
                />
                <NutrientRow
                  label="Saturated Fat"
                  value={Math.round(
                    calculateByServingSize(
                      data.nutrients.saturated_fat,
                      data.serving_quantity,
                    ),
                  )}
                  unit="g"
                />
                <NutrientRow
                  label="Sodium"
                  value={Math.round(
                    calculateByServingSize(
                      data.nutrients.sodium * 1000,
                      data.serving_quantity,
                    ),
                  )}
                  unit="mg"
                />
                <NutrientRow
                  label="Number of additives"
                  value={data.additives_n}
                  unit=""
                />
              </View>

              <View style={styles.thickRule} />

              <View>
                <Text style={styles.sectionLabel}>INGREDIENTS</Text>
                <Text style={styles.ingredientsText}>
                  {data.ingredients.length > 0
                    ? data.ingredients.join(", ")
                    : "No ingredient data available"}
                </Text>
              </View>
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  scoreText: {
    fontSize: 40,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 64,
    flexDirection: "row",
    backgroundColor: "transparent",
    width: "100%",
    paddingHorizontal: 64,
  },
  button: {
    flex: 1,
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    backgroundColor: "#FAFAF7",
  },
  nameText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#141414",
    marginBottom: 4,
  },
  scoreBlock: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 64,
    fontWeight: "800",
    lineHeight: 68,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: "#141414",
    marginTop: -4,
  },
  thickRule: {
    height: 3,
    backgroundColor: "#141414",
    marginVertical: 16,
  },
  nutrientsSection: {
    gap: 10,
  },
  nutrientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E3DC",
    paddingBottom: 8,
  },
  nutrientLabel: {
    fontSize: 15,
    color: "#141414",
  },
  nutrientValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#141414",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1.5,
    color: "#141414",
    marginBottom: 8,
  },
  ingredientsText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#3A3A3A",
  },
});
