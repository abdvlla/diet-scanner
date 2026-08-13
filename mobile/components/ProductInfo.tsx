import { Product } from "@/types/product";
import { getScoreColor } from "@/utils";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Skeleton } from "moti/skeleton";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ProductInfoProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  data: Product | null;
  handleSheetChanges: (index: number) => void;
  isLoading: boolean;
}

export default function ProductInfo({
  bottomSheetRef,
  data,
  handleSheetChanges,
  isLoading,
}: ProductInfoProps) {
  function NutrientRow({
    label,
    value,
    unit,
    isLoading,
  }: {
    label: string;
    value: number | null;
    unit: string;
    isLoading: boolean;
  }) {
    return (
      <View style={styles.nutrientRow}>
        <Text style={styles.nutrientLabel}>{label}</Text>
        {isLoading ? (
          <Skeleton
            colorMode="light"
            colors={skeletonColors}
            width={50}
            height={15}
            radius={4}
          />
        ) : (
          <Text style={styles.nutrientValue}>
            {Math.round(value!)}
            {unit}
          </Text>
        )}
      </View>
    );
  }

  const skeletonColors = ["#E5E3DC", "#EDEBE4", "#E5E3DC"];

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
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["80%"]}
      onChange={handleSheetChanges}
      enablePanDownToClose
    >
      <BottomSheetView style={styles.contentContainer}>
        {(isLoading || data) && (
          <>
            {isLoading ? (
              <Skeleton
                colorMode="light"
                colors={skeletonColors}
                width={180}
                height={22}
                radius={4}
              />
            ) : (
              <Text style={styles.nameText}>
                {data!.name.charAt(0).toUpperCase() + data!.name.slice(1)}
              </Text>
            )}

            <View style={styles.scoreBlock}>
              {isLoading ? (
                <View style={{ marginBottom: 8 }}>
                  <Skeleton
                    colorMode="light"
                    colors={skeletonColors}
                    width={100}
                    height={64}
                    radius={8}
                  />
                </View>
              ) : (
                <Text
                  style={[
                    styles.scoreNumber,
                    { color: getScoreColor(data!.rating.score) },
                  ]}
                >
                  {Math.round(data!.rating.score)}
                </Text>
              )}
              <Text style={styles.scoreLabel}>DIET SCORE</Text>
            </View>

            <Text style={{ marginBottom: -10 }}>
              Per{" "}
              {isLoading
                ? "..."
                : data!.serving_size !== "unknown"
                  ? data!.serving_size
                  : "100g"}
            </Text>
            <View style={styles.thickRule} />

            <View style={styles.nutrientsSection}>
              <NutrientRow
                label="Calories"
                value={
                  isLoading
                    ? null
                    : calculateByServingSize(
                        data!.nutrients.calories,
                        data!.serving_quantity,
                      )
                }
                unit=""
                isLoading={isLoading}
              />
              <NutrientRow
                label="Protein"
                value={
                  isLoading
                    ? null
                    : calculateByServingSize(
                        data!.nutrients.protein,
                        data!.serving_quantity,
                      )
                }
                unit="g"
                isLoading={isLoading}
              />
              <NutrientRow
                label="Carbohydrates"
                value={
                  isLoading
                    ? null
                    : calculateByServingSize(
                        data!.nutrients.carbohydrates,
                        data!.serving_quantity,
                      )
                }
                unit="g"
                isLoading={isLoading}
              />
              <NutrientRow
                label="Fiber"
                value={
                  isLoading
                    ? null
                    : calculateByServingSize(
                        data!.nutrients.fiber,
                        data!.serving_quantity,
                      )
                }
                unit="g"
                isLoading={isLoading}
              />
              <NutrientRow
                label="Sugars"
                value={
                  isLoading
                    ? null
                    : calculateByServingSize(
                        data!.nutrients.sugars,
                        data!.serving_quantity,
                      )
                }
                unit="g"
                isLoading={isLoading}
              />
              <NutrientRow
                label="Saturated Fat"
                value={
                  isLoading
                    ? null
                    : calculateByServingSize(
                        data!.nutrients.saturated_fat,
                        data!.serving_quantity,
                      )
                }
                unit="g"
                isLoading={isLoading}
              />
              <NutrientRow
                label="Sodium"
                value={
                  isLoading
                    ? null
                    : calculateByServingSize(
                        data!.nutrients.sodium * 1000,
                        data!.serving_quantity,
                      )
                }
                unit="mg"
                isLoading={isLoading}
              />
              <NutrientRow
                label="Number of additives"
                value={
                  isLoading
                    ? null
                    : calculateByServingSize(
                        data!.additives_n,
                        data!.serving_quantity,
                      )
                }
                unit=""
                isLoading={isLoading}
              />
            </View>

            <View style={styles.thickRule} />

            <View>
              <Text style={styles.sectionLabel}>INGREDIENTS</Text>
              {isLoading ? (
                <Skeleton
                  colorMode="light"
                  colors={skeletonColors}
                  width={"100%"}
                  height={40}
                  radius={4}
                />
              ) : (
                <Text style={styles.ingredientsText}>
                  {data!.ingredients.length > 0
                    ? data!.ingredients.join(", ")
                    : "No ingredient data available"}
                </Text>
              )}
            </View>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
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
